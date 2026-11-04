import { CheckDetail, Delivery, PickUp } from '@order-public-sub-public/types'
export interface SubmitAddress {
  inviteCode: string
  addressList: Record<string, any>[]
}

export interface SubmitAddressResponse {
  status: boolean
  checkResultList: CheckDetail[]
}

export interface IOrderInfo {
  waybillDelivery?: Delivery
  waybillPickup?: PickUp
  waybillNumber: string
  [key: string]: any
}

export type typeRoleType = '10' | '20' | '30'

export type routePageType = 'canFill' | 'submitSuccess' | 'timeOutCancel' | 'initBackFill' | 'notSelfSubmit' | 'refresh'

export interface routeResponse {
  role: typeRoleType
  routePage: routePageType
  timeOutEndTime: number
  trackOrderButton: boolean
  waybillList: IOrderInfo[]
}

export enum InviteStatusEnum {
  待填写 = 10,
  待下单 = 20,
  已取消 = 30,
  已下单 = 40,
}

export interface IInviteList {
  id: string
  inviteCode: string
  senderInfo?: Delivery
  receiverInfo?: PickUp
  timeOutEndTime: number
  orderStatus: string
  recordStatus: InviteStatusEnum
  waybillNumber: string
  msgTips: string
  timeOutEndTimeNum?: number
}

export interface InvitationInitResponse {
  inviteCode: string
}
