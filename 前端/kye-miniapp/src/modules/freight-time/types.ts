import { PersonnelContactType } from './constants'
/**
 * @description 货物信息-尺寸
 */
export interface GoodsSize {
  length: number | string //长
  width: number | string //宽
  height: number | string //高
  count: number | string //数量
  singleWeight: number | string //重量
  index?: number
  id?: number | string
}

// 寄件人信息
export interface Delivery {
  city: string
  county: string
  detailAddress: string
  province: string
}

// 收件人信息
export interface PickUp {
  city: string
  county: string
  detailAddress: string
  province: string
}

// 货好时间
export interface GoodsTime {
  goodsTime: string // 货好时间
  goodsTimeFlag?: GoodsTimeFlag
  selfSignFlag?: boolean // 是否开启批量自定义时间
}

export enum GoodsTimeFlag {
  NOW = 10, // 现在货好
  NONE = '',
  LATER_NOTIFIED = 20, // 稍后通知
}

// 货物信息
export interface ProductInfo {
  goodsType: string //托寄物
  actualWeight: number //实际重量
  volumeSize: number //体积
  preWaybillGoodsSizeList: GoodsSize[] //尺寸
}

// 包装服务
export interface AddedService {
  woodenFrame?: string // 包装服务
}

// ========== 服务方式查询 ==========

/** 服务方式图标信息 */
export interface ServiceTypeIconInfo {
  titleName: string // 右上角标签标题
  message: string // 禁用原因描述
  restrictType: string // 限制类型，'20'=航空违禁品
}

/** 增值费用明细 */
export interface AddedValueDetail {
  woodenFrameFee: string // 木架费
}

/** 单条服务方式 */
export interface ServiceType {
  serviceTypeName: string // 服务方式名称（如"陆运"、"空运"）
  descriptionH5Text: string // 时效描述（HTML格式）
  estimateTotalFee: string // 预估总费用
  estimateFee: string // 预估运费
  estimateArriveTime: string // 预计到达时间
  restrictFlag: string // 限制标识，'10'=不可用/置灰
  iconInfo?: ServiceTypeIconInfo // 禁用原因信息
  delayTips: string // 延迟提示
  expressTime: string // 快递时间
  usableFlag: string // 可用标识，'20'=不可用
  addedValueDetail?: AddedValueDetail // 增值费用明细
  feeFormula?: Record<string, any> // 计费公式（与下单预估接口对齐）
  prompt?: Record<string, any> // 提示文案（lowestWaybillFeeTips / lowestBatchChargeTips）
}

/** 服务方式列表响应 */
export interface ServiceModeResponse {
  serviceTypes: ServiceType[] // 服务方式列表
}

/** 限取限派结果 */
export interface RestrictResult {
  limitReason: string // 限制原因编码
  noticeMessage: string // 提示信息
}

/** 线上客服信息 */
export interface OnlineCustomerInfo {
  skipTips: string // 不支持地区提示
  linkText: string // 链接文字
  consultationMessage: string // 咨询消息
}

/** 查询服务时间 - API 响应 */
export interface QueryServiceTimeResponse {
  serviceModeResponse: ServiceModeResponse
  timeLimitConstResponse?: {
    onlineCustomerInfo?: OnlineCustomerInfo
  }
  restrictResult?: RestrictResult
  bindCustomerStatus: string
  sendCouponResult?: Record<string, any>
  checkResultList?: any[]
}

/** 查询服务时间 - 请求参数 */
export interface QueryServiceTimeParams {
  sender: Delivery
  receive: PickUp
  goodsTime: GoodsTime
  productInfo: ProductInfo
  addedService: AddedService
}

// ========== 申请预估运费 ==========

/** 获取已有的预估运费申请内容 - API 响应 */
export interface ApplyContentResponse {
  applyReason: string
  applyTime: string
  /** 联系人角色描述，如"商务""审批人" */
  contactTypeDesc: string
  /** 联系人按钮文案 */
  contactButtonName: string
  /** 联系人类型（10:主授权人 20:管理员 30:商务） */
  contactType: PersonnelContactType
  /** 联系场景 */
  contactScene: string
}

// ========== 新客活动 ==========

/** 新客活动 - 优惠券项 */
export interface CouponItem {
  receiveSource: string
  activityId: string
  couponCount: string
}

/** 新客活动列表项 */
export interface NewCustomerActivityItem {
  receiveSource: string
  activity?: {
    activityId: string
    couponCount: string
  }
}

/** 新客活动 - API 响应数据 */
export interface NewCustomerActivityResponse {
  resourceFlag: number
  activityList?: NewCustomerActivityItem[]
}

// ========== 去寄件 ==========

/** 寄收件联系信息（含公司、联系人、电话） */
export interface AddressOrderInfo {
  province: string
  city: string
  county: string
  detailAddress: string
  companyName?: string
  person?: string
  mobile?: string
  telephone?: string
}

/** 运费时效去寄件 — 缓存到服务端的订单信息 */
export interface FreightTimeOrderInfo {
  sender: AddressOrderInfo
  receive: AddressOrderInfo
  goodsTime: string
  goodsTimeFlag?: GoodsTimeFlag 
  productInfo: ProductInfo
  addedService: AddedService
}

// ========== 验证码 ==========

/** 验证码参数 */
export interface CaptchaParam {
  ticket: string
  randStr: string
}

// ========== 管控数据 ==========

/** 管控检查结果项 */
export interface CheckResultItem {
  key: string
  content: string
}

// ========== 服务方式排序 ==========

export type SortOrder = 'asc' | 'desc'

/** 预估费用信息 */
export interface EstimationFee {
  waybillAmount: number
  addedValueAmount: number
  totalAmount: number
  feeFormula: Record<string, any>
  prompt: Record<string, any>
  addedValueDetailTipList: { sortId: number; feeName: string; feeTips: string; feeAmount: number; type: number }[]
}

export interface GoodsBatchReq {
  orderInfo: IOrderInfo
}

export interface IOrderInfo {
  sender: ISender
}

export interface ISender {
  province: string
  city: string
  county: string
  detailAddress: string
}
