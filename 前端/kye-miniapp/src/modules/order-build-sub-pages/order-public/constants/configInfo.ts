// import packageConfig from '../../../package.json'

/* 仓库版本号 */
export const shellVersion = '1.0'

/* 登录来源 */
export enum LoginFromType {
  'weapp' = 6,
  'alipay' = 45,
}

// 登录来源
export const loginFromType = LoginFromType[process.env.TARO_ENV]
