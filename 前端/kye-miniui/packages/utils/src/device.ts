import { getSystemInfo } from '@packages/utils/src/getSystemInfo'
import Taro from '@tarojs/taro'

/**
 * @Desc: device
 * @Date: 2025/8/28
 */
export const isWxAppIos = () => {
  const { platform } = getSystemInfo()
  return platform === 'ios'
}

export const isWxAppAndroid = () => {
  const { platform } = getSystemInfo()
  return platform === 'android'
}

export const isWxAppOhos = () => {
  const { platform } = getSystemInfo()
  return platform === 'ohos'
}

/* 匹配为微信app */
export const isWxMiniApp = () => {
  const { host } = getSystemInfo()
  return host?.env === 'SAAASDK'
}
/* 匹配为微信pc端 */
export const isWxPcAppletEnv = (systemInfo) => {
  const { host, platform } = systemInfo || getSystemInfo()
  const isWechatEnv = host?.env === 'WeChat'
  return isWechatEnv && ['windows', 'mac'].includes(platform.toLowerCase())
}

const systemInfoValue = getSystemInfo()
const { platform } = systemInfoValue
const ua = navigator.userAgent

/* 微信小程序环境（包含企业微信小程序） */
export const isWechatEnv = systemInfoValue.host?.env === 'WeChat' || systemInfoValue?.environment === 'wxwork'
/* 微信app */
export const isWxAppEnv = systemInfoValue.host?.env === 'SAAASDK'
/* 是否ios端 (微信小程序/微信app) */
export const isWechatIOS = (isWechatEnv || isWxAppEnv) && platform === 'ios'
/* 微信app-ios */
export const isWxAppIosEnv = isWxAppEnv && platform === 'ios'
/* 微信app-android */
export const isWxAppAndroidEnv = isWxAppEnv && platform === 'android'
/* 微信app-ohos 鸿蒙 */
export const isWxAppOhosEnv = isWxAppEnv && platform === 'ohos'

/** 微信环境构建 */
export const isWeapp = Taro.getEnv() === Taro.ENV_TYPE?.WEAPP

/* 微信小程序pc端（包含企业微信小程序pc端） */
export const isWxPcAppletEnvValue = isWechatEnv && ['windows', 'mac'].includes(platform.toLowerCase())

/*  系统是否大于等于ios18+ */
export const isWeAppIOS18Plus = () => {
  let result = false
  const { platform, system } = getSystemInfo()
  if (!isWeapp) {
    return false
  }
  const isIOS = String(platform).toLowerCase() === 'ios'
  if (isIOS) {
    const match = system.match(/iOS\s(\d+)(?:_(\d+))?/)
    if (match && match[1]) {
      const major = parseInt(match[1])
      result = major >= 18
    }
  }
  return result
}
