import { ONLINE_H5_APPKEY } from '@order-public-sub-public/constants'
import { http } from '@order-public-sub-public/utils/request'
import { ScanQrCodeResponse } from './types'

/**
 * @description 二维码扫描
 */
export const scanQrCode = (scanCodeText: string) => {
  return http<ScanQrCodeResponse>('web.order.scanQrCode', { scanCodeText }, { appkey: ONLINE_H5_APPKEY })
}
