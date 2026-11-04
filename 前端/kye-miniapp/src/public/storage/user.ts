import Taro from '@tarojs/taro'
import { isEqual } from 'lodash-es'
import { setStorageSync, removeStorageSync } from '@public/storage/storageEvent'
import { ThirdAuthorizedLoginData } from '@modules/user/apis/login/types'
import { useGeneralDataHook } from '@public/storage/hooks/useGeneralDataHook'
import { mergeDeepImmutable, setSaaAUserId } from '../utils'
import { getDefaultGlobalData } from './hooks/useGeneralDataHook/defualtValue'
import { useUserGlobalStore } from '@/store/user'
const globalUserStore = useUserGlobalStore()
/* 获取用户信息 */
export const getUserInfoStorage = () => {
  return Taro.getStorageSync('USER_INFO') || getDefaultGlobalData()['userInfo']
}

/* 获取手机号 */
export const getUserPhoneStorage = () => {
  const userInfo = getUserInfoStorage()
  return userInfo?.phone
}

/* 获取token */
export const getToken = () => {
  return Taro.getStorageSync('TOKEN') || ''
}
/* 设置token */
export const setToken = (value: string) => {
  const oldToken = getToken()
  // 数据存在变化,执行写入
  if (value !== oldToken) {
    setStorageSync('TOKEN', value)
  }
}
/**
 * 设置本地缓存用户信息
 * @param userInfo
 * @param options
 * 副作用：updateGlobalDataUserInfoFromStorage 从登陆场景更新数据-写入通用数据
 * from: 'GLOBAL_DATA' 无需写入通用数据
 */
export const setUserInfo = (userInfo: ThirdAuthorizedLoginData, options: { from?: string } = { from: '' }) => {
  const oldData = getUserInfoStorage()
  const { updateGlobalDataUserInfoFromStorage } = useGeneralDataHook()
  const data = { ...userInfo }
  setStorageSync('USER_INFO', data)
  updateGlobalDataUserInfoFromStorage(data, oldData, { from: options?.from })
}

/* 更新用户信息-仅更新/新增key */
export const updateUserInfo = (userInfo: Partial<ThirdAuthorizedLoginData>, options = { from: '' }) => {
  const currentUserInfo = getUserInfoStorage()
  const data = mergeDeepImmutable(currentUserInfo, userInfo)
  setUserInfo(data, { from: options?.from })
}

/* 更新客户编码信息 */
export const setCustomerInfo = (customerInfo) => {
  updateUserInfo(customerInfo)
}

/* 清空用户缓存 */
export const clearUserCache = () => {
  const { removeGlobalData } = useGeneralDataHook()
  // token 避免重复清理
  const token = getToken()
  if (token) {
    removeStorageSync('TOKEN')
  }
  removeStorageSync('openId')
  removeStorageSync('USER_INFO')
  removeGlobalData()
  // setSaaAUserId('')
}
/* 登录/getUser接口返回用户信息格式化 */
const userCacheFormatter = (data) => {
  if (!data) {
    return null
  }
  // 转boolean类型的参数(后端新接口不支持返回boolean,旧接口采用boolean)
  if (typeof data.bindAuth === 'string') {
    data.bindAuth = data.bindAuth === '1'
  }
  if (typeof data.isOldCustomer === 'string') {
    data.isOldCustomer = Number(data.isOldCustomer)
  }
  return data
}

/* 设置用户缓存 */
export const setUserCache = (userinfoData: ThirdAuthorizedLoginData) => {
  const oldData = getUserInfoStorage()
  const userinfo = userCacheFormatter(userinfoData)
  if (isEqual(userinfo, oldData)) return

  setToken(userinfo.token || (userinfo.ecasToken && userinfo.ecasToken.accessToken))
  if (userinfo.openid) {
    setStorageSync('openId', userinfo.openid)
  }
  setUserInfo(userinfo)
}

/* 写入storage */
export const getStorageSyncPure = (key: string) => {
  return Taro.getStorageSync(key)
}
/* 读取storage */
export const setStorageSyncPure = (key: string, value: any) => {
  Taro.setStorageSync(key, value)
}

/* 设置用户信息-自动登录 (不含token) */
export const setAutoLoginUserCache = (userinfo: ThirdAuthorizedLoginData) => {
  const oldData = getUserInfoStorage()
  if (isEqual(userinfo, oldData)) return

  if (userinfo.openid) {
    setStorageSync('openId', userinfo.openid)
    globalUserStore.setOpenId(userinfo.openid)
  }
  updateUserInfo(userinfo)
}
