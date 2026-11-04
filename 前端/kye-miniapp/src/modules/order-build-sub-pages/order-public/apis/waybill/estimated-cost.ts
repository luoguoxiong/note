import { http } from '@order-public-sub-public/utils/request'
import { BatchEstimateFeeResult } from '../types'
import { AddedValueTipsType } from '@order-public-sub-public/constants'

type EstimatedCostParams = {
  taskId: string
  orderScene?: string
}

export interface CouponItem {
  waybillNumber: string
  usableCount: number
  disabledCount: number
  couponTips: string
  showText: string
  couponCode?: string
  couponShortDesc?: string
  iframeUrl?: string
  showTextStatus?: number
}

export interface GetCouponBatch {
  couponListMap?: {
    [Symbol: string]: CouponItem
  }
  couponList?: CouponItem[]
  couponTips: string | null
  showText?: string
  cacheCouponResult?: CouponItem | null
}

export interface GetEstimateFeeByTaskIdResponse extends GetCouponBatch {
  responses: EstimateFeeByTaskIdResponseResultItem[]
  batchAmount?: number
  totalAmount?: number // 兼容单票feeResponse.totalAmount
  addedValueTips?: string // 兼容单票feeResponse.addedValueTips
  addedValueTipsType?: AddedValueTipsType
  couponCountResponseVo?: {
    usableCount: number
    disabledCount: number
  }
  status?: string
  batchTips?: string
  estimateFeeTip?: string
  noEstimateFeeText?: string
  visible?: boolean
  responsesMap?: {
    [Symbol: string]: EstimateFeeByTaskIdResponseResultItem
  }
  cacheResponseResult?: EstimateFeeByTaskIdResponseResultItem | null
}
export interface EstimateCouponMap {
  [key: string]: CouponItem
}
export interface EstimateFeeMap {
  [key: string]: EstimateFeeByTaskIdResponseResultItem
}

export interface EstimateFeeByTaskIdResponseResultItem {
  onlyOne: string
  successFlag: boolean
  errorMsg: any
  feeResponse: FeeResponse
  waybillType: 10 | 20 // 10或者空为去程单，20为返程单
  estimateFeeAddressInfo: FeedAddress // 费用地址数据
  estimateFeeTip: string
  noEstimateFeeText: string
  waybillNumber?: string
  showIndex?: number // 批量 对应运单的index
  addedValueTips?: string
}

interface FeedAddress {
  sendAddress: string // 寄件地址（市，例如：深圳市）	string
  receiveAddress: string // 收件地址（市，例如：深圳市）	string
  sendPerson: string // 寄件人姓名	string
  receivePerson: string // 收件人姓名	string
}

export interface FeeResponse {
  waybillAmount: number
  addedValueAmount: number
  addedValueDetail: AddedValueDetail
  totalAmount: number
  feeFormula: FeeFormula
  prompt: Prompt
  smallFlag: number
  adjustType: any
  addedValueDetailTipList: AddedValueDetailTipList[]
  couponList: CouponList[]
  addedValueTips: any
  addedValueTipsType?: AddedValueTipsType
  receiptTypeUrgentState: boolean
  lowestBatchFee: number
  feeTipResponse: FeeTipResponse
  tipState: boolean
  officialState: any
  noEstimateFeeText: string
  estimateFeeTip: string
  batchTips?: string
  visible?: boolean
}

export interface AddedValueDetail {
  premiumSource: number
  statementPriceFee: number
  receiptMoneyFee: number
  collectionFee: number
  woodenFrameFee: any
  nightPickupFee: any
  offerAdjustPrice: any
  outWarehouseFee: any
  inWarehouseFee: any
  overLengthFee: number
  overWeightFee: number
  superAreaFee: number
  surchargeAmount: number
  beforeDiscountAmount: number
  singleLowestAmount: number
  lowestBatchCharge: number
  dispatchAmount: any
  fenceAmount: any
  warehouseAmount: any
  installationCost: number
}

export interface FeeFormula {
  chargeType: string
  chargeDesc: string
  feeWeightTips: string
  freightFormula: string
  valueAddedFeeFormula: string
  totalFeeFormula: string
  amountExampleTableHeaderOne: string
  amountExampleTableHeaderTwo: string
  amountExampleList: AmountExampleList[]
  exampleRemark: string
  exampleFormula: string
  billingType: number
  billingTypeName: string
  billingWeight: string
  billingSize: any
  billingTypeList: BillingTypeList[]
}

export interface AmountExampleList {
  start: number
  end: number
  price: number
  index: number
}

export interface BillingTypeList {
  feeName: string
  value: string
}

export interface Prompt {
  outWareHouseFeeTips: string
  inWareHouseFeeTips: string
  nightPickupFeeTips: any
  overLengthFeeTips: string
  overWeightFeeTips: string
  freightFormulaTips: any
  lowestBatchChargeTips: any
  lowestWaybillFeeTips: any
  prizeDesc: any
  batchTips: any
}

export interface AddedValueDetailTipList {
  sortId: number
  feeName: string
  feeTips: string
  feeAmount: number
  type: number
}

export interface CouponList {
  [key: string]: any
}

export interface FeeTipResponse {
  waybillAmount: number
  freightLowestAmount: number
  lowestBatchAmount: number
  maxAmount: number
  minAmount: number
  officialAmount: any
}

/**
 * @description 预估运费轮询返回
 */
export const getEstimatedCost = (params: EstimatedCostParams) => {
  return http<GetEstimateFeeByTaskIdResponse>('web.order.estimateFee.getEstimateFeeByTaskId', params)
}

export interface GetEstimatedCostPermissionParams {
  authCodes: string[] //	申请的权限CODE	array[string]	是	[ "freightLookAuthFlag" ]	运费查询权限申请
  applyReason: string //	申请的理由	string	是
  operationSource?: string //
}

/**
 * 预估权限申请
 */
export const getEstimatedCostPermission = (params: GetEstimatedCostPermissionParams) => {
  return http('web.uam.apply.add', params, { toast: false })
}

// 预估运费轮询返回
export const getEstimateFeeResult = (params: { taskId: string }) => {
  return http<BatchEstimateFeeResult>('web.order.configOrder.batch.getEstimateFeeResult', params)
}

export interface nightCostResponse {
  nightPickupFeeTips: string
  feeSectionList: string[]
}
// 夜间取货费明细
export const getNightCostDetail = (params = {}, options = {}) => {
  return http<nightCostResponse>('web.order.nightPickFee.getFeeDescription', params, options)
}
