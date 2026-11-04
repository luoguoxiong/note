export interface WebUamClientPhonePrivacyAddIn {
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
   * 添加类型 10-手动授权添加  20-短信验证添加
   */
  addType?: number
  /**
   * 失效时间
   */
  expireDate?: number
}

export type WebUamClientPhonePrivacyAddOut = string
