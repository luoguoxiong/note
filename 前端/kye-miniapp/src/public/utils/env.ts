/**
 * @Desc: env
 * @Author: wu xingtao
 * @Date: 2024/11/13
 */

/* 接口订阅应用appkey */
export const RequestAppKey = () => {
  return process.env.TARO_APP_APP_KEY
}
/* 默认请求baseUrl */
export const RequestBaseUrl =
  process.env.TARO_ENV === 'h5' && process.env.NODE_ENV === 'development' ? '' : process.env.TARO_APP_BASE_URL

// 在线客服链接
export const kuashengURLInOnlineService = process.env.TARO_APP_KUASHENG_URL

export const isH5EnvDev = process.env.TARO_ENV === 'h5' && process.env.NODE_ENV === 'development'
export const isPROD = process.env.TARO_APP_ENV === 'prod'
