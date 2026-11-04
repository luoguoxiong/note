import { type CSSProperties } from 'vue'

/** 弹出位置类型 */
export type PopupPosition = 'top' | 'bottom' | 'right' | 'left' | 'center'

/** Popup 组件的属性定义 */
export type PopupProps = {
  /**
   * 是否从页面中脱离出来
   * @default true
   */
  enable: boolean
  /**
   * 是否展示弹窗
   * @default false
   */
  show: boolean

  /**
   * 是否隐藏节点
   * @default true
   */
  hideNode: boolean

  /**
   * 过渡动画持续时间，单位为毫秒
   * 单个值表示进场和出场时间相同，数组形式 [进场时间, 出场时间] 表示不同时间
   * @default 300
   */
  duration?: number | [number, number]

  /**
   * 弹窗的层级
   * @default 1000
   */
  zIndex?: number

  /**
   * 自定义内容容器的类名
   */
  contentClass?: string

  /**
   * 自定义内容容器的内联样式
   */
  contentStyle?: CSSProperties

  /**
   * 弹窗的弹出方向
   * @default "center"
   */
  position?: PopupPosition

  /**
   * 是否点击遮罩关闭弹窗
   * @default true
   */
  closeOnClickOverlay?: boolean

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

  /**
   * 是否有圆角
   * @default true
   */
  round?: boolean
  /**
   * 底部偏移量
   * @default true
   */
  offsetBottom: number
}
