export type KyInputProps = Partial<{
  /**
   * 输入框的值
   */
  modelValue: string
  /**
   * 边框样式
   */
  border: 'all' | 'bottom' | 'none'
  /**
   * 输入框类型
   */
  type?: 'text' | 'number' | 'idcard' | 'digit' | 'safe-password' | 'nickname'
  /**
   * 占位文本
   */
  placeholder?: string
  /**
   * 占位文本样式
   */
  placeholderStyle?: string
  /**
   * 是否自定义占位文本
   */
  customPlaceholder?: boolean
  /**
   * 是否禁用输入框
   */
  disabled?: boolean
  /**
   * 最大输入长度
   */
  maxlength?: number
  /**
   * 是否自动聚焦
   */
  focus?: boolean
  /**
   * 是否保持键盘不收起
   */
  confirmHold?: boolean
  /**
   * 光标位置
   */
  cursor?: number
  /**
   * 微信端-键盘弹起时是否自动上推页面 (cursorSpacing存在时必须为true)
   */
  adjustPosition?: boolean
  /**
   * 是否保持键盘不收起
   */
  holdKeyboard?: boolean
  /**
   * 确认按钮类型
   */
  confirmType?: 'send' | 'search' | 'next' | 'go' | 'done'
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
   * (支付宝系)是否强制使用系统键盘和 Web-view 创建的 input 元素
   */
  alwaysSystem?: boolean
  /**
   * (支付宝系)是否启用原生组件
   */
  enableNative?: boolean
  /**
   * 删除按钮-显示空间预留(优先级高)
   */
  clearDisplay?: boolean
  /**
   * 清除按钮触发方式
   */
  clearTrigger?: 'focus' | 'always'
  /**
   * 格式化函数
   */
  formatter?: (val: string) => string
  /**
   * input事件触发防抖间隔(ms)
   */
  inputDebounce: number
  /**
   * 文本对齐方式
   */
  textAlign?: 'left' | 'right'
  /**
   * 微信端键盘顶起间隔
   */
  cursorSpacing?: number
  /**
   * 是否只读
   */
  readonly?: boolean

  /** 微信小程序密码模式 */
  password?: boolean
}>
