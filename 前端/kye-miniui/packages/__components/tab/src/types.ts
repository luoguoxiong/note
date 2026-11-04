export type TabValue = number | string
/**
 * 单个标签选项的接口定义。
 */
export interface TabOptions {
  /**
   * 标签的文本内容。
   */
  label: string

  /**
   * 标签上的徽标计数，通常用于显示通知数量。
   */
  badgeCount?: number

  /**
   * 标签上的徽标红点。
   */
  showBadgeDot?: boolean
}

/**
 * Tabs 组件的 Props 定义。
 */
export type TabsProps = {
  /**
   * 当前激活的标签的值。
   */
  modelValue: string | number

  /**
   * 标签选项的数组，每个选项定义了标签的文本、值和徽标计数。
   */
  tabs: TabOptions[]

  /**
   * 是否将标签的宽度均分。
   */
  distributeEvenly?: boolean
  /**
   * 是否展示下画线
   */
  underline?: boolean
  /*
  * 展示下划线-首次动画
  * default: false 不展示首次动画
  * */
  underlineFirstAnimation?: boolean
  /**
   * 展示的最大值
   */
  maxBadgeCount?: number
  /**
   * theme类型：胶囊、普通、dark
   */
  theme: 'default' | 'capsule' | 'dark'
  disabledScrollIntoView?: boolean
  /*
  * noAnimation 关闭动画
  * */
  noAnimation?: boolean
  /*
  * 是否动态tab(动态tab-tab不可使用动画,存在抖动)
  * */
  dynamicTab?: boolean
  /* 左偏移 */
  offsetLeft?: number
  disableTabClick?: boolean
}
