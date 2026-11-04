import { http } from '@public/utils/request'
import { LinkGoods } from '../components/product-name/types'
import {
  QueryServiceTimeResponse,
  QueryServiceTimeParams,
  ApplyContentResponse,
  NewCustomerActivityResponse,
  FreightTimeOrderInfo,
  GoodsBatchReq,
} from '../types'
import { getOrderGrayHeader } from '@public/utils/grayHeader/order'

const appkey = 55262

/**
 * @description 托寄物联想
 * @param params
 * @returns
 */
export const getLinkGoods = (params: { goodsType: string }) => {
  return http<LinkGoods[]>('web.order.linkGoods.list', params, {
    appkey: appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 托寄物校验
 * @param params
 * @returns
 */
export const getGoodsRestrictCheck = (params: { orderInfo; waybillSource: string }) => {
  return http<any>('web.order.costTimeLines.restrictCheck', params, {
    appkey: appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 获取运费时效信息（服务方式查询）
 * @param params
 * @returns
 */
export const getQueryServiceTime = (params: {
  orderInfo: QueryServiceTimeParams
  waybillSource: string
  activityId?: string
  receiveSource?: string
  safeVerifyId?: string
  captchaVerifyParam?: { ticket: string; randStr: string }
}) => {
  return http<QueryServiceTimeResponse>('web.order.configOrder.costTimeLines.v2.queryServiceTime', params, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 获取新客活动信息
 * @param params
 * @returns
 */
export const getNewCustomerActivity = (params: { scene: string; channel: string }) => {
  return http<NewCustomerActivityResponse>('web.activity.getNewCustomerActivity', params, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 获取联系商务信息（虚拟号/企微二维码）
 * @param params
 * @returns
 */
export const getContactInfo = (params: { outgoingMobile: string; scene: string }) => {
  return http<any>('web.order.apply.getContactInfo', params, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 申请预估运费查看权限
 * @param params
 * @returns
 */
export const applyEstimated = (params: { authCodes: string[]; applyReason: string }) => {
  return http<any>('web.uam.apply.add', { ...params, operationSource: '20' }, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 获取已有的预估运费申请内容
 * @returns
 */
export const getApplyContent = () => {
  return http<ApplyContentResponse>('web.order.costTimeLines.getEstimatedFeeApplyResponse', {}, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 获取包装服务列表
 * @param params
 * @returns
 */
export const getAddedServiceFee = (params: { orderInfo; waybillSource: string }) => {
  return http<any>('web.order.costTimeLines.getAddedServiceFee', params, {
    appkey: appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 去寄件 - 预加载下单页面配置
 * 对应 H5: web.order.init.quickOrder.singlePageV2({ source, channelScene: 10 })
 */
export const preloadFreightTimeToOrder = (params: { source: string; channelScene: number }) => {
  return http('web.order.init.quickOrder.singlePageV2', params, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * @description 去寄件 - 缓存运费时效数据到服务端（下单页 getConfig 时回填）
 * 对应 H5: web.order.configOrder.costTimeLines.dataReport
 */
export const saveFreightTimeOrderData = (params: FreightTimeOrderInfo) => {
  return http('web.order.configOrder.costTimeLines.dataReport', params, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

export const getGoodsBatch = (params: GoodsBatchReq) => {
  return http<any>('web.order.goodsTime.getGoodsBatch', params, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}

/**
 * 获取用户权限 运费时效使用
 */
export const getFreightTimeAuth = (params = {}) => {
  return http<any>('web.uam.net.permission.listByPhone', params, {
    appkey,
    needVersionFlag: true,
    extraHeader: { ...getOrderGrayHeader() },
  })
}
