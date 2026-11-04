export type Payment = {
  /** 运单号 */
  waybillNumber?: string
  /** 纳入月份（0 账单） */
  inMonth?: string
  /** 原始月份 */
  orgInMonth?: string
  /** 服务方式 */
  serviceMethod?: string
  /** 寄件时间 */
  deliveryTime?: string
  /** 寄件城市 */
  deliveryCity?: string
  /** 寄件人 */
  sender?: string
  /** 收件城市 */
  pickupCity?: string
  /** 收件人 */
  receiver?: string
  /** 未支付金额 */
  unPaidAmt?: string
  /** 应收金额（0 账单） */
  netReceiptsAmt?: string
  /** 单据类型 */
  billType?: number
  /** 结算方式 */
  payMode?: string
  /** 单量（0 账单） */
  waybillCount?: string
  /** 跳转地址 */
  directUrl?: string
  /** 更多跳转地址 */
  moreDirectUrl?: string
}
