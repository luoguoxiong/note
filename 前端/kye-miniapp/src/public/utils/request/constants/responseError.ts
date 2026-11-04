export const TIME_OUT = 15000

export const TIME_OUT_MESSAGE = `timeout of ${TIME_OUT}ms exceeded`

export const TIME_OUT_MESSAGE_MSG = '服务器开小差了，请稍后重试'

/**
 * @description 正常返回的异常
 */
export const ERRORS = {
  'Network Error': '网络错误，请检查网络',
  [`${TIME_OUT_MESSAGE}`]: TIME_OUT_MESSAGE_MSG,
  'Internal Server Error': '请求服务器错误',
  'Request failed with status code 502': '请求服务器错误',
  api: '接口错误',
}

/**
 * @description 非200的异常
 */
export const RESPONSE_ERRORS = {
  ECONNABORTED: '接口超时，请稍后重试',
  ETIMEDOUT: '服务器开小差了，请稍后重试',
  ERR_NETWORK: '网络错误，请检查网络',
}

export const DEFAULT_ERROR_MESSAGE = '服务器开小差了，请稍后重试'
