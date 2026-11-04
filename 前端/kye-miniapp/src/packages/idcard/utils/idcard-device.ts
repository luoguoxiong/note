import Taro from '@tarojs/taro'
const systemInfo = Taro.getSystemInfoSync()
export const ua = navigator.userAgent

export const isQw = systemInfo?.environment === 'wxwork'

export const isQwPC = isQw && (systemInfo?.platform === 'windows' || systemInfo?.platform === 'mac')

export const isPC = systemInfo?.platform === 'windows' || systemInfo?.platform === 'mac'

export const isAppBrowse = /appType=/.test(ua)
export const isIpad = /(iPad).*OS\s([\d_]+)/.test(ua)
export const isIphone = !isIpad && /(iPhone\sOS)\s([\d_]+)/.test(ua)

export const isIphoneV2 = /(iPhone\sOS)\s([\d_]+)/.test(ua)

export const isAndroid = /(Android);?[\s/]+([\d.]+)?(.*Mobile)/.test(ua)
export const isAppiOS = isAppBrowse && isIphone
