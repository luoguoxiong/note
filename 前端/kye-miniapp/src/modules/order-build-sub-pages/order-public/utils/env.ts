/**
 * 蓝鲸构建时，stg、uat、prod 环境，都是使用的 build 命令。故没法通过 process.env 来区分环境。
 * 此处使用 location.hostname 来判断环境
 *
 * 20220708，针对离线包，增加 userAgent 判断环境
 */

import { ipExp } from '@order-public-sub-public/utils/pattern'
import { getToken } from '@order-public-sub-public/utils/auth'
import { baseReportInstance } from '@order-public-sub-public/reportUmp'
import { isH5EnvDev } from '@public/utils/env'
// import { isOfflinePackage } from './device'

const hostname = location.hostname

const ua = navigator.userAgent

export const offline_stg = /kye_stg/.test(ua)
export const offline_uat = /kye_uat/.test(ua)
export const offline_prod = /kye_prod/.test(ua)

export const isLocalUseIp = ipExp.test(window.location.host)
export const isLocalUseHost = /localhost/.test(window.location.host)
export const isLocal = isLocalUseIp || isLocalUseHost

export const isUAT = process.env.TARO_APP_ENV === 'uat'
export const isSTG = process.env.TARO_APP_ENV === 'stg'
export const isPROD = process.env.TARO_APP_ENV === 'prod'
console.log('isUAT', isUAT)
console.log('isSTG', isSTG)
console.log('isPROD', isPROD)

/**
 * @description 获取当前域名
 * @param notSubFolder 默认不包含当前下单配置二级域名
 */
export function getBaseUrl(notSubFolder = true) {
  let base_url = 'https://ic-h5-stg.kye-erp.com'
  if (isSTG) {
    base_url = 'http://ic-h5-stg.kye-erp.com'
  } else if (isUAT) {
    base_url = 'https://ic-h5-uat.kye-erp.com'
  } else if (isPROD) {
    base_url = 'https://ic-h5.kye-erp.com'
  } else {
    base_url = 'https://ic-h5.kye-erp.com'
  }
  const pathname = notSubFolder ? '' : window.location.pathname
  return `${base_url}${pathname}`
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
        'ic-h5-uat.kye-erp.com': 'UAT',
        'ic-h5-uat-02.kye-erp.com': 'UAT',
        'ic-h5-uat-03.kye-erp.com': 'UAT',
        'ic-h5.kye-erp.com': 'PROD',
      }[hostname] || 'UAT'
    )
  }
}

export async function getIframeUrl() {
  const baseUrl = getBaseUrl()
  let url = ''
  const token = await getToken()
  const source = ''
  const bindNoCancel = 'close'
  const express_type = '快速寄件页'
  const sessionId_log = baseReportInstance.get('sessionId_log')
  url = `${baseUrl}/netc-customer-code/index.html#/packages/bindcode/index?type=popup&token=${token}&source=${source}&express_type=${encodeURIComponent(
    express_type,
  )}&iframe=1&bindNoCancel=${bindNoCancel}&sessionId_log=${sessionId_log}`
  return url
}

// getVisitEnv 零依赖，提取到叶子文件 visit-env.ts，
 // 避免 utils/index 顶层初始化 $native 时因循环依赖取到 undefined
export { getVisitEnv } from './visit-env'

/**
 * @todo 处理版本号
 * @description 获取线上H5URL
 */
export function getOnlineH5Url() {
  return `${getBaseUrl()}/h5-offline/netc-h5-order-offline/#`
  // return `${getBaseUrl()}/h5/order`
}

/**
 * @description 获取下单默认配置地址
 */
export function getOrderDefaultUrl() {
  return `${getBaseUrl()}/netc-h5-order-configuration/#`
}

/**
 * 请求动态域名处理
 * @returns 环境
 */
export const getRequestBaseUrl = () => {
  if (isH5EnvDev) {
    return ''
  }
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

/**
 * 请求动态域名处理
 * @returns 环境
 */
export const getRequestBaseUrlAngle = () => {
  let base_url = ' https://uat-star.kyslb.com'
  if (isSTG) {
    base_url = 'https://uat-star.kyslb.com'
  } else if (isUAT) {
    base_url = 'https://uat-star.kyslb.com'
  } else if (isPROD) {
    base_url = 'https://ai-star-img.kyslb.com'
  }
  return base_url
}
export const RequestBaseUrl = getRequestBaseUrl()
export const RequestBaseUrlAngle = getRequestBaseUrlAngle()

/**
 * @Desc: env
 * @Author: wu xingtao
 * @Date: 2024/11/13
 */

/* 接口订阅应用appkey */
export const RequestAppKey = () => {
  return process.env.TARO_APP_APP_KEY
}
