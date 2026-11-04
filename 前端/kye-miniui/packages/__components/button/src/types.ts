// import { ExtractPropTypes } from 'vue'
// import { Button } from '@tarojs/components'

export const buttonProps = {} as const

// export type ButtonProps = ExtractPropTypes<typeof buttonProps>

export type ButtonType = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'default'
export type ButtonSize = 'large' | 'medium' | 'normal' | 'small' | 'mini'
export type ButtonFormType = 'button' | 'submit' | 'reset'
export type ButtonShape = 'square' | 'round'

export type ButtonProps = Partial<{
  /**
   * 按钮类型
   * @default 'default'
   */
  type: ButtonType
  /**
   * 按钮表单类型
   */
  formType: ButtonFormType
  /**
   * 按钮尺寸
   * @default 'normal'
   */
  size?: ButtonSize
  // shape: ButtonShape
  /**
   * 按钮text属性，支持不使用slot-default
   */
  text?: string
  /**
   * 按钮自定义颜色
   */
  color: string
  // 是否朴素按钮
  plain: boolean
  // 是否块级元素
  block: boolean
  // 是否禁用
  disabled: boolean
  /**
   * 是否显示为加载状态,loading状态文案正常展示
   */
  loading: boolean
  /**
   * 加载状态提示文字
   */
  loadingText?: string
  /**
   * 加载图标尺寸大小
   * @default 24px
   */
  loadingSize?: string | number
}>
