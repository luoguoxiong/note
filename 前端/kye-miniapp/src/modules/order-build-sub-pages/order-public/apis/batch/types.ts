import {
  OrderInfo,
  InitDataResponse,
  ModuleDimension,
  CheckDetail,
  RestrictData,
  ChangeKeys,
  SuccessOrderInfo,
  SuccessWaybill,
  OrderPickupInfo,
} from '@order-public-sub-public/types'
import { GetEstimateFeeByTaskIdResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import {
  ModuleStyle,
  YesOrNoNumber,
  OrderSuccessType,
  BatchInitPollingStatus,
  OrderScene,
  OrderPageType,
} from '@order-public-sub-public/constants'

// import { restrictFlatType } from '@order-public-sub-root-pages/batch-restrict/index'
import { ConfigDimension, InitResponse } from '../init/types'
import { BatchPollingStatus } from '../waybill/types'
import { DynamicConfig } from '@order-public-sub-public/apis/types'

export interface WaybillInfoList {
  waybillInfo: OrderInfo
  moduleDimension: ModuleDimension
  restrictData: RestrictData
  checkResultList: CheckDetail[]
  configDimension: ConfigDimension
  waybillId: string
  waybillNumber: string
  dynamicConfig: DynamicConfig
  status: boolean
}
export interface BatchOrderInfo {
  commonWaybillInfo: CommonProcessWaybillInfo
  waybillInfoList: WaybillInfoList[]
  batchModuleDimension?: ModuleDimension
  bulkCargoInfoList?: OrderPickupInfo['bulkCargoInfos'] | null
}

export interface CommonProcessWaybillInfo {
  waybillInfo: OrderInfo
  moduleDimension: ModuleDimension
  restrictData: RestrictData
  checkResultList: CheckDetail[]
  configDimension: ConfigDimension
  needBindCustomerCode: boolean
  unifiedInfoSwitcher: boolean
}

export interface BatchProcessResultResponse {
  cacheStrategy?: number
  commonWaybillInfo: CommonProcessWaybillInfo
  waybillInfoList: InitDataResponse[]
  staticConfig?: {
    configId: number
    versionId: number
  }
  estimateFeeResult?: GetEstimateFeeByTaskIdResponse
  processStatus: number
  status?: number
  orderScene?: number
  computeEstimateFee?: boolean
  computeCoupon?: boolean
  batchId?: string
}

export interface BatchSingleProcessResponse {
  taskId: string
  batchProcessResponse: {
    commonWaybillInfo: {
      waybillInfo: OrderInfo
      moduleDimension: ModuleDimension
      restrictData: RestrictData
      checkResultList: CheckDetail[]
      configDimension: ConfigDimension
      needBindCustomerCode: boolean
      unifiedInfoSwitcher: boolean
    }
    waybillInfoList: InitDataResponse[]
    processStatus: number
    estimateFeeResult: GetEstimateFeeByTaskIdResponse
    orderScene: number
    cacheStrategy?: number
  }
  computeCoupon?: true
  computeEstimateFee?: true
  flag: boolean
  status: boolean
}

export interface ReactiveDataItem {
  restrictFlag: any
  restrictData: RestrictData
  respId?: string
  adjustFenceId?: string
}

export interface OrderSaveInfo
  extends Pick<
    OrderInfo,
    'waybillNumber' | 'waybillId' | 'sender' | 'receive' | 'goodsTime' | 'payMode' | 'serviceMode'
  > {
  restrictDataList: ReactiveDataItem[]
}

export interface WaybillSaveInfo {
  status: boolean
  waybillId: string
  waybillInfo: OrderSaveInfo
  restrictDataList?: ReactiveDataItem[]
  moduleDimension?: ModuleDimension
}
export interface ReactiveItem {
  restrictFlag: restrictFlatType
  respId?: string
  waybillIdList: string[]
}

export enum RestrictType {
  运单限制 = 10,
  运单提醒 = 20,
}

export interface BatchSaveResultResponse {
  status: boolean
  waybillInfoList: WaybillSaveInfo[]
  pageType: RestrictType
  restrictList: ReactiveItem[]
}

export type BatchProcessQuery = {
  elementsChange: Array<ChangeKeys | undefined>
  orderInfoList: OrderInfo[]
  container: ModuleStyle | string
  pageName?: string
  textCode?: string
  commonWaybillInfo?: {
    waybillInfo?: Partial<OrderInfo>
  }
  moduleStyle: ModuleStyle | string
  cacheStrategy?: number | string
  waybillSource?: string
}

export interface BatchSuccessOrderInfo extends SuccessOrderInfo {
  resultType?: number
  orderSource?: string
  orderTitle?: string
  promptInfo?: string
  waybillList: SuccessWaybill[]
}
/**
 * @description 批量下单成功页返回数据
 */
export interface BatchOrderSuccessResponse {
  status: number
  orderInfos: BatchSuccessOrderInfo[]
  realAuth: boolean
  realAuthTips: string
  failedCount: number
  orderCompletedPageType: OrderSuccessType
  priceControlNumber: number
  failuresNumber: number
  orderTitle: string
  waybillControlNumber: number
  successNumber: number
}

export interface BatchSaveCheckResponse {
  batchId: string
  taskId: string
  checkResultList: CheckDetail[]
  status: boolean
}

export interface BatchSaveTrySaveResponse {
  complete: boolean
  pageType: number
  saveScene?: number
}

/**
 * @description 同意与否上报
 */
export interface UpdateRestrictAuditListRequest {
  respId: string
  waybillNumber: string
  restrictFlag: restrictFlatType
  confirmResult: YesOrNoNumber
  adjustFenceId: string
}

// 批量寄-费用轮询拆分
export interface BatchEstimateFeeResult {
  estimateFeeResult: GetEstimateFeeByTaskIdResponse
  orderScene: string
  processStatus: BatchPollingStatus
  status: number
  cacheStrategy: number
  taskId: string
}

// 批量-单票修改api拆分
export interface BatchSaveSingleWaybillRespones {
  taskId: string
  batchProcessResponse: BatchProcessResultResponse | BatchSingleProcessResponse
  computeEstimateFee?: boolean
  computeCoupon?: boolean
  key?: ChangeKeys
  isInit?: boolean
  orderPageType?: OrderPageType
}

export interface BatchInitProcessResult {
  commonWaybillInfo: CommonProcessWaybillInfo
  waybillInfoList: BatchProcessResultResponse['waybillInfoList']
  orderScene: OrderScene
  status: BatchInitPollingStatus
  computeEstimateFee?: boolean
  computeCoupon?: boolean
  isInitShowEstimateFee?: boolean
  initComputeEstimateFee?: boolean
  taskId?: string
}

export interface BatchFildInitResponse {
  pageInitConfigResponse: InitResponse
  taskId: string
  batchInitProcessResponse: BatchInitProcessResult
  batchId?: string
}

export interface BatchFiledInitPrams {
  taskId?: string
  cacheVersion?: string
  maxWaybillId?: number
  source?: string
  machine?: string
}
