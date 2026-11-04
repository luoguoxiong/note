import Taro, { ENV_TYPE } from '@tarojs/taro'

export const getEnv = () => {
  return Taro.getEnv()
}

export enum MobileOS {
  'Android' = 'Android',
  'iOS' = 'iOS',
  'Unknown' = 'Unknown',
}

/* 是否H5环境 */
export const isH5Env = process.env.TARO_ENV === 'h5'

// export const isAliMiniApp = Taro.getEnv() === ENV_TYPE.ALIPAY
const systemInfoValue = Taro.getSystemInfoSync()

const { platform } = systemInfoValue

const ua = navigator.userAgent.toLowerCase()

const mobileKeywords = [
  'android',
  'iphone',
  'ipad',
  'ipod',
  'windows phone',
  'mobi'
]

// 只要命中移动端关键词，就认为是移动端
const isMobileUA = mobileKeywords.some(keyword => ua.includes(keyword))

export const isPc = isH5Env && !isMobileUA || ['windows', 'mac'].includes(platform.toLowerCase())

export const isH5Pc = isH5Env && !isMobileUA 

export function getMobileOS(ua: string): MobileOS {
  if (/android/i.test(ua)) return MobileOS.Android
  if (/^(iPad|iPhone|iPod|iOS)/i.test(ua)) return MobileOS.iOS
  return MobileOS.Unknown
}

/* 获取平台环境变量控件 */
export const getBridgeModule = () => {
  const env = getEnv()
  let bridge = {
    aplus_queue: {} as any,
    $umapm: {} as any,
  }
  switch (env) {
    case ENV_TYPE.ALIPAY:
      bridge = my
      break
    case ENV_TYPE.WEAPP:
      bridge = wx
      break
    case ENV_TYPE.WEB:
      bridge = window
  }
  return bridge
}

/** 微信端(小程序+app) */
export const isWxMiniApp = Taro.getEnv() === ENV_TYPE.WEAPP


/** 是不是高德小程序 */
export const isAmapMiniApp = Taro.getEnv() === ENV_TYPE.ALIPAY && !!my?.gd

/** 支付宝小程序 */
export const isAliMiniApp = Taro.getEnv() === ENV_TYPE.ALIPAY && !my?.gd

/* 微信小程序环境（包含企业微信小程序） */
export const isWechatEnv = systemInfoValue.host?.env === 'WeChat' || systemInfoValue?.environment === 'wxwork'
/* 微信app */
export const isWxAppEnv = systemInfoValue.host?.env === 'SAAASDK'
/* 微信app-ios */
export const isWxAppIosEnv = isWxAppEnv && platform === 'ios'
/* 微信app-android */
export const isWxAppAndroidEnv = isWxAppEnv && platform === 'android'
/* 微信app-ohos 鸿蒙 */
export const isWxAppOhosEnv = isWxAppEnv && platform === 'ohos'
// 企业微信
export const isQw = systemInfoValue?.environment === 'wxwork'
// 企业微信pc端
export const isQwPC = isQw && ['windows', 'mac'].includes(platform.toLowerCase())
//ios环境
export const isIosEnv = platform === 'ios'

export const isWechat = /micromessenger/i.test(ua)
export const isWxApplet = isWechat && /miniprogram/i.test(ua)

/* 微信小程序pc端（包含企业微信小程序pc端） */
export const isWxPcAppletEnv = isWechatEnv && ['windows', 'mac'].includes(platform.toLowerCase())

export const isWindow = platform === 'windows' || platform === 'mac'

export const isQwEnv = systemInfoValue.environment === 'wxwork'
/* 微信小程序-移动端 且非多端app */
export const isWechatNotAppEnv = isWechatEnv && !isWxAppEnv

/* 是否H5飞书环境 */
export const isH5FSEnv = isH5Env && /lark\//i.test(ua) || isH5Env

/** 是否PC飞书环境 */
export const isPcFSEnv = isH5FSEnv && isPc

export const isWebPc = isPc && isH5Env

function validateLowPerformanceDevice() {
  const { pixelRatio, brand = '' } = systemInfoValue

  if (platform === 'ios') {
    return pixelRatio <= 2
  } else if (platform === 'android' && !['honor', 'huawei'].includes(brand.toLowerCase())) {
    return pixelRatio <= 2.5
  } else if (platform === 'ohos' || ['honor', 'huawei'].includes(brand.toLowerCase())) {
    return pixelRatio <= 3
  }

  // 默认非低性能设备
  return false
}

export const isLowPerformanceDevice = validateLowPerformanceDevice()
