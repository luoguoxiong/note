import { getOS, isWeixinAppSync } from '@/public/config'
import { isAmapMiniApp, isH5FSEnv, isPcFSEnv } from '@/public/utils'

export * from './commonError'
export * from './scan-login'
/* 登录来源 */
export enum LoginFromType {
  'weapp' = 6, // 微信小程序
  'alipay' = 45, // 支付宝小程序
  'amap' = 49, // 高德小程序
  'app' = 2, // 微信多端-app
  'ios_login' = 2, // 微信多端-app-ios
  'android_login' = 4, // 微信多端-app-android
  'h5_fs' = '51', // 飞书移动端
  'pc_fs' = '53', // 飞书PC端
}

/* 绑码来源 */
export enum BindCodeSource {
  'alipay' = 91,
}

/* 登录方式 */
export enum LoginMode {
  'authorization' = '1', // 授权登录
}

// 登录来源
export let loginFromType = LoginFromType[process.env.TARO_ENV]

if (isWeixinAppSync()) {
  loginFromType = LoginFromType[getOS()]
}
if (isAmapMiniApp) {
  loginFromType = LoginFromType['amap']
}

if (isH5FSEnv) {
  loginFromType = LoginFromType['h5_fs']
}

if (isPcFSEnv) {
  loginFromType = LoginFromType['pc_fs']
}

/* 支付宝小程序 手机model 转换*/
export enum AliIphoneModelMap {
  'iphone1,1' = 'iPhone',
  'iphone1,2' = 'iPhone 3G',
  'iphone2,1' = 'iPhone 3GS',
  'iphone3,1' = 'iPhone 4',
  'iphone3,2 ' = 'iPhone 4',
  'iphone3,3' = 'iPhone 4',
  'iphone4,1' = 'iPhone 4S',
  'iphone5,1' = 'iPhone 5',
  'iphone5,2' = 'iPhone 5',
  'iphone5,3' = 'iPhone 5C',
  'iphone5,4' = 'iPhone 5C',
  'iphone6,1' = 'iPhone 5S',
  'iphone6,2' = 'iPhone 5S',
  'iphone7,2' = 'iPhone 6',
  'iphone7,1' = 'iPhone 6 Plus',
  'iphone8,1' = 'iPhone 6S',
  'iphone8,2' = 'iPhone 6S Plus',
  'iphone9,1' = 'iPhone 7',
  'iphone9,3' = 'iPhone 7',
  'iphone9,2' = 'iPhone 7 Plus',
  'iphone9,4' = 'iPhone 7 Plus',
  'iphone10,1' = 'iPhone 8',
  'iphone10,4' = 'iPhone 8',
  'iphone10,2' = 'iPhone 8 Plus',
  'iphone10,5' = 'iPhone 8 Plus',
  'iphone10,3' = 'iPhone X',
  'iphone10,6' = 'iPhone X',
  'iphone11,8' = 'iPhone XR',
  'iphone11,2' = 'iPhone XS',
  'iphone12,1' = 'iPhone 11',
  'iphone12,3' = 'iPhone 11 Pro',
  'iphone11,6' = 'iPhone XS Max',
  'iphone11,4' = 'iPhone XS Max',
  'iphone12,5' = 'Phone 11 Pro Max',
  'iphone13,1' = 'iPhone 12 mini',
  'iphone13,2' = 'iPhone 12',
  'iphone13,3' = 'iPhone 12 Pro',
  'iphone13,4' = 'iPhone 12 Pro Max',
  'iphone14,6' = 'iPhone SE',
  'iphone14,4' = 'iPhone 13 mini',
  'iphone14,5' = 'iPhone 13',
  'iphone14,2' = 'iPhone 13 Pro',
  'iphone14,3' = 'iPhone 13 Pro Max',
  'iphone14,7' = 'iPhone 14',
  'iphone14,8' = 'iPhone 14 Plus',
  'iphone15,2' = 'iPhone 14 Pro',
  'iphone15,3' = 'iPhone 14 Pro Max',
}

export * from './cancellation'
