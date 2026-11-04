import { ServiceMode } from '@order-public-sub-public/constants'
import { http } from '@order-public-sub-public/utils/request'

export interface CouponListRequestParams {
  serviceType: ServiceMode | null //	服务方式 数据字典：crm_marketing_for_product	string	是
  waybillAmount?: number //	预估运费 可为空	number	否
  serviceAmount?: number //	增值服务费（针对0元寄件）	number	否
  senderFullAddress: string //	寄件地址	string	是
  receiveFullAddress?: string //	收件地址	string	是
  goodsTime?: string //	寄件时间 时间戳或者yyyy-MM-dd HHmmss格式字符串	number	否
  payMode: string | null //	付款方式,10-寄付 20-到付收方付 30-第三方付	string	是
  weight?: number //	寄件重量	number	否
  bindingCouponBaseCode?: string //	当前绑定优惠券编码	string	否
  waybillNumber?: string //	运单号（0元，当前修改的运单，要排除当前扣除的额度。0元寄件可以绑定多个优惠券，故优惠券编码不唯一，这边传运单号，TODO）	string	否
}

export interface CouponListResponse {
  usableCount: number // 可使用数量
  disabledCount: number // 不可用数量
  usableList: CouponListItem[] // 可用优惠券信息
  disabledList: CouponListItem[] // 不可用优惠券列表
}

export interface CouponIframeUrl {
  type: string // 优惠券类型 coupon
  environment: string // 环境 uat、stg、dev、prod
  platform: string // 平台：pc、mobile
  waybillNumber?: string | null
  couponCode?: string | null
  batchId?: string | null
  estimateFeeTaskId?: string | null
  opType?: number
}
export interface CouponIframeResponse {
  data: string // url
}

export type CouponListItem = {
  showBack: 10 | 20 // 显示背景
  couponTypeDesc: string //	优惠券类型描述	string
  validStart: number //	优惠券开始时间	number
  validEnd: number //	优惠券结束时间	number
  couponCode: string //	优惠券编码	string
  serviceType: string //	服务方式 多个前后|分割；CRM营销中台-使用产品（crm_marketing_for_product）	string
  senderFullAddress: string //	起始地	string
  receiveFullAddress: string //	目的地	string
  specifyDate: string //	指定日期 多个英文逗号分割；CRM营销中台-指定日期（crm_marketing_specify_use_date）	string
  couponDesc: string //	优惠券描述	string
  couponShortDesc: string //	优惠券描述简称	string
  status: string //	状态 0不可用 1可用	number
  unusableDescList: string[] //	不可用描述 数组	array[string]
  reliefForm: ReliefForm //	减免类型 ：0免单券 10-满减，20-折扣，30-无门槛，40-每满N减N	number
  couponTitle: string //	优惠券标题	string
  remainDaysEnd: string //	有效期剩余天数	string
  couponType: CouponType //	优惠券类型：0 0元 10账单券, 20下单券，30戈壁	number
  amount: number //	券面金额	number
  discountAmount: number //	优惠金额	number
  freeRange: number //	免单范围，10-全免(含增值服务费)|20-免运单运费 crm_marketing_free_range	number
  maxWeight: number //	计重最大值； 当记重范围选择小于等于的时候，前端传这个值	number
  maxAmount: number //	单票上限	number
  maxCount: number //	免单票数上限	number
  weightRange: string //	计重范围	string
  // 优惠券详情描述：服务方式，限始发地，限目的地，指定日期，免单范围，计重范围，单票上线
  // 根据coupType=30是否是戈壁项目描述为：仅企业寄件可用，同一公司仅限使用一张，
  // 每个运单仅能使用一张代金券，仅寄付可用，仅支持抵扣运单运费不兑现、不找零、不退款优惠减免运费部分不支持开具发票代金券支持转赠，
  // 限制最多转赠一次，同时每个用户最多领取/接受一张代金券任何用户以不正当手段及舞弊行为等方式参与本次活动，一经发现，我司有权取消该用户生效中的代金券，
  // 并有权撤销已产生的违规运单抵扣记录 ，否则是其他类型的描述为：一张奖券仅限抵扣单个运单运费，单个运单仅能使用一张奖券不兑现、不找零、不退款，
  // 一次性使用使用优惠券减免的运费，不再开具发票仅寄付可用	array[string]
  descDetailList: string[]
}

interface BatchId {
  batchId: string
}
interface WaybillNumber {
  waybillNumber: string
}
interface ClearWaybillNumberResponse {
  data: WaybillNumber[]
}
export enum ReliefForm {
  '免单券' = 0,
  '满减' = 10,
  '折扣' = 20,
  '无门槛' = 30,
  '每满N减N' = 40,
}

export enum CouponType {
  '0元' = 0,
  '账单券' = 10,
  '下单券' = 20,
  '戈壁' = 30,
}

/**
 * @description 获取优惠券列表
 */
export const getCouponList = (params: CouponListRequestParams) => {
  return http<CouponListResponse>('web.order.coupon.getCouponList', params)
}
/**
 * @description 获取优惠券url
 */
export const getCouponIframeUrl = (params: CouponIframeUrl) => {
  return http<CouponIframeResponse>('web.order.coupon.getIframeUrl', params)
}

/**
 * @description 获取有提示的 优惠券信息
 */

export const clearCouponTips = (params: BatchId) => {
  return http<ClearWaybillNumberResponse>('web.order.coupon.clearCouponTips', params)
}
