<template>
  <view class="ky-swipe-cell-wrapper">
    <view
      class="ky-swipe-cell"
      :style="touchStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <view class="ky-swipe-cell__left" :id="leftRefId" ref="leftRef" @click="handleClick($event, 'left', true)">
        <slot name="left"></slot>
      </view>
      <view class="ky-swipe-cell__content" @click="handleClick($event, 'content', lockClick)">
        <slot name="default"></slot>
      </view>
      <!--    <view class="mask__right"></view>-->
      <view class="ky-swipe-cell__right" :id="rightRefId" ref="rightRef" @click="handleClick($event, 'right', true)">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup name="ky-swipe-cell">
import './index.scss'
import { swipeCellProps, SwipePosition } from './types'
import useSwipeWidth from '@packages/__components/swipe-cell/src/useSwipeWidth'
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { useTouch } from '@packages/utils/src/useTouch'
import { SWIPE_KEY } from '@packages/__components/swipe-group/src/types'
import { callInterceptor } from '@packages/utils/src/interceptor'

const props = defineProps(swipeCellProps)
const emit = defineEmits(['open', 'close', 'click', 'update:show'])
const parent = inject(SWIPE_KEY, null) as any
// lockClick 内容区域是否禁用点击自动关闭
const lockClick = ref(false)
const state = reactive({
  offset: 0, // 偏移量
  moving: false, // 是否处于滑动状态
})
/* opened 是否已打开 */
const opened = ref(false)
console.log('swipe-props', props.show, opened.value)

// 滑动方向
let position: SwipePosition = ''
// 上次滑动方向
let oldPosition: SwipePosition = ''
// 是否处于beforeClose状态
let isInBeforeClosing: boolean = false

const { leftRef, rightRef, leftRefWidth, rightRefWidth, leftRefId, rightRefId, initWidth } = useSwipeWidth()

/* 滑动样式 */
const touchStyle = computed(() => {
  return {
    transform: `translate3d(${state.offset}px, 0, 0)`,
  }
})

const setOffset = (deltaX: number) => {
  position = deltaX > 0 ? 'right' : 'left'
  let offset = deltaX
  switch (position) {
    case 'left':
      if (opened.value && oldPosition === position) {
        offset = -rightRefWidth.value
      } else {
        offset = Math.abs(deltaX) > rightRefWidth.value ? -rightRefWidth.value : deltaX
      }
      break
    case 'right':
      if (opened.value && oldPosition === position) {
        offset = leftRefWidth.value
      } else {
        offset = Math.abs(deltaX) > leftRefWidth.value ? leftRefWidth.value : deltaX
      }
      break
  }
  state.offset = offset
}

const touch = useTouch()
const onTouchStart = (event: TouchEvent) => {
  if (props.disabled) return
  touch.start(event)
}

const onTouchMove = (event: TouchEvent) => {
  if (props.disabled) return
  touch.move(event)
  if (touch.isHorizontal()) {
    lockClick.value = true
    state.moving = true
    setOffset(touch.deltaX.value)
  }
}

const onTouchEnd = () => {
  if (state.moving) {
    state.moving = false
    oldPosition = position
    switch (position) {
      case 'left':
        // 滑动自动收起场景: 滑动是否不到宽度一半
        if (Math.abs(state.offset) <= rightRefWidth.value / 2) {
          close()
        } else {
          state.offset = -rightRefWidth.value
          open()
        }
        break
      case 'right':
        if (Math.abs(state.offset) <= leftRefWidth.value / 2) {
          close()
        } else {
          state.offset = leftRefWidth.value
          open()
        }
        break
    }
    setTimeout(() => {
      lockClick.value = false
    }, 0)
  } else {
    // 更新为空，会关闭当前激活的
    parent?.moveEndClose && parent?.update('')
  }
}
/* 打开逻辑 */
const open = (p: SwipePosition = '') => {
  parent && parent.update(props.name)
  opened.value = true
  if (p) {
    state.offset = p === 'left' ? -rightRefWidth.value : leftRefWidth.value
  }
  emit('open', {
    name: props.name,
    position: position || p,
  })
}
/* 关闭逻辑 */
const close = () => {
  state.offset = 0
  if (opened.value) {
    opened.value = false
    emit('close', {
      name: props.name,
      position,
    })
  }
}

const handleClick = (e: Event, position: SwipePosition, lock: boolean) => {
  console.log('click----')
  emit('click', position)
  if (isInBeforeClosing) return
  if (lock) {
    e.stopPropagation()
  }
  if (!lock && opened.value) {
    isInBeforeClosing = true
    callInterceptor(props.beforeClose, {
      args: [
        {
          e,
          name: props.name,
          position,
        },
      ],
      done: () => {
        isInBeforeClosing = false
        close()
      },
      canceled: () => (isInBeforeClosing = false),
      error: () => (isInBeforeClosing = false),
    })
  }
}

/* 存在swipe-group 并开启了lock模式 */
if (parent && parent.lock) {
  // 监听当前激活的name
  watch(
    () => parent?.name?.value,
    (name) => {
      if (props.name !== name && parent && parent.lock) {
        close()
      }
    },
  )
}

const initInitialStatus = () => {
  if (props.show) {
    // todo 临时验证
    open('left')
  } else {
    close()
  }
}

/**
 * TODO 双向绑定
 */
watch(
  () => props.show,
  (value) => {
    console.log('show value', value)
    if (value) {
      // todo 临时验证
      open('left')
    } else {
      close()
    }
  },
)

onMounted(() => {
  setTimeout(() => {
    initWidth().then(() => {
      initInitialStatus()
    })
  }, 0)
})

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="scss">
.ky-swipe-cell {
}
</style>
