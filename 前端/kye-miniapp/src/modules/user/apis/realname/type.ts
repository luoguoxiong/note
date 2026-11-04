/**
 * 实名认证相关类型定义
 */

/** 个人认证信息 */
export interface PersonalInfo {
  id?: string
  idCardName: string
  idCardNo: string
  idType?: number
}

/** 企业认证信息 */
export interface EnterpriseInfo {
  id?: string
  certificationName: string
  certificationCode: string
  enterpriseType?: number
}

/** 个人信息扩展（包含 OCR 支持标识） */
export interface PersonInfo {
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
