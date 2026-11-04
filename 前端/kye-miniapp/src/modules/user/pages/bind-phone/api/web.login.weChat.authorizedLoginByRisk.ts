export interface WebLoginWeChatAuthorizedLoginByRiskIn {
  /**
   * 微信授权登陆code
   */
  wxCode: string
  /**
   * 授权登陆类型 1：直接授权，2：未绑定授权，3：验证码授权登陆
   */
  authorizedType: number
  /**
   * 来源
   */
  from: number
  /**
   * 手机号（未绑定授权时传入）
   */
  phone: string
  /**
   * 设备码
   */
  deviceCode?: string
  /**
   * 客户端版本
   */
  version?: string
  /**
   * 设备型号
   */
  deviceType?: string
  /**
   * 系统版本
   */
  systemVersion?: string
  /**
   * 验证码
   */
  smsCode: string
}

export interface WebLoginWeChatAuthorizedLoginByRiskOut {
  /**
   * 小程序登陆标识：0：未登录，1：登陆
   */
  appletLoginFlag?: number
  /**
   * 小程序登陆手机号
   */
  appletLoginPhone?: string
  /**
   * 绑定标识，1：已绑定，0：未绑定
   */
  bindFlag?: number
  /**
   * 客户编码
   */
  customerCode?: string
  /**
   * 用户名称
   */
  userName?: string
  /**
   * 客户简称
   */
  customerShortName?: string
  /**
   * 手机号
   */
  phone?: string
  /**
   * 市场员
   */
  marketer?: string
  /**
   * 市场员电话
   */
  marketingTelphone?: string
  /**
   * 0非灰度  1灰度  2 可选升级 （对于非pc web  灰度升级 1,非灰度0 or 2）
   */
  grayState?: number
  /**
   * 微信openid
   */
  openid?: string
  /**
   * token令牌
   */
  ecasToken?: {
    /**
     * 令牌有效时间
     */
    tokenEffectiveTime?: number
    /**
     * 刷新令牌
     */
    refreshTokenEffectiveTime?: number
    /**
     * 令牌
     */
    accessToken?: string
    /**
     * 刷新令牌有效时间
     */
    refreshToken?: string
    /**
     * 应用ID
     */
    appId?: string
    /**
     * 白名单标识
     */
    whiteListUser?: boolean
  }
}
