/** 环境判断 & 域名配置（从 @order-public/utils/env 迁移） */

const isUAT = process.env.TARO_APP_ENV === 'uat'
const isSTG = process.env.TARO_APP_ENV === 'stg'
export const isPROD = process.env.TARO_APP_ENV === 'prod'

/**
 * 请求动态域名处理
 */
export const getRequestBaseUrl = () => {
  let base_url = 'https://ic-api-uat.ky-express.com'
  if (isSTG) {
    base_url = 'https://ic-api-stg.ky-express.com'
  } else if (isUAT) {
    base_url = 'https://ic-api-uat.ky-express.com'
  } else if (isPROD) {
    base_url = 'https://ic-api.ky-express.com'
  }
  return base_url
}

export const RequestBaseUrl = getRequestBaseUrl()
