export interface WebUamClientSmsSendIn {
  /**
   * 寄件人手机号，场景为请求使用寄件号码时必填
   */
  phone: string
  /**
   * 场景，switch-开关号码保护，order-单次下单请求使用寄件号码，order-batch-批量下单请求使用寄件号码
   */
  type: string
  /**
   * 来源微信小程序 miniprogram
   */
  source: string
}

export type WebUamClientSmsSendOut = boolean
