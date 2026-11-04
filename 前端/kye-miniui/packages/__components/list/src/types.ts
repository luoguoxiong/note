export type ScrollViewProps = {
  scrollX?: boolean
  scrollY?: boolean
  scrollTop?: number
  scrollLeft?: number
  upperThreshold?: number
  lowerThreshold?: number
  scrollIntoView?: string
  scrollWithAnimation?: boolean
  enableBackToTop?: boolean
  trapScroll?: boolean
}

export type ListProps = {
  /** 是否禁用下拉刷新 */
  disabledRefresh?: boolean
  /** 是否处于下拉加载中状态 */
  refreshing?: boolean
  /** 触发下拉刷新的距离 */
  pullDistance?: number
  /** 顶部内容高度,大于pullDistance高度 */
  headHeight?: number
  /** 下拉过程提示文案 */
  pullingText?: string
  /** 释放过程提示文案 */
  loosingText?: string
  /** 刷新过程提示文案 */
  refreshingText?: string
  /** 刷新成功提示时长 */
  refreshSuccessDuration?: number
  /** 刷新成功提示文案 */
  refreshSuccessText?: string
  /** 刷新成功提示文案 */
  showScrollbar?: boolean
  // =====================
  /** 是否禁用上拉加载 */
  disabledLoad?: boolean
  /** 是否处于上拉加载中 */
  loading?: boolean
  /** 是否完成加载 */
  isFinished?: boolean
  /** 上拉加载中文案 */
  loadingText?: string
  /** 加载完成后的提示文案 */
  finishedText?: string
  /** 距离底部多远时触发 onLoad */
  lowerThreshold?: number
  isEmpty?: boolean
  isLoadFail?: boolean
  noData?: boolean
  showLoading?: boolean
  /* scroll-view 相关props */
  scrollViewProps?: ScrollViewProps
}

export interface RefreshStatus {
  /** 下拉开始的起点，用于记录用户触摸的初始位置（x 和 y 坐标），便于计算拖拽高度 */
  startPoint: { pageX: number; pageY: number } | null

  loosing: boolean

  /** 当前拖拽的高度，用于动态计算刷新视图的高度或动画效果 */
  dragHeight: number
}
