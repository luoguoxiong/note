export type WebUamClientPhonePrivacySendDetailIn = object
export interface WebUamClientPhonePrivacySendDetailOut {
  /**
   * 寄件号码保护开启状态 0-关闭  1-开启
   */
  privacyStatus?: number
  /**
   * 同客户编码手机号使用寄件开启状态 0-关闭  1-开启
   */
  sameCompanyStatus?: number
  /**
   * 白名单列表
   */
  whilteList?: string[]
  /**
   * 黑名单列表
   */
  blackList?: string[]
}
