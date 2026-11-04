import { http } from '@order-public-sub-public/utils/request'
import { UploadMaterialsParams, WoodenFrameFeeResponse, ReceiptParams, ReceiptResponse } from './types'

/**
 * @description
 * @param params
 * @returns
 */
export const getUploadMaterials = (params: UploadMaterialsParams) => {
  return http('web.order.config.uploadMaterials', params)
}

/**
 * 包装服务列表费用
 * @param params
 * @returns
 */
export const getWoodenFrameFee = (params: { waybillId: string; cacheStrategy?: number }) => {
  return http<WoodenFrameFeeResponse>('web.order.addedValueService.woodenFrameFee', params)
}

/**
 * 包装服务列表费用
 * @param params
 * @returns
 */
export const getBatchWoodenFrameFee = (params: { waybillId: string; cacheStrategy?: number }) => {
  return http<WoodenFrameFeeResponse>('web.order.batch.addedValueService.woodenFrameFee', params)
}

// 回单原件 返单信息保存
export const saveReceiptAddress = (params: ReceiptParams) => {
  return http<ReceiptResponse>('web.order.address.saveReceiptAddress', params)
}
