export enum HttpCode {
  SUCCESS = 0, //成功
  EMPTY = 60010, // token为空
  INVALID = 6001, // token无效
  EXPIRED = 100201, // token已失效
}

// 请求重试次数
export const maxRetryCount = 3

/**
 * @description 默认appKey
 */
export const DEFAULT_APP_KEY = 80013
