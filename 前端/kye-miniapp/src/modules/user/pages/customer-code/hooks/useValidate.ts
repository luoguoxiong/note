/**
 * 客户编码表单校验 Hook
 *
 * 提供纯校验函数，与 Store 无关的公共逻辑
 * 包含：客户编码、密码、姓名的校验规则
 */
import { NAME_REGEX, MAX_MEMBER_NAME_LENGTH } from '../constants/regular'
import type { FormErrors, ValidationResult } from '../types/form'

/**
 * 校验客户编码（非空 + 格式 + API校验）
 */
export const validateCustomerCode = async (value: string): Promise<string | undefined> => {
  if (!value || !value.trim()) {
    return '请输入客户编码'
  }

  return undefined
}

/**
 * 校验密码（非空校验）
 */
export const validatePassword = (value: string): string | undefined => {
  if (!value || !value.trim()) {
    return '请输入客户编码密码'
  }

  return undefined
}

/**
 * 校验姓名（选填，但如果填写需符合格式）
 */
export const validateMemberName = (value: string): string | undefined => {
  if (!value) {
    return undefined // 姓名为选填项
  }

  if (NAME_REGEX.test(value)) {
    return '姓名仅支持中英文'
  }

  if (value.length > MAX_MEMBER_NAME_LENGTH) {
    return `姓名不能超过${MAX_MEMBER_NAME_LENGTH}个字符`
  }

  return undefined
}

/**
 * 校验单个字段并返回结果
 */
export const validateField = async (field: keyof FormErrors, value: string): Promise<string | undefined> => {
  switch (field) {
    case 'customerCode':
      return await validateCustomerCode(value)
    case 'customerPassword':
      return validatePassword(value)
    case 'memberName':
      return validateMemberName(value)
    default:
      return undefined
  }
}

/**
 * 校验整个表单
 */
export const validateAll = async (formData: Record<string, string>): Promise<ValidationResult> => {
  const errors: FormErrors = {}

  const customerCodeError = await validateCustomerCode(formData.customerCode)
  if (customerCodeError) {
    errors.customerCode = customerCodeError
  }

  const passwordError = validatePassword(formData.customerPassword)
  if (passwordError) {
    errors.customerPassword = passwordError
  }

  const memberNameError = validateMemberName(formData.memberName)
  if (memberNameError) {
    errors.memberName = memberNameError
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
