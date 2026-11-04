import { http } from '@/utils/request/request'
import { createCustomerSign } from '@/apis/user'
import type { OrderTips } from './types'

/**
 * 下单权限（对齐老项目 configOrderPermission.js / review.js）
 */
export const getOrderTips = () => {
  return http<OrderTips>('web.order.auth.getOrderTips', { source: 'pc' })
}

/** 下单权限申请：sign = md5(customerCode + phone).toUpperCase()，失败自行 toast（toast: false） */
export const applyOrderPermission = (customerCode: string, phone: string) => {
  const sign = createCustomerSign(customerCode, phone)
  return http<null>('web.order.auth.apply', { sign, customerCode, operationSource: '30' }, { toast: false })
}
