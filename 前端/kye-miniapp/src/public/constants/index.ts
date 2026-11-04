/* 登录来源 */
export enum LoginFromType {
  'weapp' = 6, // 微信小程序
  'alipay' = 45, // 支付宝小程序
  'app' = 2, // 微信多端-app
  'ios_login' = 2, // 微信多端-app-ios
  'android_login' = 4, // 微信多端-app-android
  'amap' = 49, // 高德小程序
}
export enum base64Icon {
  必填 = 'https://ic-img.ky-express.com/netc/20260430_78143_!!1777549543801_80_80.png',
  问号 = 'https://ic-img.ky-express.com/netc/20260430_61749_!!1777549574108_28_28.png',
}

export type LoginFromTypeValue = '6' | '45' | '2' | '4' | '7' | '49' | '51' | '53'

export * from '../config/index'

export * from './version'
// export * from './cityTelephoneCodes'

export const getCitiCodes = () => {
  return new Promise(async (resolve) => {
    const {cityCodes} =  await import("@/public/asyncData/cityCode")
    resolve(cityCodes)
  })
}
