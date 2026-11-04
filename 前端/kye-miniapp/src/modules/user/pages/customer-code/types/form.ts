/**
 * 表单相关类型定义
 */

/** 校验规则类型 */
export type ValidationRule = (value: string) => Promise<string | void>

/** 表单错误对象 */
export interface FormErrors {
  /** 客户编码错误 */
  customerCode?: string
  /** 密码错误 */
  customerPassword?: string
  /** 姓名错误 */
  memberName?: string
}

/** 表单状态（用于Store或Hook） */
export interface FormState {
  /** 客户编码 */
  customerCode: string
  /** 密码 */
  customerPassword: string
  /** 姓名 */
  memberName: string
}

/** 校验结果 */
export interface ValidationResult {
  /** 是否通过 */
  valid: boolean
  /** 错误信息 */
  errors: FormErrors
}
