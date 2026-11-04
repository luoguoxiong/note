export interface WebLoginVerificationCheckSmsCodeIn {
  /**
   * 验证码类型，7：登陆，8：忘记密码，9：重置密码，11：用户注销
   */
  captchaType: number
  /**
   * 手机号
   */
  phone: string
  /**
   * 来源（跟登陆一致）2：ios，4：安卓，6：小程序，7:PC客户端
   */
  from: number
  /**
   * 短信验证码
   */
  smsCode: string
  phoneCipher: string
}

export interface WebLoginVerificationCheckSmsCodeOut {
  /**
   * 短信校验通过id
   */
  smsCheckId?: string
}
