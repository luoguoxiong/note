import {
  getUserInfoStorage,
  getUserPhoneStorage,
  GlobalDataChangeEventTrigger,
  GlobalDataKeyValueEventTrigger,
  RefEventType,
  updateUserInfo,
  getToken,
  clearUserCache,
} from '@public/storage'
import { ApiUserInfoByPhoneV1 } from '@public/apis/user'
import { getDefaultGlobalData, GeneralData } from '@public/storage/hooks/useGeneralDataHook/defualtValue'
import { ref } from 'vue'
import { useUserGlobalStore } from '@/store/user'
import { getAuthCode, mergeDeepImmutable, setSaaAUserId } from '@public/utils'
import { HttpResponse } from '@/modules/kye-miniapp-waybill/src/public/utils/types/request'

const globalData = ref({ ...getDefaultGlobalData() })

/* 获取通用数据 */
export const useGeneralDataHook = () => {
  const globalUserStore = useUserGlobalStore()

  /* 旧接口-格式化通用数据*/
  const formatGlobalData = (value) => {
    const { xcxOpenId, id, isEmployee, phone, userName, position, customerInfo, hasPwdFlag, encryptPhone } =
      value || globalData.value
    return {
      // token: getToken(),
      xcxOpenId: xcxOpenId, // 小程序 xcxOpenId
      isEmployee: isEmployee, // 是否内部员工 TODO
      userInfo: {
        id, // 用户id
        phone, // 用户手机号
        encryptPhone, // 加密手机号- TODO 埋点
        userName, // 真实姓名
        nickname: null, // 昵称 TODO
        position, // 职务
        hasPwdFlag, // 是否设置了密码
        ...value,
      },
      customerInfo: {
        customerId: customerInfo?.id, // 客户编码id
        customerType: customerInfo?.customerType, //  绑码类型 客户类型 '10'-新客户 '20'-老客户
        customerCode: customerInfo?.customerCode, // 客户编码
        customerShortName: customerInfo?.customerShortName, // 公司名称
        hasCurBind: customerInfo?.hasCurBind || value?.hasCurBind, // 是否存在当前病毒
        bindAuth: customerInfo?.bindAuth || value?.bindAuth,
        existedRelationBind: customerInfo?.existedRelationBind || value?.existedRelationBind, // 是否存在关联绑定
      },
      auth: {
        role: null, // 角色 TODO 10:主授权 | 20:管理员 | 30: 普通用户
        departmentManager: false, // 是否部门管理员 // TODO
      },
      real: {
        isValidation: false, // 是否需要验证 TODO 待提供
        isRealName: false, // 有无实名认证 TODO 待提供
        customerType: 0, // 客户类型(0：个人，1：企业)
      },
    }
  }

  /* 获取通用数据 */
  const getGeneralData = () => {
    return globalData.value
  }

  /* 从generalData获取到指定key数据 */
  const getGeneralDataWithKey = <K extends keyof GeneralData>(key: K): GeneralData[K] | null => {
    return Reflect.get(getGeneralData(), key) as GeneralData[K] | null
  }

  /* 获取全局通用数据 */
  const fetchGlobalData = async () => {
    return new Promise(async (resolve, reject) => {
      const Token = getToken()
      if (!Token) {
        return reject()
      }
      const phone = getUserPhoneStorage()
      try {
        // const { data } = await ApiUserInfoByPhone({ phone })
        const authCode = await getAuthCode()
        const { data } = (await ApiUserInfoByPhoneV1({ phone, authCode })) as HttpResponse<any>
        if (data) {
          const updateData = formatGlobalData(data)
          setSaaAUserId(data.encryptPhone)
          setGlobalDataSync(updateData)
          resolve(updateData)
        } else {
          reject('未获取到用户数据')
        }
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }
  /* 设置通用信息 */
  const setGlobalDataSync = (data) => {
    if (data) {
      globalData.value = data
      /* storage-设置用户信息(旧) */
      // 通知数据变化
      GlobalDataChangeEventTrigger(data)
      console.log('setGlobalDataSync', data)
      // 此处会合并全局-userInfo
      updateUserInfo(
        {
          ...data.userInfo,
          ...data.customerInfo,
        },
        { from: 'GLOBAL_DATA' },
      )
      /* store设置用户信息 */
      globalUserStore?.setGlobalData(data)
    }
  }

  /**
   * 增量更新通用信息,深copy匹配key替换
   * 更新globalData + 本地storage('USER_INFO')
   * @param data
   */
  const updateGlobalData = (data) => {
    // setGlobalDataSync({ ...globalData.value, ...data })
    const newDate = mergeDeepImmutable(globalData.value, data)
    setGlobalDataSync(newDate)
  }
  /* 更新通用信息-用户信息 */
  const updateGlobalUserInfo = (userInfoData) => {
    updateGlobalData({
      userInfo: userInfoData,
    })
  }
  /* 更新通用信息-客户编码信息 */
  const updateGlobalCustomerInfo = (customerInfoData) => {
    updateGlobalData({
      customerInfo: customerInfoData,
    })
  }

  /*
  * 局部更新通用信息
  * updateGlobalDataObject({
      userInfo: { phone, userName, openid, userStatus },
      customerInfo: { customerCode, customerShortName, customerType },
    })
  *  */
  const updateGlobalDataObject = (updates) => {
    if (!globalData?.value || typeof updates !== 'object') return

    for (const [key, value] of Object.entries(updates)) {
      if (globalData.value[key] && typeof globalData.value[key] === 'object') {
        Object.assign(globalData.value[key], value)
      }
    }
  }

  /* 移除通用信息 */
  const removeGlobalData = () => {
    globalData.value = { ...getDefaultGlobalData() }
    /* store 重置用户信息 */
    globalUserStore?.resetGlobalData()
  }

  /* 从storage setGlobalData：更新用户信息，客户编码信息(部分更新) - 用于处理不规范的接口数据字段 */
  const updateGlobalDataUserInfoFromStorage = (data, oldData: any = null, options = { from: '' }) => {
    const {
      phone,
      userName,
      openid,
      userStatus,
      hasPwdFlag,
      customerCode,
      customerShortName,
      customerType,
      isEmployee,
      registrationTime,
      customerInfo = {},
      bindAuth = false,
      hasCurBind = false,
      existedRelationBind = false,
      customerId,
      isOldCustomer,
      bindSalesFlag,
      customerPosition,
    } = data
    // 从通用数据同步的，无需再反写数据，避免数据丢失
    if (options?.from !== 'GLOBAL_DATA') {
      updateGlobalDataObject({
        userInfo: {
          phone,
          userName,
          openid,
          userStatus,
          hasPwdFlag,
          isEmployee,
          registrationTime,
          bindSalesFlag,
          isOldCustomer,
          customerPosition,
          ...data,
        },
        customerInfo: {
          customerCode,
          customerShortName,
          customerType,
          customerId,
          bindAuth,
          hasCurBind,
          existedRelationBind,
          ...customerInfo,
        },
      })
    }
    GlobalDataKeyValueEventTrigger(RefEventType.GLOBAL_DATA_USER_INFO_CHANGE, globalData.value?.userInfo)
    GlobalDataKeyValueEventTrigger(RefEventType.GLOBAL_DATA_CUSTOMER_INFO_CHANGE, globalData.value?.customerInfo)
    if (oldData) {
      if (customerCode !== oldData?.customerCode) {
        GlobalDataKeyValueEventTrigger(RefEventType.GLOBAL_DATA_CUSTOMER_CODE_CHANGE, customerCode)
      }
    }
  }

  /*   用户登录缓存写入通用数据 */
  const initDataFromLoginDataStorage = () => {
    const data = getUserInfoStorage()
    updateGlobalDataUserInfoFromStorage(data)
  }

  const clearGlobalData = () => {
    globalUserStore.setGlobalData({ ...getDefaultGlobalData() })
  }

  /**
   * 从登录接口/getUserByToken 返回的数据转换,只更新存在的值
   * @param value (部分globalData)
   * @returns {{xcxOpenId: any, userInfo: any, customerInfo: {customerId: null, customerType: any, customerCode: any, customerShortName: any, bindAuth: any}, auth: {role: null, departmentManager: boolean}}}
   */
  const formatLoginDataToStore = (value) => {
    const {
      openid,
      id,
      phone,
      userName,
      encryptPhone,
      customerCode,
      customerShortName,
      customerType,
      isOldCustomer,
      bindSalesFlag,
      bindAuth,
    } = value || globalData.value
    return {
      xcxOpenId: openid, // 小程序 xcxOpenId
      userInfo: {
        id, // 用户id
        phone, // 用户手机号
        encryptPhone, // 加密手机号-埋点
        userName, // 真实姓名
        isOldCustomer, // 是否新客
        bindSalesFlag,
        bindAuth,
        ...value,
      },
      customerInfo: {
        customerType: customerType || null, //  绑码类型 客户类型 '10'-新客户 '20'-老客户
        customerCode: customerCode || '', // 客户编码
        customerShortName: customerShortName || '', // 公司名称
        bindAuth,
      },
    }
  }

  /* 从登录接口数据-更新store-user数据 */
  const updateGlobalDataFromLogin = (value) => {
    const data = formatLoginDataToStore(value)
    console.log('[log] updateGlobalDataFromLogin', data)
    updateGlobalData(data)
  }

  /**
   * 清空全局用户信息
   * 场景：用户登录接口/用户切换
   */
  const clearGlobalUserData = () => {
    clearUserCache()
    clearGlobalData()
  }

  return {
    getGeneralData,
    getGeneralDataWithKey,
    fetchGlobalData,
    removeGlobalData,
    setGlobalDataSync,
    clearGlobalData,
    updateGlobalData,
    updateGlobalUserInfo,
    updateGlobalCustomerInfo,
    updateGlobalDataUserInfoFromStorage,
    initDataFromLoginDataStorage,
    updateGlobalDataFromLogin,
    clearGlobalUserData,
  }
}
