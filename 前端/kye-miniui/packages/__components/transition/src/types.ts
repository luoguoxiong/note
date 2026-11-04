import { type CSSProperties } from 'vue'

/**
 * TransitionProps 定义了用于控制过渡动画组件的属性
 */
export type TransitionProps = {
  /**
   * 是否显示过渡内容
   * @default false
   */
  show: boolean

  /**
   * 是否隐藏节点
   * @default true
   */
  hideNode: boolean

  /**
   * 过渡动画名称
   * 用于指定 CSS 的 `animation-name` 或 Vue 过渡类前缀
   */
  name: string

  /**
   * 过渡动画时间，单位为毫秒
   * 单个数值表示进场和出场时间相同，数组形式 [进场时间, 出场时间] 表示不同时间
   * @default 300
   */
  duration?: number | [number, number]

  /**
   * 自定义容器的类名
   * 用于添加额外的样式类
   */
  customerClass?: (string | false)[]

  /**
   * 自定义容器的内联样式
   * 支持标准 CSS 属性
   */
  customerStyle?: CSSProperties
}
