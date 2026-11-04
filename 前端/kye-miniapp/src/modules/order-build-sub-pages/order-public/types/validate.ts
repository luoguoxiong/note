import {
  AddressRestrict,
  AdjustPrice,
  ChangeKeys,
  CheckDetail,
  ClearanceWarehouse,
  CutoffCar,
  GoodsDangerRestrict,
  GoodsRestrict,
  InsuranceRestrict,
  OrderInfo,
} from '@order-public-sub-public/types/waybill'
import { CheckAfterSubmitType, ModuleStyle, OrderPageType, validateType } from '@order-public-sub-public/constants'
import { PlainObject } from './common'

export type limitType =
  | AddressRestrict
  | AdjustPrice
  | CutoffCar
  | ClearanceWarehouse
  | GoodsRestrict
  | InsuranceRestrict
  | GoodsDangerRestrict

export interface limitDataType {
  flag: CheckAfterSubmitType
  limitResult: limitType
}
//首页展示的校验数据
export interface hasOrderInOrderPageDataType {
  type: validateType
  accessData: CheckDetail[]
}

export interface batchAllCheckParams {
  needRemote: boolean
  onlyClear?: boolean
  filterList?: string[]
  waybillNumber?: string
}

//首页展示管控数据
export interface hasOrderInOrderPageDataLimitType extends Pick<hasOrderInOrderPageDataType, 'type'> {
  limitData: limitDataType
}

export interface ExtraRemoteCheckParams {
  callFlag?: boolean // 是否服务方式接口调用标识
}

export interface RemoteCheckParams {
  key: ChangeKeys | ChangeKeys[]
  retryKeys?: ChangeKeys[]
  retryCount?: number
  temporaryData?: Partial<OrderInfo> | PlainObject //临时先用，有几个组件报错。待修复
  moduleStyle?: ModuleStyle
  pageName?: string
  waybillNumber?: string
  orderPageType?: OrderPageType
  needFirstToast?: boolean
  needCheckDataHandOut?: boolean
  cacheStrategy?: number
  unSaveResponse?: boolean
  needCompatible?: boolean
  extraRemoteCheckParams?: ExtraRemoteCheckParams
}

export interface RemoteSingleCheckParams extends Pick<RemoteCheckParams, 'moduleStyle'> {
  key?: ChangeKeys
  temporaryData?: OrderInfo
  batchExtraData?: OrderInfo[] // 新增一条收件人需要的参数
  extraParams?: {
    cacheStrategy?: number | string
    noHandout?: boolean
    callFlag?: boolean
  } // 扩展参数
  couponBatch?: boolean
  orderPageType?: OrderPageType
}
