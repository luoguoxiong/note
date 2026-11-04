/**
 * 客户编码模块常量
 * 来源:
 *  - customer-code/constants/index.js (CompanyInfoType)
 *  - netc-pc-web/src/consts/global.js (VerifyDialogType / ErrorResultCode / CaptchaAppId)
 *  - netc-pc-web/src/views/setting/user/constants/index.js (bindCustomerCodeErrorCode / customerCodeRole)
 */
import { isPROD } from '@/utils/env'

/** 客户编码绑定状态类型 */
export const CompanyInfoType = {
  CHANGE_CUSTOMER_CODE: 10, // 更换（有当前绑定）
  SWITCH_HAS_AUTH: 110, // 切换（有当前绑定），有关联账号权限
  SWITCH_NO_AUTH: 111, // 切换（有当前绑定），无关联账号权限
  BIND_HAS_RECOMMEND: 120, // 绑码（无当前绑定），有推荐
  BIND_NO_RECOMMEND: 121, // 绑码（无当前绑定），无推荐
  BIND_HAS_RELATION_BIND: 122, // 绑码（无当前绑定），有关联绑定
} as const
export type CompanyInfoTypeValue = (typeof CompanyInfoType)[keyof typeof CompanyInfoType]

/** 风控校验弹窗返回展示弹窗类型 */
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

/** 腾讯云验证码 CaptchaAppId（生产/非生产区分） */
export const CaptchaAppId = isPROD ? '196664636' : '196905597'

/** 绑定客户编码错误码 */
export const bindCustomerCodeErrorCode = {
  CUSTOMER_CODE_BLOCKED: 111227, // 客户编码已拉黑，已报废错误码
  VERIFY_CHECK: 264587, // 风控校验错误码
  MOBILE_BLOCKED: 34000, // 手机号已被加入黑名单
  HAS_UNBIND: 60037, // 手机号已被解绑
} as const

/** 绑定的客户编码角色 */
export const customerCodeRole = {
  BUSINESS: 1, // 商务
  AUTH: 10, // 主授权
  ADMIN: 20, // 管理员
} as const

/** 角色 code -> 角色名称 */
export const customerCodeRoleName = new Map<number, string>([
  [customerCodeRole.BUSINESS, '商务'],
  [customerCodeRole.AUTH, '主授权'],
  [customerCodeRole.ADMIN, '管理员'],
])
