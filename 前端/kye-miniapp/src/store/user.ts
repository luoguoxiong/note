import { defineStore } from 'pinia'
import { GeneralData, getDefaultGlobalData } from '@public/storage/hooks/useGeneralDataHook/defualtValue'
import { pinia } from './index'
import { useUserStorePersist } from '@public/storage/hooks/useGeneralDataHook/useUserStorePersist'
import Taro from '@tarojs/taro'

const userStorePersist = useUserStorePersist()

/* 全局用户store */
export const defineUserGlobalStore = defineStore('userGlobal', {
  state: () => {
    const cache = userStorePersist.readCache()
    return {
      data: cache || ((getDefaultGlobalData() || {}) as GeneralData),
      openId: '',
    }
  },
  getters: {
    // 客户编码
    customerInfo: (state) => {
      return state.data?.customerInfo
    },
    // 客户编码code
    customerCode: (state) => {
      return state.data?.customerInfo?.customerCode
    },
    // 用户信息
    userInfo: (state) => {
      return state.data?.userInfo
    },
    // 手机号
    phone: (state) => {
      return state.data?.userInfo?.phone
    },
    // 用户token
    token: (state) => {
      return state.data?.userInfo?.token || state.data?.userInfo?.ecasToken?.accessToken
    },
    isOldCustomerValue: (state) => {
      return Number(state.data?.userInfo?.isOldCustomer) === 0
    },
    // 是不是新客
    isNew() {
      return this.token && this.isOldCustomerValue
    },
    getOpenId: (state) => {
      return state.openId || Taro.getStorageSync('openId') || ''
    },
  },
  actions: {
    getCustomerInfo() {
      return this.data?.customerInfo
    },
    getPhone() {
      return this.data?.userInfo?.phone
    },
    setGlobalData(val) {
      console.log('[log] setGlobalData>>>>>>', val)
      this.data = val
      userStorePersist.writeCache(val)
    },
    // 重置全局用户数据
    resetGlobalData() {
      this.data = getDefaultGlobalData()
      userStorePersist.clearCache()
    },
    setOpenId(val) {
      this.openId = val
      console.log('setOpenId', val)
    },
  },
})

const userStore = defineUserGlobalStore(pinia)

// hook 有些地方用的不规范，会导致响应丢失，直接 export 全局 store
export const useUserGlobalStore = () => {
  return userStore
}
