import { ApiVersionManagerReportData } from '@public/apis/version'
import { getToken, getUserPhoneStorage } from '@/public/storage'
import { getMiniAppVersion, getMiniProgramVersion, MINI_APP_VERSION } from '@public/constants'
import { getSystemInfo } from '@/public/utils/getSystemInfo'
import { isWeixinAppSync } from '@public/config'
import { useThrottleAsync } from '@public/hooks/useThrottleAsync'
import { isWxAppIos } from '@public/appPlugins/utils/device'
import { isWechatNotAppEnv, isWxAppEnv } from '@public/utils'
/**
 * @Desc: useVersionReport
 * @Date: 2025/9/3
 */

// 上报android-app安装
const handleVersionReport = async (options = {}) => {
  try {
    const token = getToken()
    const { brand, model, system } = await getSystemInfo()
    const isWxAppIOS = await isWxAppIos()
    const params = {
      appUnitType: `${brand} ${model}`,
      systemVersion: system,
      grayObject: '',
      grayType: '50',
      ...options,
    }
    // app环境
    if (isWxAppEnv) {
      Object.assign(params, {
        appType: isWxAppIOS ? 'ios' : 'android',
        appCurrentVersion: MINI_APP_VERSION,
        resourceVersion: getMiniAppVersion() || MINI_APP_VERSION,
      })
    }
    // 小程序环境
    if (isWechatNotAppEnv) {
      const miniProgramVersion = getMiniProgramVersion()
      Object.assign(params, {
        appType: 'wechat-miniProgram',
        appCurrentVersion: miniProgramVersion,
        resourceVersion: miniProgramVersion,
      })
    }
    if (token) {
      // 已登录
      const phone = getUserPhoneStorage()
      params.grayObject = phone
      params.grayType = '10'
    } else {
      // 未登录
      params.grayObject = isWechatNotAppEnv ? getMiniProgramVersion() : MINI_APP_VERSION
      params.grayType = '50'
    }
    console.log('[version report]', params)
    ApiVersionManagerReportData(params)
  } catch (e) {
    console.log(e)
  }
}

/**
 * app 初始化使用接口上报
 * @returns {Promise<void>}
 */
const handleAppVersionReport = async () => {
  const isWeixinApp = isWeixinAppSync()
  if (isWeixinApp) {
    // 微信多端app上报
    handleVersionReport({
      upgradedUsedTime: new Date().getTime(),
    })
  } else if (isWechatNotAppEnv) {
    // 微信小程序使用上报
    handleVersionReport({
      upgradedUsedTime: new Date().getTime(),
    })
  }
}
// app安装上报
const handleInstallVersionReport = handleVersionReport

const { run, forceRun } = useThrottleAsync(handleAppVersionReport)

export function useVersionReport() {
  return {
    handleVersionReport,
    handleInstallVersionReport,
    reportAppVersionForce: forceRun, // app使用上报强制
    reportAppVersionUseThrottle: run, // app使用上报节流
  }
}
