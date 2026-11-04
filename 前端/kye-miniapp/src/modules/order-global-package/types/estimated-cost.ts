/**
 * 预估费用相关类型定义（从 @order-public/apis/waybill/estimated-cost 迁移）
 */

/** 增值服务提示类型 */
export enum AddedValueTipsType {
  最低批次费 = 10,
  最低收费 = 20,
  取派专车费 = 30,
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
  totalAmount?: number
  addedValueTips?: string
  billingMethodTypeName?: string
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
  waybillType: 10 | 20
  estimateFeeAddressInfo: FeedAddress
  estimateFeeTip: string
  noEstimateFeeText: string
  waybillNumber?: string
  showIndex?: number
  addedValueTips?: string
  billingMethodTypeName?: string
}

interface FeedAddress {
  sendAddress: string
  receiveAddress: string
  sendPerson: string
  receivePerson: string
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
  billingMethodTypeName?: string
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
  billingTypeDesc: string
  billingSizeV1: string
  billingTypeNameV1: string
  billingWeightV1: string
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
