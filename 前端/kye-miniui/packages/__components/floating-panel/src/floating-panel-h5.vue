<template>
  <div
    ref="kyFloatingPanelRef"
    :class="[
      {
        'ky-floating-panel': true,
        'h5-pc': isH5,
      },
    ]"
    :style="rootStyle"
    @mousedown="onStart"
  >
    <div class="ky-floating-panel__header" @touchstart="onTouchStart">
      <slot name="bar">
        <div class="ky-floating-panel__header-bar" :style="{ cursor: 'ns-resize' }"></div>
      </slot>
      <slot name="header"></slot>
    </div>
    <div ref="contentRef" class="ky-floating-panel__content" :style="{ backgroundColor: rootStyle.backgroundColor }">
      <slot :dragBegin="onTouchStart"></slot>
    </div>
    <div class="ky-floating-panel__after" :style="{ backgroundColor: rootStyle.backgroundColor }"></div>
  </div>
</template>

<script lang="ts" setup name="ky-floating-panel-pc">
import Taro from '@tarojs/taro'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { closest, useSyncPropRef, miniuiConfig } from '@ky-miniui-lib/utils'

const { isH5Pc, H5PcWidth } = miniuiConfig.config

const isH5 = Taro.getEnv() === Taro.ENV_TYPE.WEB

const kyFloatingPanelRef = ref<HTMLElement | null>(null)

type FloatingPanelProps = {
  height: number
  duration: number
  backgroundColor: string
  contentDraggable: boolean
  anchors: number[]
}

const props = withDefaults(defineProps<FloatingPanelProps>(), {
  height: 100,
  duration: 0.3,
  backgroundColor: 'none',
  contentDraggable: true,
  anchors: () => [],
})

const emit = defineEmits(['update:height', 'heightChange', 'heightChangeEnd'])

const bubbleState = ref({
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
})

const boundary = computed(() => ({
  min: props.anchors[0] ?? 100,
  max: props.anchors[props.anchors.length - 1] ?? Math.round(bubbleState.value.windowHeight * 0.6),
}))

const anchors = computed(() => (props.anchors.length >= 2 ? props.anchors : [boundary.value.min, boundary.value.max]))

const ease = (moveY: number): number => {
  const absDistance = Math.abs(moveY)
  const { min, max } = boundary.value

  if (absDistance > max) {
    return max + (absDistance - max) * 0.2
  }

  if (absDistance < min) {
    return min - (min - absDistance) * 0.2
  }

  return moveY
}

const panelHeight = useSyncPropRef(
  () => +props.height,
  (value) => {
    emit('update:height', value)
    emit('heightChange', value)
  },
)
const dragging = ref(false)
const startY = ref(0)
const startHeight = ref(0)
const isTouch = ref(false) // 标记是否为触摸事件

const rootStyle = computed(() => {
  const sty: Record<string, string> = {
    backgroundColor: `${props.backgroundColor}`,
    height: `${panelHeight.value}px`,
    transform: `translateX(-50%) translateY(calc(100% - ${panelHeight.value}px))`,
    transition: !dragging.value ? `transform ${props.duration}s cubic-bezier(0.18, 0.89, 0.32, 1.28)` : 'none',
  }
  if (isH5Pc) {
    sty.width = `${H5PcWidth + 2}px`
  }
  return sty
})

// 鼠标按下开始拖拽
const onStart = (e: MouseEvent) => {
  isTouch.value = false
  dragging.value = true
  startY.value = e.clientY
  startHeight.value = panelHeight.value

  // 监听鼠标移动和释放事件
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseEnd)
  // 防止鼠标选中文本
  document.body.style.userSelect = 'none'
}

// 触摸开始
const onTouchStart = (e: TouchEvent) => {
  isTouch.value = true
  dragging.value = true
  const touch = e.touches[0]
  startY.value = touch.clientY
  startHeight.value = panelHeight.value

  // 监听触摸移动和释放事件
  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('touchend', onTouchEnd)
  document.addEventListener('touchcancel', onTouchEnd)
  // 防止触摸选中文本
  document.body.style.userSelect = 'none'
}

// 鼠标移动处理
const onMouseMove = (e: MouseEvent) => {
  if (!dragging.value || isTouch.value) return

  const target = e.target as HTMLElement
  if (!props.contentDraggable && target.dataset.ref && target.dataset.ref === 'contentRef') {
    return
  }

  if (dragging.value && kyFloatingPanelRef.value) {
    const deltaY = startY.value - e.clientY
    panelHeight.value = ease(startHeight.value + deltaY)
  }
}

// 触摸移动处理
const onTouchMove = (e: TouchEvent) => {
  if (!dragging.value || !isTouch.value) return

  // 阻止默认行为，避免页面滚动
  e.preventDefault()
  e.stopPropagation()

  const target = e.target as HTMLElement
  if (!props.contentDraggable && target.dataset.ref && target.dataset.ref === 'contentRef') {
    return
  }

  if (dragging.value && kyFloatingPanelRef.value && e.touches.length > 0) {
    const touch = e.touches[0]
    const deltaY = startY.value - touch.clientY
    panelHeight.value = ease(startHeight.value + deltaY)
  }
}

// 鼠标释放结束拖拽
const onMouseEnd = () => {
  if (isTouch.value) return
  finishDrag()
  // 清理鼠标事件监听
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseEnd)
  document.body.style.userSelect = ''
}

// 触摸结束
const onTouchEnd = () => {
  if (!isTouch.value) return
  finishDrag()
  // 清理触摸事件监听
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
  document.removeEventListener('touchcancel', onTouchEnd)
  document.body.style.userSelect = ''
  isTouch.value = false
}

// 完成拖拽的通用逻辑
const finishDrag = () => {
  if (!dragging.value) return

  dragging.value = false
  const nextH = closest(anchors.value, panelHeight.value)
  panelHeight.value = nextH
  nextTick(() => {
    emit('heightChangeEnd', nextH)
  })
}

onMounted(() => {
  bubbleState.value = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  }
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseEnd)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
  document.removeEventListener('touchcancel', onTouchEnd)
  document.body.style.userSelect = ''
})
</script>

<style lang="scss">
.ky-floating-panel {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100vw;
  z-index: 99;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  will-change: transform;

  &.h5-pc {
    left: 50%;
    transform: translateX(-50%);
  }

  &__header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }

    &-bar {
      height: 8px;
      width: 80px;
      margin-bottom: 16px;
      border-radius: 10px;
      background-color: rgba(0, 0, 0, 0.3);
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    background-color: #fff;
    border-radius: 24px 24px 0px 0px;
  }

  &__after {
    background-color: #fff;
    width: 100vw;
    height: 100vh;
    display: block;
    position: absolute;
    bottom: -100vh;
  }
}
</style>
