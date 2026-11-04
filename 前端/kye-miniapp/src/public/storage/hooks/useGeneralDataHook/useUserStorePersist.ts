/**
 * @Desc: userStorePersist 用户信息持久化缓存
 * @Date: 2025/12/15
 */
import Taro from '@tarojs/taro'
import { getEnvConfig } from '@public/config'
import { GeneralData } from '@public/storage/hooks/useGeneralDataHook/defualtValue'

const USER_STORAGE_KEY = 'GLOBAL_USER'

export const useUserStorePersist = () => {
  // 返回本地存储key: 176xxxxxx_uat_GLOBAL_USER
  const getStorageKey = () => {
    const userinfo = Taro.getStorageSync('USER_INFO')
    const { isProd } = getEnvConfig()
    const currentCacheKey = userinfo?.phone
      ? `${userinfo?.phone}_${isProd ? 'prod' : 'uat'}_${USER_STORAGE_KEY}`
      : `${isProd ? 'prod' : 'uat'}_${USER_STORAGE_KEY}`
    // 清除其他key
    return currentCacheKey
  }

  // 读取缓存-无则返回null
  const readCache = () => {
    try {
      return Taro.getStorageSync(getStorageKey()) || null
    } catch (e) {
      console.warn('[userGlobal] read cache error', e)
      return {}
    }
  }
  // 写入缓存
  const writeCache = (data: GeneralData) => {
    try {
      Taro.setStorageSync(getStorageKey(), data)
    } catch (e) {
      console.warn('[userGlobal] write cache error', e)
    }
  }
  // 清空当前用户缓存
  const clearCache = () => {
    try {
      Taro.removeStorageSync(getStorageKey())
      clearUserCacheAll()
    } catch (e) {
      console.warn('[userGlobal] write cache error', e)
    }
  }
  // 清空所有用户持续缓存
  const clearUserCacheAll = () => {
    const allKeys = Taro.getStorageInfoSync().keys
    const filterKeys = allKeys.filter((key) => key.endsWith(USER_STORAGE_KEY))

    filterKeys.forEach((key) => {
      Taro.removeStorageSync(key)
      console.log(`已清除缓存: ${key}`)
    })
  }

  return {
    getStorageKey,
    readCache,
    writeCache,
    clearCache,
  }
}
