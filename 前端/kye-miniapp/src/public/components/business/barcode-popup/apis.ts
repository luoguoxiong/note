import { http } from '@/public/utils/request'

/** 寄件码条形码下载生成 (V1.0) */
export const genDownloadBarCode = (params) => {
  return http<string>('web.task.deliveryCode.genDownloadBarCode', params, { appkey: 55262 })
}

/** 根据运单号生成条形码 */
export const getBarcode = (params) => {
  return http<string>('web.query.code.barcode', params, { appkey: 55262 })
}
