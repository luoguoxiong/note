export interface WebUamClientPhonePrivacyDeleteIn {
  /**
   * 手机号
   */
  userTel?: string
  /**
   * 寄收件类型 10：寄件 20：收件
   */
  sendReceiveType?: string
  /**
   * 微信小程序 miniprogram
   */
  source?: string
  /**
   * 名单id
   */
  id?: string
}

export type WebUamClientPhonePrivacyDeleteOut = boolean
