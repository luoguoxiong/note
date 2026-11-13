const ua = navigator.userAgent

export const isWechat = /micromessenger/i.test(ua)

const isMobile = /android|iphone|ipod|windows phone|mobile/.test(
  ua.toLowerCase(),
)

/** 判断高德小程序 */
export const isAmapApp = /AMAP/i.test(ua)

/** 是不是微信多端App */
export const isWxApp = /SAAASDK/i.test(ua) && /miniprogram/i.test(ua)

export const isWxApplet = isWechat && /miniprogram/i.test(ua) && !isWxApp

export const isAppBrowse = /appType=/.test(ua)

export const isAliPayClient = navigator.userAgent.indexOf('AliApp') > -1

export const isIpad = /(iPad).*OS\s([\d_]+)/.test(ua)

export const isIphone = !isIpad && /(iPhone\sOS)\s([\d_]+)/.test(ua)

export const isAndroid = /(Android);?[\s/]+([\d.]+)?(.*Mobile)/.test(ua)

export const isAlipay = /alipayclient/i.test(ua)

export const isIpod = /(iPod)(.*OS\s([\d_]+))?/.test(ua)

export const isAndroidPad = /^(?!.*Mobile).*(Android);?[\s/]+([\d.]+)?/.test(ua)

export const isIphoneSpecial = /iOS/.test(ua)

export const isKuaSheng = /kuasheng-2.0/.test(ua.toLowerCase())

export const isWxwork = isWechat && /WxWork/i.test(ua)

/** 老版IOSAPP */
export const isAppiOS = (isAppBrowse && isIphone) || isIphoneSpecial
/** 老版AndroidAPP */
export const isAppAndroid = isAppBrowse && (isAndroid || isAndroidPad)

// IOS APP
export const isIosApp = isAppiOS || (isWxApp && isIphone)

/* Android APP */
export const isAndroidApp =
  isAppAndroid || (isWxApp && (isAndroid || isAndroidPad))

export const isWxAppletAndroid = isWxApplet && isAndroid

export const isWxAppletI0S = isWxApplet && isIphone

export const isOfflinePackage = /(OfflinePackage)/.test(ua)

/** 是不是微信多端App 鸿蒙*/
// export const isWxHMApp = /MMWEBSDK/.test(ua) && /miniprogram/i.test(ua)

/* 是否H5飞书环境 */
export const isH5FSEnv =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  /lark\//i.test(ua)

/** 是否PC飞书环境 */
export const isPcFSEnv = isH5FSEnv && !isMobile
