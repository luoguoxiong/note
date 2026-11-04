export interface WebLoginWeChatAuthorizedBindIn {
  /**
   * 微信code
   */
  wxCode: string
  /**
   * 用户确认绑定标识，1：用户确认
   */
  confirmFlag?: number
}

export interface WebLoginWeChatAuthorizedBindOut {
  /**
   * 小程序登陆标识：0：未登录，1：登陆
   */
  appletLoginFlag?: number
  /**
   * 当前端登陆手机号
   */
  loginPhone?: string
  /**
   * 小程序登陆手机号
   */
  appletLoginPhone?: string
  /**
   * 绑定标识，1：已绑定，0：未绑定
   */
  bindFlag?: number
}
