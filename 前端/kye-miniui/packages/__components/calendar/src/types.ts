// import { ExtractPropTypes } from 'vue'

export type CalendarDayType =
  | ''
  | 'start'
  | 'start-end'
  | 'middle'
  | 'end'
  | 'selected'
  | 'multiple-middle'
  | 'multiple-selected'
  | 'disabled'
  | 'placeholder'

export type CalendarDayItem = {
  date?: Date
  text?: Numeric
  type?: CalendarDayType
  topInfo?: string
  className?: unknown
  bottomInfo?: string
}

export type CalendarPopupKeys = 'popupable' | 'show'

export type CalendarProps = {
  /** 标题 */
  title: string
  /** 高度 */
  height: string
  /** 是否使用popup true: 弹窗 false: 平铺 */
  popupable: boolean
  /** popup 类型 */
  popupType?: 'popup' | 'popup-simple'
  /** popup 展示字段 */
  show: boolean
  /**
   * 是否隐藏节点
   * @default true
   */
  hideNode: boolean
  /** 日期类型 */
  type: 'single' | 'range' | 'multiple' | 'week'
  /** 起始日期索引 */
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 默认选中日期值 */
  defaultDate: string | string[]
  /** 隐藏快捷选项 */
  hideOptions?: boolean
  /** 快捷选项 */
  options?: {
    label: string
    value: Date[]
  }[]
  /** 日历开始日期 */
  startDate: string
  /** 日历结束日期 */
  endDate: string
  /** 是否允许是同一天 */
  allowSameDay: boolean
  /** 日历禁用日期函数 */
  disabledDate: () => {}
  /** 是否展示tips */
  showTips: boolean
  /** 是否展示确认按钮 */
  showConfirm: boolean
  /**
   * 是否保留顶部安全距离
   * 通常用于适配有刘海屏的设备
   * @default false
   */
  safeAreaInsetTop?: boolean
  /**
   * 是否保留底部安全距离
   * 通常用于适配有底部手势栏的设备
   * @default false
   */
  safeAreaInsetBottom?: boolean

  startPlaceholder?: string
  endPlaceholder?: string
}
