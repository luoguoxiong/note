import Taro from '@tarojs/taro'
import { getEnvConfig } from '@/public/constants'
import { isSupportNativeMethod } from '@/public/constants/featureVersionConfig'

/** 持久化存储 key */
const STORAGE_KEY = 'app_device_id'

/** 内存缓存 */
let cachedDeviceId: string | null = null

/**
 * 获取设备唯一标识
 * 第一次调用时会通过原生插件获取并缓存，后续调用直接返回缓存结果
 */
export const getDeviceId = async (): Promise<string> => {
  // 1. 内存缓存命中
  if (cachedDeviceId) {
    console.log('[getDeviceId] 命中内存缓存')
    return cachedDeviceId
  }

  // 2. 持久化缓存命中
  try {
    const storedId = Taro.getStorageSync(STORAGE_KEY)
    if (storedId) {
      console.log('[getDeviceId] 命中持久化缓存')
      cachedDeviceId = storedId
      return storedId
    }
  } catch (e) {
    console.warn('[getDeviceId] 读取持久化缓存失败', e)
  }

  // 3. 不支持获取设备 ID，直接返回空
  if (!isSupportNativeMethod('getDeviceId') || !getEnvConfig().isApp) {
    cachedDeviceId = ''
    return ''
  }

  // 4. 调用原生插件获取
  try {
    const { getDeviceId: getDeviceIdFromPlugin } = await import('./async')
    const deviceId = await getDeviceIdFromPlugin()
    cachedDeviceId = deviceId || ''

    // 持久化缓存
    try {
      cachedDeviceId && Taro.setStorageSync(STORAGE_KEY, cachedDeviceId)
    } catch (e) {
      console.warn('[getDeviceId] 持久化缓存写入失败', e)
    }

    console.log('[getDeviceId] 从原生插件获取成功', deviceId ? '有值' : '空值')
    return cachedDeviceId
  } catch (error) {
    console.error('[getDeviceId] 原生插件调用失败', error)
    cachedDeviceId = ''
    return ''
  }
}

/**
 * 重置设备 ID 缓存（仅用于调试/测试）
 */
export const resetDeviceIdCache = () => {
  cachedDeviceId = null
  try {
    Taro.removeStorageSync(STORAGE_KEY)
  } catch (e) {
    console.warn('[getDeviceId] 清除缓存失败', e)
  }
}
