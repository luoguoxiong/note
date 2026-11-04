/**
 * 申请绑定其他公司 - 核心数据类型定义
 */

// ==================== 表单数据类型 ====================

/** 客户编码输入项 */
export interface CompanyItem {
  /** 客户编码值 */
  customerCode: string
  /** 错误信息 */
  errorMsg: string
  /** 警告信息（重复等） */
  warningMsg: string
  /** 是否显示推荐列表 */
  show: boolean
  /** 是否正在输入 */
  inputing: boolean
}

/** 推荐公司列表项 */
export interface RecommendItem {
  /** 客户编码 */
  customerCode: string
  /** 公司简称 */
  customerShortName: string
  /** 是否已被选中 */
  selected: boolean
  /** 公司名称（完整） */
  customerName?: string
}

/** 表单状态 */
export interface ApplyBindFormState {
  /** 可见的客户编码 key 列表 (如 ['customerCode1', 'customerCode3']) */
  visibleKeys: string[]
  /** 表单数据 */
  localModel: Record<string, string>
  /** 当前绑定的客户编码 */
  currentCode: string
  /** 申请原因 */
  reason: string
  /** 原因错误标识 */
  errorReason: boolean
  /** 是否正在提交 */
  loading: boolean
  /** 推荐列表原始数据 */
  recommendList: RecommendItem[]
  /** 过滤后的推荐列表 */
  realList: RecommendItem[]
  /** 当前聚焦的索引（用于错误提示定位） */
  curBlurIndex: number | null
  /** 原因文本框是否正在输入 */
  textareaInputing: boolean
  /** 图形验证码弹窗是否显示 */
  showCaptcha: boolean
  /** 离开确认弹窗是否显示 */
  showAlert: boolean
  /** 安全验证ID（图形验证码） */
  safeVerifyId: string
}

// ==================== 组件 Props 类型 ====================

/** 主页面 Props */
export interface ApplyBindProps {
  /** 来源渠道 */
  source?: string
  /** 页面标题 */
  title?: string
}

// ==================== API 响应类型 ====================

/**
 * 获取推荐公司列表 - 返回值
 * @see getFrontRecommendCustomer
 */
export interface FrontRecommendCustomerResponse extends Array<RecommendCustomerInfo> {}

/** 推荐公司信息 */
export interface RecommendCustomerInfo {
  /** 客户编码 */
  customerCode: string
  /** 公司简称 */
  customerShortName: string
  /** 公司名称（完整） */
  customerName?: string
}

/**
 * 校验是否可申请绑定其他公司 - 返回值
 * @see applyBindOtherCustomerCheck
 */
export interface ApplyBindOtherCheckResponse {
  /** 是否可申请 */
  canApply?: boolean
  /** 错误信息 */
  errorMsg?: string
}

/**
 * 提交绑定其他公司申请 - 返回值
 * @see bindOtherCustomerList
 */
export interface BindOtherCustomerListResponse {
  code: number
  data: {
    /** 状态码 (1=成功) */
    status: number
    /** 消息 */
    message?: string
  }
  msg: string
}

/**
 * 批量黑名单校验 - 返回值
 * @see batchCheckBlackCustomerCode
 */
export interface BatchCheckBlackResponse {
  code: number
  data: {
    /** 错误列表 */
    errList: Array<{
      /** 客户编码 */
      customerCode: string
      /** 错误信息 */
      errorMsg: string
    }>
  }
  msg: string
}

// ==================== 常量类型 ====================

/** 最大客户编码数量 */
export const MAX_COMPANY_COUNT = 9

/** 最小客户编码数量 */
export const MIN_COMPANY_COUNT = 1

/** 申请原因最大长度 */
export const MAX_REASON_LENGTH = 100

/** 推荐列表最大展示数量 */
export const MAX_RECOMMEND_LIST = 10

/** 长名称阈值（>=此值换行） */
export const LONG_NAME_THRESHOLD = 12
