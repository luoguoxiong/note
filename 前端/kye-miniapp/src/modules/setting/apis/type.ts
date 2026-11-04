export interface WebVersionVersionManagerGetHistoryVersionListIn {
  /**
   * app当前版本
   */
  appVersion?: string
  /**
   * 应用类型 android-安卓，ios-ios，pc-客户端，printApp-打印组件(数据字典 eam_version_manage_app_type)
   */
  appType: string
  /**
   * 上一页最后的一条数据的版本code（首次获取传null)）
   */
  lastVersionCode?: string
}

export type WebVersionVersionManagerGetHistoryVersionListOut = Array<{
  /**
   * 版本号
   */
  versionNo?: string
  /**
   * 版本code
   */
  versionCode?: string
  /**
   * 更新内容
   */
  modifyContentList?: string[]
  /**
   * 发布时间
   */
  releaseTime?: number
  /**
   * 是否显示更新按钮
   */
  showUpateButton?: boolean
}>

export interface WebUserLoginOneKeyLogoutOtherDeviceIn {
  /**
   * 操作来源（LoginSource 枚举）6-微信小程序 45-支付宝小程序 49-高德小程序 51-飞书小程序H5 53-飞书PC 2/4-App
   */
  from: number
  /**
   * 设备型号，用于退登日志「确认一键退登的设备号」
   */
  deviceType?: string
  /**
   * 当前设备登录 token，用于服务端 excludeTokens 保留当前设备不退登
   */
  accessToken: string
}

export interface WebUserLoginOneKeyLogoutOtherDeviceOut {
  /**
   * 是否已设置登录密码：0=未设置 1=已设置
   */
  passwordStatus: number
}

export interface WebLoginSwitchLoginIn {
  /**
   * 来源
   */
  from?: number
  /**
   * 手机号
   */
  phone?: string
  /**
   * 设备码
   */
  deviceCode?: string
  /**
   * 刷新token
   */
  refreshToken?: string
  /**
   * 登录token
   */
  accessToken?: string
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
   * 是否退出相同手机号的不同微信，10：是
   */
  quitFlag?: string
  /**
   * 用户选择登陆的手机号
   */
  loginSamePhone?: string
  /**
   * 验证码
   */
  smsCode?: string
  /**
   * 客户端唯一标识【新增】
   */
  equipmentCode?: string
}

export interface WebLoginSwitchLoginOut {
  /**
   * 是否可以领取生日礼包，true允许，
   */
  canSendAccFlag?: boolean
  /**
   * 是否为黑名单 true为是
   */
  blackFlag?: boolean
  /**
   * 生日
   */
  birthday?: string
  /**
   * 1-女，2-男
   */
  sex?: number
  /**
   * 微信openid
   */
  openid?: string
  /**
   * 工作单位
   */
  workCompany?: string
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
   * 客户类型（主营、加盟商） 20 加盟商 10 跨越 30-无客户编码
   */
  customerType?: string
  /**
   * 是否借用手机号
   */
  isBorrowTelNo?: boolean
  /**
   * 用户状态
   */
  userStatus?: number
  /**
   * 是否新注册用户：1：是，其他：否
   */
  newRegisterFlag?: number
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
