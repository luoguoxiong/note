import { http } from '@order-public-sub-public/utils/request'
import { $native } from '@order-public-sub-public/utils'
import {
  LinkGoods,
  GoodsInfo,
  OverLengthAndWeightFee,
  HistorySize,
  PageSelectSize,
  HistorySizeByPage,
  CustomerSkuInfo,
  CustomerSkuSaveParams,
} from './types'
import { GoodsSize, GoodsTime } from '@order-public-sub-public/types'

/**
 * @description 获取来源（复用 $native.getSource，兜底 other -> miniprogram）
 */
const getSource = async () => {
  const { source } = await $native.getSource()
  return source
}

/**
 * @description 托寄物联想
 * @param params
 * @returns
 */
export const getLinkGoods = (params: { goodsType: string }) => {
  return http<LinkGoods[]>('web.order.linkGoods.list', params)
}

/**
 * @description 分组货物信息列表
 * @param params
 * @returns
 */
export const getGoodsInfoList = (params: {
  keyWord?: string
  pageIndex?: number
  pageSize?: number
  waybillId?: string | number
  skuId?: number | string | undefined
}) => {
  return http<GoodsInfo[]>('web.order.productInfo.list', params)
}

/**
 * @description 超长超重费
 * @param params
 * @returns
 */
export const getOverLengthAndWeightFee = (params: {
  waybillNumber: string
  payMode: string
  customerCode?: string
  serviceMode?: string | null
  receiverAddress?: string
  sendAddress?: string
  volumeSize?: number
  overWeight?: { count: string; weight: string }
  overLengths?: GoodsSize[]
  woodenFrame?: number
  goodsTimeOptimiCalculate?: GoodsTime
}) => {
  return http<OverLengthAndWeightFee>('web.order.productInfo.overLengthAndWeightFee', params)
}

/**
 * @description 查询用户是否有权限展示历史尺寸按钮
 * @param params
 * @returns
 */
export const getShowHistorySize = () => {
  return http('web.order.configOrder.displayUserSizeCheck')
}

/**
 * @description 获取历史尺寸数据
 * @param params
 * @returns
 */
export const getHistorySize = (params: { sourceId: number }) => {
  return http<HistorySize>('web.order.configOrder.getUserHistorySize', params)
}

/**
 * @description 删除历史尺寸数据
 * @param params
 * @returns
 */
export const deleteHistorySize = (params: { batchIdList: number[] }) => {
  return http('web.order.configOrder.deleteUserHistorySize', params)
}

/**
 * @description 分页查询客户sku明细
 * @param params
 * @returns
 */
export const findPageSkuSize = async (params: { page: number; pageSize: number; goodsType?: string }) => {
  return http<PageSelectSize>('web.order.customer.sku.findPage', { ...params, source: await getSource() })
}

/**
 * @description 清空历史托寄物
 * @param params
 * @returns
 */
export const deleteHistoryGoods = (params: { waybillLogId?: string }) => {
  return http('web.order.configOrder.goodsType.deleteHistoryGoods', params)
}

/**
 * 修改用户历史尺寸信息
 * @param params
 * @returns
 */
export const modifyUserHistorySize = (params: { batchId: number; customName: string }) => {
  return http('web.order.configOrder.modifyUserHistorySize', params, {
    toast: false,
  })
}

/**
 * @description 获取历史尺寸数据分页版
 * @param params
 * @returns
 */
export const getHistorySizeByPage = (params: {
  sourceId: number
  page: number
  pageSize: number
  searchContent: string
}) => {
  return http<HistorySizeByPage>('web.order.configOrder.getUserHistorySizeByPage', params)
}

/**
 * @description 查询尺寸总数（我的尺寸/历史尺寸）
 * @returns
 */
export const getCustomerSkuInfo = () => {
  return http<CustomerSkuInfo>('web.order.customer.sku.info')
}

/**
 * @description 我的尺寸新增
 * @param params
 * @returns
 */
export const saveCustomerSku = async (params: CustomerSkuSaveParams) => {
  return http('web.order.customer.sku.save', { ...params, source: await getSource() })
}

/**
 * @description 我的尺寸删除
 * @param params
 * @returns
 */
export const deleteCustomerSku = async (params: { id: number }) => {
  return http('web.order.customer.sku.delete', { ...params, source: await getSource() })
}

/**
 * @description 敏感词校验
 * @param params
 * @returns status true-校验成功，false-校验失败
 */
export const validSensitiveWord = (params: { content: string; type: string }) => {
  return http<{ status: boolean }>('web.order.configOrder.validSensitiveWord', params, { toast: false })
}
