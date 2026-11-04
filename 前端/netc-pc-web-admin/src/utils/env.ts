/**
 * @Desc: env
 * @Author: wu xingtao
 * @Date: 2024/4/15
 */

// 客户端appKey
export const APP_KEY = '10145'

// 客户端ecas id
const ECAS_APP_ID = '115'

// 客户端来源id
const APP_FROM_ID = 7

// vue-router mode
const ROUTE_MODE = 'hash'

// 安全校验code
export const SAFE_CHECK_CODE = 264587
// 环境相关
const hostname = location.hostname
export const isSTG = 'uc-stg.ky-express.com' === hostname
export const isUAT = 'uc-uat.ky-express.com' === hostname
export const isPROD = 'uc.ky-express.com' === hostname

export const getRequestBaseUrl = () => {
  // 开发环境mock
  if (process.env.NODE_ENV === 'development') {
    return ''
  }
  let base_url = 'https://ic-api-uat.ky-express.com'
  // let base_url = 'https://ic-api-stg.ky-express.com'
  if (isSTG) {
    base_url = 'https://ic-api-stg.ky-express.com'
  } else if (isUAT) {
    base_url = 'https://ic-api-uat.ky-express.com'
  } else if (isPROD) {
    base_url = 'https://ic-api.ky-express.com'
  }
  return base_url
}

/**
 * 获取当前运行环境
 * @returns {string} DEV STG UAT PROD
 */
export function getEnv() {
  if (isSTG) {
    return 'STG'
  } else if (isUAT) {
    return 'UAT'
  } else if (isPROD) {
    return 'PROD'
  } else {
    return (
      {
        'ic-h5-stg.kye-erp.com': 'STG',
        'ic-h5-stg-02.kye-erp.com': 'STG',
        'ic-h5-stg-03.kye-erp.com': 'STG',
        'uc-uat.ky-express.com': 'UAT',
        'ic-h5-uat-02.kye-erp.com': 'UAT',
        'ic-h5-uat-03.kye-erp.com': 'UAT',
        'ic-h5.kye-erp.com': 'PROD',
      }[hostname] || 'DEV'
    )
  }
}

export const RequestBaseUrl = getRequestBaseUrl()
// 采用相对路径，由运维配置反向代理，重定向到开放平台
const BASE_URL = `${RequestBaseUrl}/router/rest`
export default {
  APP_KEY,
  ECAS_APP_ID,
  APP_FROM_ID,
  BASE_URL,
  ROUTE_MODE,
  RequestBaseUrl,
}
