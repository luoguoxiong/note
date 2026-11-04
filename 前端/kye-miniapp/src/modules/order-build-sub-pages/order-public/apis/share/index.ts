import { http } from '@order-public-sub-public/utils/request'
import { IInviteList, SubmitAddress, SubmitAddressResponse, routeResponse } from './types'

/**
 * @description 新增地址簿
 * @param params
 * @returns
 */
export const submitAddress = (params: SubmitAddress) => {
  return http<SubmitAddressResponse>('web.order.address.invitation.submit', params)
}

/**
 * @description 路由接口
 * @param params
 * @returns
 */
export const invitationRoute = (params: { inviteCode: string }) => {
  return http<routeResponse>('web.order.orderConfig.invitation.route', params, { toast: false })
}

/**
 * @description 我邀请的列表接口
 * @param params
 * @returns
 */
export const invitateList = (params: { inviteType: string; page: number; pageSize: number }) => {
  return http<{
    page: number
    pageSize: number
    pageTotal: number
    rows: IInviteList[]
  }>('web.order.address.invitation.list', params, { toast: false })
}
