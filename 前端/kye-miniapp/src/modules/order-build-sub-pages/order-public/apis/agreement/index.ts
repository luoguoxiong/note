import { http } from '@order-public-sub-public/utils/request'
import { Agreement } from './types'

/**
 * @description 获取协议详情
 * @param params
 * @returns
 */
export const getAgreement = (params: { id: number; type: number }) => {
  return http<Agreement>('web.order.agreement.get', params, {
    toast: false,
  })
}

/**
 * @description 勾选协议
 * @param params
 * @returns
 */
export const checkedAgreement = (params: { flag: number; type: number }) => {
  return http('web.order.agreement.get', params, {
    toast: false,
  })
}
