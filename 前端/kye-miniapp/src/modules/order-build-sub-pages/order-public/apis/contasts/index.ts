import { http } from '@order-public-sub-public/utils/request'
import { Contacts } from './types'
/**
 * @description 新联系商务，使用基础api，支持了审批人
 * @param
 * @returns
 */
export const getContacts = (params: { outgoingMobile?: string; scene?: string }) => {
  return http<Contacts>('web.order.apply.getContactInfo', params)
}
