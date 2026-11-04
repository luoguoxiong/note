// import { ExtractPropTypes } from 'vue'

// export const floatingBubbleProps = {
// } as const

// export type FloatingBubbleProps = ExtractPropTypes<typeof floatingBubbleProps>

export type FloatingBubbleProps = {
  /** 拖拽双向绑定的返回值 */
  offset: { x: number; y: number } | null
  /**
   * 拖拽的方向，xy 代表自由拖拽，lock 代表禁止拖拽
   */
  axis: ['x', 'y', 'xy', 'lock']
  /**
   * 气泡与窗口的最小间距，单位为 px
   */
  gap: number
  /**
   * 自动磁吸的方向
  */
  magnetic: 'x' | 'y' | null
  safeAreaInsetBottom: boolean
  /**
   * 图片链接
   */
  icon: string
  /**
   * 默认文本
   */
  text: string
}

export interface FloatingBubbleEvents {
  /**
   * 双向数据绑定返回值
   * @event update:offset
   * @param {{x: number, y: number}} offset 位置坐标
   */
  (event: 'update:offset', offset: { x: number; y: number }): void

  /**
   * 点击组件时触发
   * @event click
   * @param {TouchEvent} e 触摸事件对象
   */
  (event: 'click', e: TouchEvent): void

  /**
   * 由用户拖拽导致位置改变时触发
   * @event offsetChange
   * @param {{x: number, y: number}} offset 新的位置信息
   */
  (event: 'offsetChange', offset: { x: number; y: number }): void

  /**
   * 由用户拖拽导致位置改变结束触发
   * @event offsetChangeEnd
   * @param {{x: number, y: number}} offset 最终位置信息
   */
  (event: 'offsetChangeEnd', offset: { x: number; y: number }): void
}
