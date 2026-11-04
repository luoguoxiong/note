import { http } from '@order-public-sub-public/utils/request'
import {
  OrderSuccessResponse,
  OrderSuccessWaybillResponse,
  OrderSuccessBaseResponse,
  SuccessPageTip,
} from '@order-public-sub-public/types'
import { AdParams, AdResponse, CancelOrderType, ConfirmAdParams, RoutePathResponse } from './types'

/**
 * @description 获取下单成功页数据接口
 */
export const getOrderSuccessData = () => {
  return http<OrderSuccessResponse>('web.order.completed.queryOrderCompletedInfo', {})
}

export const getOrderSuccessBaseData = () => {
  return http<OrderSuccessBaseResponse>('web.order.single.app.getSingleSaveBaseResult', {})
}

export const getOrderSuccessWaybillData = () => {
  return http<OrderSuccessWaybillResponse>('web.order.single.app.getSingleSaveWaybillResult', {})
}

/**
 * 获取下单成功页创可贴、跑马灯等提示展示
 */
export const getSuccessPageTips = (params = {}, options?: { delBatchId?: boolean }) => {
  // delBatchId 用于请求头：显式删除 x-batchId（如展会首页实名tips接口不期望带batchId），不随请求体下发
  return http<SuccessPageTip[]>('web.order.successPage.tips', params, { delBatchId: options?.delBatchId })
}

/**
 * @description 获取广告内容详情
 */
export const getAdDetails = (params: AdParams) => {
  return http<AdResponse[]>('web.advertisement.getDetails', params, { toast: false, cancelDuplicated: true })
}

/**
 * @description 上报点击广告
 * @param params
 * @returns
 */
export const confirmClickAd = (params: ConfirmAdParams) => {
  return http('web.advertisement.confirmByUser', params, { toast: false })
}

/**
 * @description 根据渠道编码获取路由信息
 * @param params
 */
export const getRoutePathByChannel = (params: { channelCode: string }) => {
  return http<RoutePathResponse[]>('web.advertisement.getRoutePathByChannel', params, { toast: false })
}

/**
 * @description 取消运单
 * @param params
 */
export const cancelWaybill = (params: CancelOrderType) => {
  return http('web.order.waybill.cancel', params)
}
