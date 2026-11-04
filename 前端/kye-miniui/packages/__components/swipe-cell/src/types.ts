import { ExtractPropTypes, PropType } from 'vue'
import { Interceptor } from '@packages/utils/src/interceptor'

export type SwipePosition = 'left' | 'right' | 'content' | ''

export const swipeCellProps = {
  // 唯一标识（用于group场景）
  name: String,
  show: {
    type: Boolean,
    default: false,
  },
  // 是否禁用滑动
  disabled: {
    type: Boolean,
    default: false,
  },
  // 是否阻止滑动事件行为
  touchMovePreventDefault: {
    type: Boolean,
    default: true,
  },
  // 是否阻止滑动事件冒泡
  touchMoveStopPropagation: {
    type: Boolean,
    default: true,
  },
  beforeClose: Function as PropType<Interceptor>,
} as const

export type SwipeCellProps = ExtractPropTypes<typeof swipeCellProps>
