import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import { EnterpriseInfo } from '../hooks'

// 存储键映射
const realNameStorageKeyMap = Object.freeze({
  forceVerifyObj: 'verify_state_forceVerifyObj',
  originFromQuery: 'verify_state_originFromQuery',
  personInfo: 'verify_state_personInfo',
  enterpriseInfo: 'verify_state_enterpriseInfo',
  personal: 'auth_personal',
  enterprise: 'auth_enterprise',
  authShow: 'auth_Show',
} as const)

// 强制认证对象类型
interface ForceVerifyObj {
  orderPageSource?: string // 下单页的来源，single: 单票，batch: 批量
  uniqueId?: string // 强制认证唯一标识
  forceFlag?: string // 是否开启强制开关，'10': 关闭，'20': 开启
  otherPhone?: string // 他人手机号，采用前端base64加密
  idName?: string // 姓名
  isFromShare?: string // 是否下单分享
  isFromBaqiang?: string // 是否巴枪扫码实名
}

// 个人信息类型
interface PersonInfo {
  isSupportForeignOCR?: boolean
}

// 认证数据类型
interface AuthData {
  personal?: string // 个人认证状态
  enterprise?: string // 企业认证状态
  enterpriseInfo?: EnterpriseInfo
}

// 验证数据类型
interface VerifyData {
  originFromQuery?: string // origin: order_submit order_page
  forceVerifyObj?: ForceVerifyObj // 强制实名认证个人信息
  personInfo?: PersonInfo
}

// Store 状态类型
interface RealNameState extends AuthData, VerifyData {
  authShow?: boolean
}

/**
 * 存储操作工具类
 */
class StorageManager {
  /** 从 sessionStorage 读取数据 */
  static get<T>(key: string): T | undefined {
    try {
      const value = Taro.getStorageSync(key)
      return value !== undefined && value !== null ? value : undefined
    } catch (error) {
      console.error(`从 sessionStorage 读取 ${key} 失败:`, error)
      return undefined
    }
  }

  /** 保存数据到 sessionStorage */
  static set<T>(key: string, value: T): boolean {
    try {
      Taro.setStorageSync(key, value)
      return true
    } catch (error) {
      console.error(`保存 ${key} 到 sessionStorage 失败:`, error)
      return false
    }
  }

  /** 从 sessionStorage 删除数据 */
  static remove(key: string): boolean {
    try {
      Taro.removeStorageSync(key)
      return true
    } catch (error) {
      console.error(`从 sessionStorage 删除 ${key} 失败:`, error)
      return false
    }
  }

  /** 批量获取存储数据 */
  static batchGet<T>(keys: string[]): Record<string, T | undefined> {
    const result: Record<string, T | undefined> = {}
    keys.forEach((key) => {
      result[key] = this.get<T>(key)
    })
    return result
  }

  /** 批量设置存储数据 */
  static batchSet<T>(data: Record<string, T>): boolean {
    let success = true
    Object.entries(data).forEach(([key, value]) => {
      if (!this.set(key, value)) {
        success = false
      }
    })
    return success
  }
}

// 初始化状态数据
const initState = (): RealNameState => {
  const keys = Object.values(realNameStorageKeyMap)
  const storedData = StorageManager.batchGet<any>(keys)

  return {
    personal: storedData[realNameStorageKeyMap.personal],
    enterprise: storedData[realNameStorageKeyMap.enterprise],
    forceVerifyObj: storedData[realNameStorageKeyMap.forceVerifyObj],
    originFromQuery: storedData[realNameStorageKeyMap.originFromQuery],
    personInfo: { isSupportForeignOCR: true, ...(storedData[realNameStorageKeyMap.personInfo] || {}) },
    enterpriseInfo: storedData[realNameStorageKeyMap.enterpriseInfo],
    authShow: storedData[realNameStorageKeyMap.authShow],
  }
}

// 实名认证 Pinia Store
export const useRealNameStore = defineStore('realName', {
  state: (): RealNameState => initState(),

  getters: {
    // 个人认证状态
    getPersonal: (state): string | undefined => state.personal,

    // 企业认证状态
    getEnterprise: (state): string | undefined => state.enterprise,

    // 强制认证对象
    getForceVerifyObj: (state): ForceVerifyObj | undefined => state.forceVerifyObj,

    // 来源标记
    getOriginFromQuery: (state): string | undefined => state.originFromQuery,

    // 个人信息
    getPersonInfo: (state): PersonInfo | undefined => state.personInfo,

    // 企业信息
    getEnterpriseInfo: (state): EnterpriseInfo | undefined => state.enterpriseInfo,

    // 认证显示标记
    getAuthShow: (state): boolean | undefined => state.authShow,

    // 是否来自订单页
    isFromOrder: (state): boolean => {
      const origin = state.originFromQuery
      return origin
        ? ['order_submit', 'order_page', 'order_notify_list', 'order_notify_detail'].includes(origin)
        : false
    },
  },

  actions: {
    // 设置个人认证状态
    setPersonal(value: string) {
      this.personal = value
      StorageManager.set(realNameStorageKeyMap.personal, value)
    },

    // 设置企业认证状态
    setEnterprise(value: string) {
      this.enterprise = value
      StorageManager.set(realNameStorageKeyMap.enterprise, value)
    },

    // 设置强制认证对象
    setForceVerifyObj(value: ForceVerifyObj) {
      this.forceVerifyObj = value
      StorageManager.set(realNameStorageKeyMap.forceVerifyObj, value)
    },

    // 设置来源标记
    setOriginFromQuery(value: string) {
      this.originFromQuery = value
      StorageManager.set(realNameStorageKeyMap.originFromQuery, value)
    },

    // 设置个人信息
    setPersonInfo(value: PersonInfo) {
      this.personInfo = value
      StorageManager.set(realNameStorageKeyMap.personInfo, value)
    },

    // 设置企业信息
    setEnterpriseInfo(value: EnterpriseInfo) {
      this.enterpriseInfo = value
      StorageManager.set(realNameStorageKeyMap.enterpriseInfo, value)
    },

    // 设置认证显示标记
    setAuthShow(value: boolean) {
      this.authShow = value
      StorageManager.set(realNameStorageKeyMap.authShow, value)
    },

    // 批量设置认证数据
    setAuthBatch(data: {
      personal?: string
      enterprise?: string
      personInfo?: PersonInfo
      enterpriseInfo?: EnterpriseInfo
    }) {
      const updates: Record<string, any> = {}

      if (data.personal !== undefined) {
        this.personal = data.personal
        updates[realNameStorageKeyMap.personal] = data.personal
      }

      if (data.enterprise !== undefined) {
        this.enterprise = data.enterprise
        updates[realNameStorageKeyMap.enterprise] = data.enterprise
      }

      if (data.personInfo !== undefined) {
        this.personInfo = data.personInfo
        updates[realNameStorageKeyMap.personInfo] = data.personInfo
      }

      if (data.enterpriseInfo !== undefined) {
        this.enterpriseInfo = data.enterpriseInfo
        updates[realNameStorageKeyMap.enterpriseInfo] = data.enterpriseInfo
      }

      StorageManager.batchSet(updates)
    },

    // 清空认证数据
    clearAuthData() {
      const keys = [realNameStorageKeyMap.personal, realNameStorageKeyMap.enterprise]
      keys.forEach((key) => StorageManager.remove(key))
      this.personal = undefined
      this.enterprise = undefined
    },

    // 清空验证数据
    clearVerifyData() {
      const keys = [
        realNameStorageKeyMap.forceVerifyObj,
        realNameStorageKeyMap.originFromQuery,
        realNameStorageKeyMap.personInfo,
        realNameStorageKeyMap.enterpriseInfo,
      ]
      keys.forEach((key) => StorageManager.remove(key))
      this.forceVerifyObj = undefined
      this.originFromQuery = undefined
      this.personInfo = undefined
      this.enterpriseInfo = undefined
    },

    // 清空所有数据
    clearAll() {
      this.clearAuthData()
      this.clearVerifyData()
      StorageManager.remove(realNameStorageKeyMap.authShow)
      this.authShow = undefined
    },

    // 重置所有状态到初始值
    reset() {
      this.clearAll()
      Object.assign(this, initState())
    },
  },
})
