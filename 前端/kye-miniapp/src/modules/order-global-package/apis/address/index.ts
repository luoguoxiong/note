/**
 * 地址相关 API
 */
import { http } from '@public/utils/request'
import {
  MultilevelLinkage,
  MultilevelLinkageResponse,
  MapAddressSearchResponse,
  HotCityNameListResponse,
} from './types-area'
import type { OcrParams, AiAddrAnalysisRes, FindSuggestParams, FindSuggestResponse } from './types'
import type { HistoryAddress, DeleteHistoryAddress, HistoryAddressResponse } from './types'
import type { OcrAnalysisResponse } from '../../types/address'
const appkey = 55816
// === 省市区弹窗专用 API (area-address) ===

/**
 * @description 获取省市区三级联动数据
 */
export const multilevelLinkage = (params: MultilevelLinkage) => {
  return http<MultilevelLinkageResponse>('web.order.address.multilevelLinkage', params, {
    toast: false,
    appkey: appkey,
  })
}

/**
 * @description 获取省市区热门城市
 */
export const hotCityNameList = () => {
  return http<HotCityNameListResponse[]>('web.order.address.hotCityNameList', {}, { toast: false, appkey: appkey })
}

/**
 * @description 省市区搜索结果列表
 */
export const mapAddressSearch = (params: { keyword: string; source?: string}) => {
  return http<MapAddressSearchResponse>('web.order.address.mapAddressSearch', params, { appkey: appkey })
}

// === DetailAddress 详细地址弹窗专用 API ===

/**
 * @description AI 地址解析
 */
export const aiAddrAnalysis = (params: OcrParams) => {
  return http<AiAddrAnalysisRes>('web.order.address.v1.resolution', params, { appkey: appkey })
}

/**
 * @description 地址联想搜索
 */
export const findSuggest = (params: FindSuggestParams) => {
  return http<FindSuggestResponse>('web.order.address.findSuggest', params, { toast: false, appkey: appkey })
}

// === OCR 图片分析（原 @order-public/apis/address → analysis） ===

/**
 * @description OCR 图片分析检测（base64 图片识别）
 */
export const analysis = (params: { data: { base64_data: string; img_id: string } }) => {
  const payload = {
    imgId: params.data.img_id,
    base64Data: params.data.base64_data,
  }
  return http<OcrAnalysisResponse>('web.order.image.ocrAnalysis', payload, { appkey: appkey })
}

// === 语音识别前置校验（原 @order-public/apis → getCustomerShortInfo） ===

/**
 * @description 获取客户短信息（语音识别权限校验）
 */
export const getCustomerShortInfo = (params: { source: string; alertType: string }) => {
  return http('web.order.configOrder.checkAlert', params, { appkey: appkey })
}

// === RecentAddress 最近寄件地址组件专用 API ===

/**
 * @description 获取最近寄/收件地址
 */
export const historyAddress = (params: HistoryAddress) => {
  return http<HistoryAddressResponse[]>('web.order.address.userHistory.list', params, { appkey: appkey })
}

// 运费时效
export const freightHistoryAddress = (params: { type: number }) => {
  return http<HistoryAddressResponse[]>('web.client.timeUserHistoryAddress.get', params, { appkey: appkey })
}

/**
 * @description 删除最近寄/收件地址
 */
export const deleteHistoryAddress = (params: DeleteHistoryAddress) => {
  return http('web.order.address.userHistory.remove', params, { appkey: appkey })
}

/**
 * @description 运费时效删除最近寄/收件地址
 */
export const freightDeleteHistoryAddress = (params: DeleteHistoryAddress) => {
  return http('web.client.timeUserHistoryAddress.delete', params, { appkey: appkey })
}
