export interface TextareaProps {
  /**
   * 输入框的值
   */
  modelValue: string
  /**
   * 占位文本
   */
  placeholder?: string
  /**
   * 占位文本样式
   */
  placeholderStyle?: string
  /**
   * 是否禁用输入框
   */
  disabled?: boolean
  /**
   * 最大输入长度
   */
  maxlength?: number
  /**
   * 是否保持键盘不收起
   */
  confirmHold?: boolean
  /**
   * 是否自动聚焦
   */
  focus?: boolean
  /**
   * 光标位置
   */
  cursor?: number
  /**
   * 微信端-键盘弹起时是否自动上推页面
   */
  adjustPosition?: boolean
  /**
   * 是否保持键盘不收起
   */
  holdKeyboard?: boolean
  /**
   * 确认按钮类型
   */
  confirmType?: 'send' | 'search' | 'next' | 'go' | 'done' | 'return'
  /**
   * 是否显示错误状态
   */
  isError?: boolean
  /**
   * 是否显示清除按钮
   */
  clearable?: boolean
  /**
   * 是否显示字数统计
   */
  showWordLimit?: boolean
  /**
   * 格式化函数
   */
  formatter?: (val: string) => string
  /**
   * 是否开启文本限制
   */
  isTextLimit?: boolean
  /**
   * 是否开启自定义占位文本
   */
  customPlaceholder?: boolean
  /**
   * modelValue 节流更新间隔
   */
  inputDebounce?: number
}
