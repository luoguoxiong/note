import Taro from '@tarojs/taro'
import { removeStorageSync } from '@order-public-sub-public/storage/storageEvent'

/* 获取用户信息 */
export const getUserInfoStorage = () => {
  return Taro.getStorageSync('USER_INFO') || {}
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

/* 清空用户缓存 */
export const clearUserCache = () => {
  console.log('clearUserCache >> 清空用户缓存')
  removeStorageSync('TOKEN')
  removeStorageSync('openId')
  removeStorageSync('USER_INFO')
}
