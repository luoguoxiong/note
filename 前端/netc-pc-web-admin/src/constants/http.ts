/**
 * 接口返回码
 */
export enum HttpCode {
  SUCCESS = 0, //成功
  EMPTY = 60010, // token为空
  INVALID = 6001, // token无效
  EXPIRED = 100201, // token已失效
}

/**
 * SDK类型
 */
export enum SdkType {
  WECHAT_OFFICAL_ACCOUNTS = 1, //微信公众号
  WECHAT_MINI_PROGRAMS = 2, //微信小程序
  WECOM_COM_SIGN = 3, //企业微信(企业签名)
  WECOM_APP_SIGN = 4, //企业微信(应用签名)
}

// 请求重试次数
export const maxRetryCount = 3

/**
 * @description 默认appKey
 */
export const DEFAULT_APP_KEY = 10145
