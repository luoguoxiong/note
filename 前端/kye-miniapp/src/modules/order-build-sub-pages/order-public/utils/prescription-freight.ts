// import { isPROD } from '@order-public-sub-public/utils/env'
export const isPROD = process.env.TARO_APP_ENV === 'prod'
interface hasMapType {
  [key: string]: string
}
const uatMap = {
  weightSize: '950', // '重量尺寸标准'
  consignment: '951', // '托寄物标准'
  additionalService: '952', // '增值服务介绍'
  goodsSupplement: '970',
  haiNanService: '1645', // 海南说明
} as hasMapType
const prodMap = {
  weightSize: '941', // '重量尺寸标准'
  consignment: '943', // '托寄物标准'
  additionalService: '945', // '增值服务介绍'
  haiNanService: '1287', // 海南说明
} as hasMapType

interface paramsType {
  tabName: string
  contentId?: string
}
/**
 * @description: 重量/尺寸/托寄物说明  url
 * @param {*} tabName 当前显示的tab
 * @return {*}
 */
export function prescriptionFreightIframeUrl(params: paramsType) {
  const { tabName, contentId = '1747' } = params
  const host = isPROD
    ? 'https://ic-cms.ky-express.com/orderConfigH5/939_list_1.html'
    : 'https://ic-cms-uat.ky-express.com/orderConfigH5/949_list_1.html'
  const anchorPoint = (isPROD ? prodMap[tabName] : uatMap[tabName]) || '941'
  const timer = Date.now()
  return `${host}?tabId=${anchorPoint}&contentId=${contentId}&timer=${timer}`
}

export function getServiceFreightIframeUrl() {
  const host = isPROD
    ? 'https://ic-cms.ky-express.com/orderConfigH5/939_list_1.html'
    : 'https://ic-cms-uat.ky-express.com/orderConfigH5/949_list_1.html'
  return host
}
