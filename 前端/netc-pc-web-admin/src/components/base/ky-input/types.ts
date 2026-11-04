import { InputProps } from 'element-plus'
import { Placement } from '@popperjs/core/lib/enums'

/**
 * 单行文本框
 */
export type KyInputProps = Partial<InputProps> & {
  border?: boolean // true为全边框；false为仅存在bottom的边
  isError?: boolean // 错误
  disabled?: boolean // 是否禁用
  disabledTips?: string // 禁用提示内容
  effect?: string // 提示弹层风格
  placement?: Placement // 弹层展示位置
  type?: 'text' | 'number' | 'password'
  autofocus?: boolean
  max?: number
  min?: number
  maxlength?: string | number
}

/**
 * 多行文本框
 */
export type KyTextAreaProps = Partial<InputProps> & {
  isError?: boolean // 错误
  maxlength?: number
  permanentMaxLengthTip?: boolean
  rows?: number
}
