import Taro from '@tarojs/taro'
import { MINI_APP_VERSION, getEnvConfig, getMiniAppVersion } from '@/public/constants'
import { ref } from 'vue'
import { isIosEnv, isLogined, isWxMiniApp } from '@/public/utils'
import { useThrottleAsync } from '@/public/hooks/useThrottleAsync'
import { getAppUpdateInfo } from './api'
import { isPROD } from '@/public/utils/env'

export const appUpdatePopupShow = ref(false)

export const appIsForceUpdate = ref(false)

export const closeAppUpdatePopup = () => {
  appUpdatePopupShow.value = false
  Taro.showTabBar()
}

/** 获取更新管理器（只在微信小程序环境可用） */
const getUpdateManager = () => {
  try {
    return Taro.getUpdateManager()
  } catch {
    return null
  }
}

/** 是否有新版本 */
const hasNewVersion = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const updateManager = getUpdateManager()
    if (!updateManager) return resolve(false)

    updateManager.onCheckForUpdate((res) => {
      resolve(res.hasUpdate)
    })
  })
}

/** 等待新版本下载完成 */
const waitUpdateReady = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const updateManager = getUpdateManager()
    if (!updateManager) return resolve(false)
    updateManager.onUpdateReady(() => resolve(true))
    updateManager.onUpdateFailed(() => resolve(false))
  })
}

const APP_UPDATE_CACHE_KEY = 'APP_UPDATE_CHECK_CACHE'

const SEVEN_DAYS = isPROD ? 7 * 24 * 60 * 60 * 1000 : 60 * 1000

const isCacheValid = (time: number) => {
  return Date.now() - time < SEVEN_DAYS
}

/** 打印当前版本信息（后续你可以在这里接接口判断是否弹窗） */
const checkIsNeedPopup = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const { isApp } = getEnvConfig()
    if (isApp) {
      const time = Taro.getStorageSync(APP_UPDATE_CACHE_KEY)
      if (time && isCacheValid(time)) {
        console.error(`当前 App 资源包检查未超过${SEVEN_DAYS / 1000}s`)
        resolve(false)
        return
      }
      console.error('当前 App 资源包版本：', getMiniAppVersion())
      const { data } = await getAppUpdateInfo({
        packageType: isIosEnv ? 'ios' : 'android',
        version: getMiniAppVersion(),
      })
      Taro.setStorageSync(APP_UPDATE_CACHE_KEY, Date.now())
      appIsForceUpdate.value = data?.upgradeMode === 10
      resolve(data.forceUpgrade)
    } else {
      console.error('当前小程序版本：', MINI_APP_VERSION)
      const { data } = await getAppUpdateInfo({ packageType: 'wechat-miniProgram', version: MINI_APP_VERSION })
      appIsForceUpdate.value = data?.upgradeMode === 10
      resolve(data.forceUpgrade)
    }
  })
}

// ⭐ 关键：缓存中的 Promise
let checkingPromise: Promise<boolean> | null = null

const $checkNeedShow = (): Promise<boolean> => {
  // 已经在执行中，直接复用
  if (checkingPromise) {
    return checkingPromise
  }

  checkingPromise = new Promise(async (resolve) => {
    try {
      // 非微信小程序
      if (!isWxMiniApp || !isLogined()) {
        resolve(false)
        return
      }

      const { isApp } = getEnvConfig()

      // 普通小程序
      if (!isApp) {
        const hasUpdate = await hasNewVersion()
        console.error('是否有更新', hasUpdate)
        if (!hasUpdate) {
          resolve(false)
          return
        }

        const isReady = await waitUpdateReady()
        if (!isReady) {
          resolve(false)
          return
        }
      }

      const result = await checkIsNeedPopup()
      resolve(result)
    } catch (err) {
      console.error('[checkNeedShow error]', err)
      resolve(false)
    } finally {
      // ⭐ 执行完一定要释放锁
      checkingPromise = null
    }
  })

  return checkingPromise
}

const checkNeedShow = async () => {
  appUpdatePopupShow.value = await $checkNeedShow()
}

export const { forceRun: checkNeedShowForce, run: checkNeedShowThrottle } = useThrottleAsync(checkNeedShow)
