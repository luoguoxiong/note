export interface WebUamClientPhonePrivacySendSwitchWithRiskIn {
  /**
   * 寄件号码保护状态开启  0-关闭  1-开启
   */
  privacyStatus?: number
  /**
   * 同客户编码手机号使用寄件开启状态（0-关闭，1-开启）
   */
  sameCompanyStatus?: number
  /**
   * 短信验证,打开时需要接入短信验证码
   */
  smsCode?: string
  /**
   * 来源
   */
  source?: string
}

export type WebUamClientPhonePrivacySendSwitchWithRiskOut = boolean
