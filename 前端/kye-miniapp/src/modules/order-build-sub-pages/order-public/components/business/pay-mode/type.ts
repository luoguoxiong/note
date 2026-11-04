import { PayMode } from '@order-public-sub-public/constants'
import { FieldsConfig } from '@order-public-sub-public/types'

export interface PayModelProps {
  info: FieldsConfig
  loading?: boolean
}

export interface confirmData {
  payMode: PayMode
  paymentAccount?: string
  paymentCustomerName?: string
  paymentCustomerCode?: string
  authorizeStatus?: number
  msg?: string
  payAuthorizeConfirm?: string
}

/**
 * @description 付款方式
 */

export const PayModeObj: Record<PayMode, string> = {
  '10': '寄方付', //寄方付
  '20': '收方付', //收方付
  '30': '第三方付', //第三方付
  '': '清空', // 清空
}

export interface authorizeStatus {
  status: number
  tipMsg: string
}

export interface accountItem {
  customerCode: string
  customerName: string
  authorizeStatus?: authorizeStatus
}

/**
 * @description 授权类型
 */
export enum AuthorizeStatusEnum {
  '已授权' = 10,
  '未授权' = 20,
  '无需授权' = 30,
}
