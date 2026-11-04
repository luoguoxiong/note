<template>
  <div
    :id="`ky-swiper-${kySwiperId}`"
    ref="container"
    class="ky-swiper"
    v-bind="$attrs"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div :class="['ky-swiper-inner', { 'ky-swiper-vertical': isVertical }]" :style="state.style">
      <slot></slot>
    </div>
    <slot name="page">
      <div
        v-if="paginationVisible"
        :style="isVertical ? { left: `${paginationOffset}rpx` } : { bottom: `${paginationOffset}rpx` }"
        :class="['ky-swiper-pagination', { 'ky-swiper-pagination-vertical': isVertical }]"
      >
        <i
          v-for="(item, index) in state.children.length"
          :key="index"
          :style="{
            backgroundColor: activePagination === index ? paginationColor : paginationUnselectedColor,
          }"
          :class="{ active: activePagination === index }"
        />
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup name="ky-swiper">
import Taro from '@tarojs/taro'
import {
  ref,
  reactive,
  computed,
  onDeactivated,
  onMounted,
  onBeforeUnmount,
  provide,
  watch,
  nextTick,
  useSlots,
  expose,
} from 'vue'
import { useTouch } from './hooks/useTouch'
import requestAniFrame from './hooks/raf'
import { SWIPER_KEY } from './hooks'
import { debounce } from '@packages/__components/checkbox/src/utils'

const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max)

const props = defineProps({
  width: [Number, String],
  height: [Number, String],
  direction: {
    type: String,
    default: 'horizontal', // horizontal and vertical
  },
  paginationVisible: {
    type: Boolean,
    default: false,
  },
  paginationColor: {
    type: String,
    default: 'rgba(255, 255, 255, 1)',
  },
  loop: {
    type: Boolean,
    default: true,
  },
  duration: {
    type: [Number, String],
    default: 500,
  },
  autoPlay: {
    type: [Number, String],
    default: 0,
  },
  initPage: {
    type: [Number, String],
    default: 0,
  },
  touchable: {
    type: Boolean,
    default: true,
  },
  isPreventDefault: {
    type: Boolean,
    default: true,
  },
  isStopPropagation: {
    type: Boolean,
    default: true,
  },
  paginationUnselectedColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.5)',
  },
  paginationOffset: {
    type: Number,
    default: 12,
  },
  images: {
    type: Array,
    default: () => [],
  },
  scale: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['change'])

const container = ref<HTMLElement | null>(null)
const kySwiperId = ref<string>(String(Date.now()))
const state = reactive({
  active: 0,
  num: 0,
  rect: null as DOMRect | null,
  width: 0,
  height: 0,
  moving: false,
  offset: 0,
  touchTime: 0,
  autoplayTimer: null as NodeJS.Timeout | undefined | null,
  children: [] as any[],
  childrenVNode: [] as any[],
  style: {},
})

const touch = useTouch()

const slots = useSlots()

const isVertical = computed(() => props.direction === 'vertical')

const delTa = computed(() => {
  return isVertical.value ? touch.deltaY.value : touch.deltaX.value
})

const isCorrectDirection = computed(() => {
  return touch.direction.value === props.direction
})

const childCount = computed(() => state.children.length)

const size = computed(() => state[isVertical.value ? 'height' : 'width'])
console.log(size.value)

const trackSize = computed(() => childCount.value * size.value)

const minOffset = computed(() => {
  if (state.rect) {
    const base = isVertical.value ? state.rect.height : state.rect.width
    return base - size.value * childCount.value
  }
  return 0
})

const activePagination = computed(() => (state.active + childCount.value) % childCount.value)

const getStyle = () => {
  let offset = 0
  offset = state.offset
  state.style = {
    transitionDuration: `${state.moving ? 0 : props.duration}ms`,
    transform: `translate${isVertical.value ? 'Y' : 'X'}(${offset}px)`,
    [isVertical.value ? 'height' : 'width']: `${size.value * childCount.value}px`,
    [isVertical.value ? 'width' : 'height']: `${isVertical.value ? state.width : state.height}px`,
    willChange: 'transform',
  }
}

const childrenMap = {}
// let childeLength = 0
const relation = (child: any) => {
  if (!child) return
  childrenMap['uid' + child.uid] = {
    proxy: child.proxy,
    vnode: child.vnode,
  }
  // childeLength++
  if (Object.keys(childrenMap).length >= props.images.length) {
    setChild()
  }
}

const setChild = debounce(() => {
  state.children.length = 0
  state.childrenVNode.length = 0
  Object.keys(childrenMap).forEach((k) => {
    state.childrenVNode.push(childrenMap[k].vnode)
    state.children.push(childrenMap[k].proxy)
  })
}, 10)

const getOffset = (active: number, offset = 0) => {
  let currentPosition = active * size.value
  if (!props.loop) {
    currentPosition = Math.min(currentPosition, -minOffset.value)
  }

  let targetOffset = offset - currentPosition
  if (!props.loop) {
    targetOffset = clamp(targetOffset, minOffset.value, 0)
  }

  return targetOffset
}

const getActive = (pace: number) => {
  const { active } = state
  if (pace) {
    if (props.loop) {
      return clamp(active + pace, -1, childCount.value)
    }
    return clamp(active + pace, 0, childCount.value - 1)
  }
  return active
}

const move = ({ pace = 0, offset = 0, isEmit = false }) => {
  if (props.scale !== 1) {
    return
  }
  if (childCount.value <= 1) return

  const { active } = state

  const targetActive = getActive(pace)
  const targetOffset = getOffset(targetActive, offset)

  if (props.loop) {
    if (state.children[0] && targetOffset !== minOffset.value) {
      const rightBound = targetOffset < minOffset.value
      const setOffset = state.children[0].setOffset ?? state.children[0].$.exposed.setOffset
      setOffset && setOffset(rightBound ? trackSize.value : 0)
    }
    if (state.children[childCount.value - 1] && targetOffset !== 0) {
      const leftBound = targetOffset > 0
      const setOffset =
        state.children[childCount.value - 1].setOffset ?? state.children[childCount.value - 1].$.exposed.setOffset
      setOffset && setOffset(leftBound ? -trackSize.value : 0)
    }
  }

  state.active = targetActive
  state.offset = targetOffset

  if (isEmit && active !== state.active) {
    emit('change', activePagination.value)
  }

  getStyle()
}

const resetPosition = () => {
  state.moving = true

  if (state.active <= -1) {
    move({ pace: childCount.value })
  }
  if (state.active >= childCount.value) {
    move({ pace: -childCount.value })
  }
}

const stopAutoPlay = () => {
  if (state.autoplayTimer) {
    clearTimeout(state.autoplayTimer)
  }
}

const jump = (pace: number) => {
  resetPosition()
  touch.reset()

  requestAniFrame(() => {
    requestAniFrame(() => {
      state.moving = false
      move({ pace, isEmit: true })
    })
  })
}

const prev = () => {
  jump(-1)
}

const next = () => {
  jump(1)
}

const to = (index: number) => {
  resetPosition()

  touch.reset()

  requestAniFrame(() => {
    state.moving = false
    let targetIndex
    if (props.loop && childCount.value === index) {
      targetIndex = state.active === 0 ? 0 : index
    } else {
      targetIndex = index % childCount.value
    }
    move({
      pace: targetIndex - state.active,
      isEmit: true,
    })
  })
}

const autoplay = () => {
  if (+props.autoPlay <= 0 || childCount.value <= 1) return
  stopAutoPlay()

  state.autoplayTimer = setTimeout(() => {
    next()
    autoplay()
  }, Number(props.autoPlay))
}

const init = (active: number = +props.initPage) => {
  stopAutoPlay()
  const query = Taro.createSelectorQuery()
  query
    .select(`#ky-swiper-${kySwiperId.value}.ky-swiper`)
    .boundingClientRect()
    .exec(function (res) {
      console.log(res, `#ky-swiper-${kySwiperId.value}`)
      if (Array.isArray(res)) {
        const [rect] = res
        if (rect) {
          state.rect = rect
          active = Math.min(childCount.value - 1, active)
          state.width = props.width ? +props.width : (state.rect as DOMRect).width
          state.height = props.height ? +props.height : (state.rect as DOMRect).height
          state.active = active
          state.offset = getOffset(state.active)
          state.moving = true
          getStyle()

          autoplay()
        }
      }
    })
}

const onTouchStart = (e: TouchEvent) => {
  if (props.isPreventDefault) e.preventDefault()
  if (props.isStopPropagation) e.stopPropagation()
  if (!props.touchable) return
  touch.start(e)
  state.touchTime = Date.now()
  stopAutoPlay()
  resetPosition()
}

const onTouchMove = (e: TouchEvent) => {
  if (props.touchable && state.moving) {
    touch.move(e)
    if (isCorrectDirection.value) {
      move({ offset: delTa.value })
    }
  }
}

const onTouchEnd = () => {
  if (!props.touchable || !state.moving) return
  const speed = delTa.value / (Date.now() - state.touchTime)
  const isShouldMove = Math.abs(speed) > 0.3 || Math.abs(delTa.value) > +(size.value / 2).toFixed(2)

  if (isShouldMove && isCorrectDirection.value) {
    let pace = 0
    const offset = isVertical.value ? touch.offsetY.value : touch.offsetX.value
    if (props.loop) {
      pace = offset > 0 ? (delTa.value > 0 ? -1 : 1) : 0
    } else {
      pace = -Math[delTa.value > 0 ? 'ceil' : 'floor'](delTa.value / size.value)
    }
    move({
      pace,
      isEmit: true,
    })
  } else if (delTa.value) {
    move({ pace: 0 })
  }
  state.moving = false
  getStyle()
  autoplay()
}

provide(SWIPER_KEY, {
  props,
  size,
  relation,
})

defineExpose({
  prev,
  next,
  to,
})

onDeactivated(() => {
  console.log('onDeactivated')
  stopAutoPlay()
})

onMounted(() => {
  // childeLength = 0
})

onBeforeUnmount(() => {
  console.log('onBeforeUnmount')
  stopAutoPlay()
})

// watch(
//   () => props.initPage,
//   (val) => {
//     nextTick(() => {
//       init(Number(val))
//     })
//   },
// )

watch(
  () => props.height,
  () => {
    nextTick(() => {
      init()
    })
  },
)

watch(
  () => state.children.length,
  () => {
    nextTick(() => {
      init()
    })
  },
)

watch(
  () => props.autoPlay,
  (val) => {
    ;+val > 0 ? init() : stopAutoPlay()
  },
)
</script>

<style lang="scss">
.ky-swiper {
  position: relative;
  display: flex;
  transition-property: transform;
  box-sizing: content-box;
  overflow: hidden;
  cursor: grab;
  user-select: none;

  &-inner {
    display: flex;
    height: 100%;
  }

  &-vertical {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
  }

  &-pagination {
    display: flex;
    height: 4px;
    position: absolute;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);

    i {
      width: 16px;
      height: 4px;
      margin-right: 4px;
      border-radius: 2px;
      background-color: rgba(255, 255, 255, 0.5);

      &:last-child {
        margin-right: 0;
      }

      &.active {
        background-color: '#fff';
      }
    }
  }

  &-pagination-vertical {
    top: 50%;
    left: 12px;
    bottom: auto;
    flex-direction: column;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    transform: translateY(-50%);

    i {
      margin-bottom: 5px;
    }
  }
}
</style>
