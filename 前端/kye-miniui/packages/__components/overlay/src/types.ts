export type OverlayProps = {
  /**
   * 动画持续时间，单位为毫秒
   * 支持单一数值或数组形式 [进场持续时间, 出场持续时间]
   */
  duration?: number | [number, number]
  /**
   * 是否显示遮罩
   */
  show: boolean

  /**
   * 是否隐藏节点
   * @default true
   */
  hideNode: boolean

  /**
   * 是否点击遮罩关闭
   */
  closeOnClickOverlay?: boolean
  /**
   * 遮罩的层级
   */
  zIndex?: number
  /** 自定义遮罩样式 */
  overlayClass?: string
  /* 禁止穿透 */
  catchMove?: boolean
}
