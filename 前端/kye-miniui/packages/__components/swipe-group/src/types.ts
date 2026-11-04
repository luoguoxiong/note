import { ExtractPropTypes } from 'vue'

export const swipeGroupProps = {
  /**
   * 是否互斥模式, 开启子swipe-cell会互斥
   */
  lock: {
    type: Boolean,
    default: false,
  },
  // 是否在滑动结束后关闭已激活的
  moveEndClose: {
    type: Boolean,
    default: false,
  }
} as const

export type SwipeGroupProps = ExtractPropTypes<typeof swipeGroupProps>

export type SwipeGroupInstance = {
  lock: boolean
  name: string
  update: () => void
}

export const SWIPE_KEY = Symbol('swipe-key')
