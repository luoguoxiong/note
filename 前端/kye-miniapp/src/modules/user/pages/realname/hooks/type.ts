/**
 * 实名认证相关类型定义
 */
export enum IdTypeEnum {
  '身份证人像面' = '1',
  '身份证国徽面' = '2',
  '营业执照' = '3',
  '组织机构代码' = '4',
  '税务登记证' = '5',
  '外国人永久居留证人像面' = '6',
}
/** 基础认证信息接口 */
interface BaseAuthInfo {
  id?: string
}

/** 个人认证信息 */
export interface PersonalInfo extends BaseAuthInfo {
  idCardName: string
  idCardNo: string
  idType?: number | string
}

/** 企业认证信息 */
export interface EnterpriseInfo extends BaseAuthInfo {
  certificationName: string
  certificationCode: string
  enterpriseType?: number
}

/** 个人信息扩展（包含 OCR 支持标识） */
export interface PersonInfo extends BaseAuthInfo {
  isSupportForeignOCR?: boolean
  [key: string]: any
}

/** 强制验证对象 */
export interface ForceVerifyObj {
  orderPageSource?: string // 下单页的来源，single: 单票，batch: 批量
  uniqueId?: string // 强制认证唯一标识
  forceFlag?: string // 是否开启强制开关，'10': 关闭，'20': 开启
  otherPhone?: string // 他人手机号，采用前端base64加密
  idName?: string // 姓名
  isFromShare?: string // 是否下单分享
  isFromBaqiang?: string // 是否巴枪扫码实名
}

/** 认证详情响应 */
export interface AuthDetailResponse {
  personCertification: PersonalInfo | null
  enterpriseCertification: EnterpriseInfo | null
  noticeExplain: string
  personFirstFlag: string
  enterpriseFirstFlag: string
  isSupportForeignOCR?: boolean
  customerType?: string
  enterpriseDisableFlag: string
}

/** 用户信息响应 */
export interface UserInfoResponse {
  customerCode?: string
  customCode?: string
}

/** 路由名称类型 */
export type RouteName = 'Personal' | 'Enterprise' | 'ViewVerifyInfo'

/** 认证类型 */
export type AuthType = 'personal' | 'enterprise'

/** 认证状态 */
export interface AuthStatus {
  isAuthenticated: boolean
  showReward: boolean
  info: PersonalInfo | EnterpriseInfo | null
}

/** 认证卡片配置 */
export interface AuthCardConfig {
  type: AuthType
  isAuthenticated: boolean
  info: PersonalInfo | EnterpriseInfo | null
  showReward: boolean
  isDisabled?: boolean
  description?: string
  showTooltip?: boolean
}

// 接口错误异常码
export const ErrorResultCode = Object.freeze({
  VERIFY_CODE: 264587, // 风控校验码
  CUSTOMER_CODE_ERROR: 60040, // 客户编码错误
  NO_BIND_RELATION: 60404, // 当前无绑定关系
  REPEAT_REGRANT: 1106008, // 付款授权重复授权
  WAYBILL_HAS_VERIFIED: 40003, // 运单已实名
})

// 风控校验弹窗返回展示弹窗类型
export const VerifyDialogType = Object.freeze({
  DIGITAL_PIC: 1, // 数字图片
  HAS_LOCKED: 2, // 校验被锁定，不需要验证弹窗
  SLIDE_BLOCK: 4, // 滑块
})

export const DIALOGTYPE = {
  // 同步设置昵称弹窗
  synchronize: '同步设置昵称弹窗',
  // 确认修改昵称弹窗
  confirmEdit: '确认修改昵称弹窗',
}

export const PATHTYPE = {
  order_submit: '下单成功',
  order_page: '下单页',
}

// 用户有效证件类型
export const IdType = {
  RESIDENT_ID_NO: 1, // 居民身份证
  RESIDENT_GAT_ID_NO: 7, // 港澳台居住证
  FOREIGNER_ID_NO: 10, // 外国人永久居住证
}

export const IdTypeConfig = {
  RESIDENT: {
    idNumberLabel: '居民身份证号',
    idNumberPlaceholder: '请输入您的居民身份证号',
    subTips: '应国家监管要求，寄件人须实名认证，请完善寄件人的实名信息，实名后将减少取货实名时间，为您提升取货服务效率',
  },
  RESIDENT_GAT: {
    idNumberLabel: '港澳台居民居住证号',
    idNumberPlaceholder: '请输入您的港澳台居民居住证号',
    subTips: '应国家监管要求，寄件人须实名认证，请完善寄件人的实名信息，实名后将减少取货实名时间，为您提升取货服务效率',
  },
  FOREIGNER: {
    idNumberLabel: '外国人永久居留身份证号',
    idNumberPlaceholder: '请输入您的外国人永久居留身份证号',
    subTips:
      '根据交通部《邮件快件实名收寄管理办法》等有关规定，为了更好地向您提供邮件快件的收寄件服务，需要您提供真实有效的身份信息，在交件时出示有效身份证件，便于取派员进行查验和登记，我司承诺将根据《隐私政策》的约定保护您提供的身份信息',
  },
}

// 巴枪实名认证扫码验证状态
export const QrcodeCheckResult = {
  NO_VERIFY: 0, // 未认证
  VERIFIED_REMIND_USE: 1, // 已认证，需提醒是否使用
  VERIFIED: 2, // 已认证，提示已完成
}

// 用户有效证件类型
export const IdTypeValue = {
  '01': '居民身份证', // 居民身份证
  '06': '港澳台居住证', // 港澳台居住证
  '07': '港澳台居住证', // 港澳台居住证
  '10': '外国人永久居住证', // 外国人永久居住证
}

// 巴枪扫码认证类型
export const PersonQrCodeType = {
  PERSON_VERIFY: 10, // 个人认证
  ENTERPRISE_DELIVERY: 20, // 企业交货人认证
}

export interface PersonalModel {
  id?: string
  from: number
  idType: number
  collectMethod: number
  addressType: number
  userType: number
  userTypeStatus: number
  idCardName: string
  idCardNo: string
  otherPhone: string
  gender: number
  address: string
  idCardFrontPic: string
  idCardFrontReversePic: string
  safeVerifyId?: string
}
