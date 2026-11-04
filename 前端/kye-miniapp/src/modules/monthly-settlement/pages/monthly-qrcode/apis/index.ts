import type { HttpResponse } from '@public/utils/types'
import type { MonthlyQrcodeData } from './types'
import { http } from '@/public/utils/request'
/**
 * @description 扫码转月结 - 获取月结二维码
 * 单接口契约见 docs/adr/0001-monthly-qrcode-single-api-contract.md
 */
export const getMonthlyQrcode = (): Promise<HttpResponse<MonthlyQrcodeData>> => {
  return http<MonthlyQrcodeData>('web.user.fmsSettlement.getQRCode', {}, { hideToast: true })
}
