export interface LogoutTipDataResponse {
  tips?: string
  status?: number
  type?: string | number
}

export interface WebLoginQrCodeGetQrCodeStatusIn {
  /**
   * 二维码唯一标识
   */
  qrCodeToken: string
}

export interface WebLoginQrCodeGetQrCodeStatusOut {
  /**
   * 二维码状态，1：已扫码，2：已授权，3：已取消，4：已返回已授权，5：登陆完成，6：扫码异常，7：已绑定，8：已过期
   */
  qrCodeStatus?: number
}

export interface WebLoginQrCodeOperationQrCodeIn {
  /**
   * 二维码唯一标识
   */
  qrCodeToken: string
  /**
   * 二维码状态，1：已扫码，2：确认授权，3：取消，7：确认绑定
   */
  qrCodeStatus: number
  /**
   * 绑定类型：1：微信未登录，2：与微信登陆手机号不一致
   */
  type?: number
  /**
   * 小程序微信code，微信小程序未登陆时传入（扫码绑定场景）
   */
  wxCode?: string
  /**
   * 扫码来源，1：微信扫码，2：APP扫码
   */
  scanSource: number
  /**
   * APP登陆token
   */
  accessToken?: string
}

export interface WebLoginQrCodeOperationQrCodeOut {
  /**
   * 小程序登陆标识：0：未登录，1：登陆
   */
  appletLoginFlag?: number
  /**
   * 微信小程序登陆手机号
   */
  appletLoginPhone?: string
  /**
   * 绑定二维码登陆手机号
   */
  bindLoginPhone?: string
  /**
   * 绑定标识，1：已绑定，0：未绑定，2：登录手机号不一致
   */
  bindFlag?: number
  /**
   * 是否关注公众号，0：未关注，1：关注
   */
  subscribe?: number
}

export type CustomerInfoResponseData = Partial<{
  contactPhone: string
  contacterName: string
  customerCode: string
  customerShortName: string
  customerType: string
  defaultInsurancePrice: string
  marketer: string
  marketingTelphone: string
  modifyShipperFlag: string
  otherWarehouseType: string
  payCustomerCode: null
  prestoreFlag: string
  recoveryReceiptFlag: string
  userName: string
  verificCodeFlag: string
  vipshopFlag: string
}>

/* 实名认证信息 */
export type RealNameVO = {
  isRealName: boolean
  authFlag: 10 | 20 | 30 // 认证状态 10-是，20-否 , 30-已认证，但图片不完整
  personalPageRealNameTagVO: PersonalPageRealNameTagVO
  headImgRealNameTagVO: HeadImgRealNameTagVO
}
/* 个人认证标签 */
export type PersonalPageRealNameTagVO = {
  authFlagName: string
  authButtonName: string
  authDesc: string
}
/* 头像认证标签 */
export type HeadImgRealNameTagVO = {
  authFlag: number
  authFlagName: string
}
/* 新小程序设置页获取用户信息与实名认证信息 */
export interface SettingPageUserAndAuthResponseData {
  registrationDay: string
  registrationTime: string
  headUrl: string
  position: string
  birthday: string
  sex: 0 | 1 // 0-未设置，1-女，2-男
  isOldCustomer: 0 | 1 // 是否为老客标识 0-新客 1-老客
  realNameVO: RealNameVO
  customerCode: string
  customerShortName: string
  bindAuth: boolean
  existedRelationBind: boolean
  hasCurBind: boolean
  userName: string
}

/* 登录状态续期data */
export interface RefreshTokenUserInfoResponse {
  userName: string
  openid: string
  phone: string
  customerShortName: string
  customerCode: string
  customerId: string // 客户id
  customerType?: string | null
  appUserId: number // 注册用户id
  accountId: number // 埋点用id
  encryptPhone: string // 加密手机号
  isOldCustomer: 1 | 0 // 是否为老客标识 0-新客 1-老客
  newRegisterFlag: 1 | 0 // 新注册用户标识
  customerPosition: string // 职务
  bindSalesFlag: string // 是否资源客户
  bindAuth: string // 是否开启管理账号 0-关闭 1-开启
}
