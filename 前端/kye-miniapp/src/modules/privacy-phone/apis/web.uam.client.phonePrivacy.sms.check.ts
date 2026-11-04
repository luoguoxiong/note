export interface WebUamClientPhonePrivacySmsCheckIn {
  /**
   * 寄件人手机号
   */
  phone?: string
  /**
   * 短信验证码
   */
  smsCode?: string
  /**
   * 来源-微信小程序: miniprogram 高德小程序: amap 支付宝小程序: aliPay iosAPP: ios androidApp: android PC网页/壳子: pc
   */
  source?: string
  /**
   * 场景（单票 order，批量 order-batch）
   */
  businessType?: string
  /**
   * 拓展值
   */
  bizLoad?: string
}

export type WebUamClientPhonePrivacySmsCheckOut = boolean
