/**
 * 切换登录手机号常量
 * 来源: netc-pc-web/src/views/layout/switch-login-mobile/constants/index.js + utils/constants.js
 */

/** 手机号当前登录状态 */
export const LoginFlag = {
  NOT_LOGIN: 0, // 没有登录
  HAS_LOGIN: 1, // 当前登录
} as const

/** 来源 */
export const LoginSource = {
  APP: 2, // app
  MINI_PROGRAM: 6, // 小程序
  PC_WEB: 7, // 客户端
} as const

/** 是否解除其他手机号关联绑定确认标识 */
export const ConfigFlag = {
  HAS_CONFIRM: 1, // 已确定
  NOT_CONFITM: 0, // 未确定
} as const

/** 切换登录手机号异常错误码 */
export const SwitchLoginErrorCode = {
  UNBIND_OTHER: 16003, // 解绑其他手机号关联绑定
  EXPIRED_CODE: 16004, // 7天未登录
  SWITCH_HAS_UNBIND: 17025, // 切换手机号时已删除解绑
  FORBID_SWITCH_LOGIN: 17021, // 手机号禁止切换登录
} as const

/** 协议标题 */
export const AgreementLabel = {
  USER_AGREEMENT: '《用户协议》',
  PRIVACY_AGREEMENT: '《隐私政策》',
} as const

/** 协议 id */
export const AgreementId = {
  USER_AGREEMENT_ID: 127,
  PRIVACY_AGREEMENT_ID: 131,
} as const

/** 默认倒数计时 */
export const DefaultCountDown = 60

/** 添加手机号弹窗校验信息 */
export const AddDialogCheckMessage = {
  MOBILE_EMPTY: '请输入手机号',
  MOBILE_LENGTH_CHECK: '请输入11位手机号',
  MOBILE_CHECK: '请输入正确的手机号',
  SMS_CODE_EMPTY: '请输入验证码',
  SMS_CODE_CHECK: '请输入正确的验证码',
} as const

/** 短信验证码类型(老 utils/constants CAPTCHA_TYPE) */
export const CAPTCHA_TYPE = {
  LOGIN: 7, // 登录
  FORGET_PASSWORD: 8, // 忘记密码
  RESET_PASSWORD: 9, // 重置密码
  LOG_OFF: 11, // 用户注销
  SWITCH_LOGIN_MOBILE: 12, // 切换登录手机号
  FORGET_PASSWORD_2024: 18, // 忘记密码-新
  PSW_LOGIN_CHECK_DEVICE: 15, // 密码登录验证新设备
} as const

/** 风控校验弹窗返回展示弹窗类型(与 module-customer-code/consts 一致) */
export const VerifyDialogType = {
  DIGITAL_PIC: 1, // 数字图片
  HAS_LOCKED: 2, // 校验被锁定，不需要验证弹窗
  SLIDE_BLOCK: 4, // 滑块
} as const

/** 接口错误异常码 */
export const ErrorResultCode = {
  VERIFY_CODE: 264587, // 风控校验码
  FREQUENCY_TOO_FAST: 10122, // 短信验证码发送频率过快
} as const
