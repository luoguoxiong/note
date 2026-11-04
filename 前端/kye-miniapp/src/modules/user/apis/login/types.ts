/**
 * @Desc: types
 * @Author: wu xingtao
 * @Date: 2024/11/13
 */
export interface EcasToken {
  tokenEffectiveTime: number
  refreshTokenEffectiveTime: number
  accessToken: string
  refreshToken: string
  appId: string
  whiteListUser: boolean
}

export interface ThirdLoginDataResponse {
  phone: string
  ecasToken: EcasToken
}

export type UserInfoCacheData = ThirdLoginDataResponse & {
  token?: string
  openid?: string
}

export interface ThirdAuthorizedLoginData extends UserInfoCacheData {
  customerCode?: string | null
  customerName?: string | null
  customerType?: string | null
  openid?: string
  userName?: string | null
  userStatus: string | null
  marketer: string | null
  marketingTelphone: string | null
  newRegisterFlag: number | null
  headUrl: string | null
  userId?: string | null // 埋点用户id
  appUserId?: string | null // 用户id
  xcxOpenId?: string | null // openid 别名
  encryptPhone: string
  phoneCipher?: string | null
}

export interface SendSmsCodeReq {
  /**验证码类型，7：登陆，8：忘记密码，9：重置密码，11：用户注销，12：切换登录短信 */
  captchaType: number
  phone: string
  /** 2：ios，4：安卓，6：小程序，7:PC客户端，42：跨越速运-抖音小程序 */
  from?: string
  /** 设备码 */
  deviceCode?: string
  /** 确认标识（切换登录用到），1：用户已缺，其他（0）：用户未确认 */
  configFlag?: number
  deviceID?: string
}

export interface SmsLoginReq {
  from: string
  smsCode: string
  phone: string
  safeVerifyId: string
  deviceCode?: string
  version?: string
  deviceType?: string
  systemVersion?: string
  wxCode?: string
}

export interface PwdLoginReq {
  from: string
  phone: string
  safeVerifyId: string
  deviceType?: string
  deviceCode?: string
  wxCode?: string
  password?: string
  needCheckNewDevice?: boolean
}

export interface CaptchaRes {
  type: 4
}
/* app 一键授权登录 */
export interface AppAuthLoginReq {
  deviceCode?: string
  deviceId?: string
  wxCode: string
  from?: number
  authorizedType?: number
  deviceType?: string
  version?: string
  systemVersion?: string
}

export interface AppRefreshToken {
  deviceCode?: string
  deviceType?: string
  from?: string | number
  phone?: string
  refreshToken?: string
  systemVersion?: string
  version?: string
}

export interface WebLoginGuidePageGetRegisterGuidePageIn {
  /**
   * 来源，1：原生，2：H5
   */
  source: number
  /**
   * 是否新注册用户标识，0：否，1：是
   */
  registerFlag: number
}

export type WebLoginGuidePageGetRegisterGuidePageOut = Array<{
  /**
   * 排序
   */
  sort?: number
  /**
   * 链接
   */
  url?: string
  /**
   * 链接类型，1：H5，2：原生
   */
  urlType?: number
  /**
   * 可跳过标识（0：不可跳过，1：可跳过）
   */
  skipFlag?: number
}>
