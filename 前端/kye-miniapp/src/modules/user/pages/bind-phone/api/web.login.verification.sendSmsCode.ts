export interface WebLoginVerificationSendSmsCodeIn {
  /**
   * 验证码类型，7：登陆，8：忘记密码，9：重置密码，11：用户注销，12：切换登录短信
   */
  captchaType: number
  /**
   * 手机号
   */
  phone: string
  /**
   * 来源（跟登陆一致）2：ios，4：安卓，6：小程序，7:PC客户端，42：跨越速运-抖音小程序
   */
  from: number
  /**
   * 设备码
   */
  deviceCode?: string
  /**
   * 确认标识（切换登录用到），1：用户已缺，其他（0）：用户未确认
   */
  configFlag?: number
  /**
   * 设备id
   */
  deviceID?: string
}
export interface WebLoginVerificationSendSmsCodeOut {
  /**
   * 发送成功提示
   */
  msg?: string
}
