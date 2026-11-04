import { http } from '@order-public-sub-public/utils/request'
import { AuthorizedList } from '@order-public-sub-public/apis/pay-mode/types'
import { PayMode } from '@order-public-sub-public/constants/waybill'
/**
 * @description 获取第三方付客户信息列表
 * @param params
 * @returns
 */
export const getAuthorizedList = (params: {
  payMode: PayMode
  pickupMobile: string | undefined
  waybillId: string
}) => {
  return http<AuthorizedList[]>('web.order.payMode.getAuthorizedList', params)
}

/**
 * @description 根据客户编码或客户简称或主副授权号查询客户简要信息
 * @param params
 * @returns
 */
export const getCustomerShortInfo = (params: { payMode: PayMode; payCustomer: string; waybillId: string }) => {
  return http<AuthorizedList>('web.order.payMode.getCustomerBaseInfo', params)
}
