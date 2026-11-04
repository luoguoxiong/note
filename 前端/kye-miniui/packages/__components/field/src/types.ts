import { KyInputProps } from '../../input/src/types'
import { PopoverLocation } from '../../popover/src/types'

export interface FormItemRuleWithoutValidator {
  [key: string]: any
  regex?: RegExp
  required?: boolean
  message?: string
}

export interface FormItemRule extends FormItemRuleWithoutValidator {
  validator?: (
    value: any,
    ruleCfg: FormItemRuleWithoutValidator,
  ) => boolean | Promise<string> | Promise<boolean> | Promise<void> | Promise<unknown>
}

interface FormItemRuleType {
  required: boolean // 是否为必选字段
  message: string // 错误提示文案
  validator: (value: string, rule?: FormItemRule) => boolean | Promise<void> // 通过函数进行校验
  regex: RegExp // 通过正则表达式进行校验
}

interface PopoverConfigType {
  placement?: PopoverLocation
  offset?: [number, number]
  content?: string
}

export interface FieldProps extends KyInputProps {
  prop: string
  isError?: boolean
  label?: string
  labelPosition?: 'top' | 'left'
  labelAlign?: 'center' | 'right' | 'left'
  showWordLimit?: boolean
  clearTrigger?: 'focus' | 'always'
  formatter?: (val: string) => string
  required?: boolean
  rules: FormItemRuleType[] // 定义校验规则
  popoverConfig?: PopoverConfigType
  hiddenPopover?: boolean
  listenClickId?: string
  readonly?: boolean
  enableNative?: boolean
  textAlign?: 'left' | 'right' // 输入框内容展示位置
  customPlaceholder?: boolean
  inputDebounce?: number // input触发节流时间
  clearDisplaySpace?: boolean
  cursorSpacing?: number
  adjustPosition: boolean
  clearable: boolean
  labelWidth: number
}
