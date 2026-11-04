export type PickerPopProps = PickerNewProps & {
  /**
   * 是否使用popup, 关闭picker直接展示列
   * @default true
   */
  poppable?: boolean
  /**
   * popup 状态显示变量
   */
  show: boolean
}

export type PickerNewProps = Partial<{
  /**
   * 列数据
   * @defualt []
   */
  columns: PickerOption[] | undefined
  /**
   * 默认选中项
   * @default []
   */
  modelValue: (string | number)[]
  /**
   * toolbar 顶部栏title
   */
  title: string
  /**
   * toolbar 顶部栏关闭按钮文案
   * @default 取消,设置为空字符串则不展示
   */
  cancelButtonText?: string
  /**
   * toolbar 顶部栏确认按钮文案
   * @default 确认,设置为空字符串则不展示
   */
  confirmButtonText?: string

  /**
   * 是否展示顶部栏
   */
  showToolbar?: boolean
  optionHeight?: number | string
  /**
   * 可见的选项个数
   */
  visibleOptionNum?: number | string
  /**
   * 滚动持续时间(仅H5)
   */
  swipeDuration: number
  /**
   * 是否展示底部按钮(popup模式)
   * @default true
   */
  showFooterBtn?: boolean
  footerConfirmText?: string
  /*
   * 是否展示loading状态
   */
  loading?: boolean,
  /* 是否展示关闭按钮 */
  showClose?: boolean
}>

export interface PickerFieldNames {
  text?: string
  value?: string
  children?: string
  className?: string
}

export interface PickerOption {
  [key: PropertyKey]: any
  text?: string | number
  value?: string | number
  disabled?: string
  children?: PickerOption[]
  className?: string | number
}

export interface PickerInstance {
  confirm: () => void
  cancel: () => void
}

export interface PickerValues {
  selectedValue: any[]
  selectedOptions: PickerOption[]
}

/* pickerHeader 入参配置 */
export type PickerHeaderProps = {
  showToolbar?: boolean
  title?: string
  cancelButtonText?: string
  confirmButtonText?: string
  showClose?: boolean
}
