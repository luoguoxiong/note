export interface AdjustPriceApproval {
  canOrderCount: number
  waybillInfoItem: AdjustPriceWaybill
}

export interface AdjustPriceWaybill {
  /** 运单号 */
  waybillNumber: string
  /** 寄件信息 */
  sender: SenderInfoItem
  /** 收件信息 */
  receive: SenderInfoItem
  /** 服务方式 */
  serviceMode?: ServiceModeInfoItem
  /** 状态 10-可下单 */
  status: string
  /** 下单时间 */
  orderTime: number
}

export interface AdjustPriceNew {
  adjustId: number
  adjustPriceId: number
  adjustTitle: string
  estimatedAdjustAmount: string
  lastWaybillNumber: string
  paymentCustomerCode: string
  paymentCustomerName: string
  totalWaybillCount: number
}

export interface SenderInfoItem {
  /** 省 */
  province?: string
  /** 市 */
  city?: string
  /** 区县 */
  county?: string
  /** 详细地址 */
  detailAddress?: string
  /** 姓名 */
  person?: string
  /** 手机号 */
  mobile?: string
  /** 手机号分机号 */
  extension?: string
  /** 固话 */
  telephone?: string
  /** 公司名 */
  companyName?: string
  /** 客户编码 */
  customerCode?: string
}

export interface ServiceModeInfoItem {
  /** 服务方式 数据字典common_service_type */
  serviceMode: string
}
