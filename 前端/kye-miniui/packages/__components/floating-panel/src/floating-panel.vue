<template>
  <div
    ref="kyFloatingPanelRef"
    :class="[
      {
        'ky-floating-panel': true,
        'ky-safe-area-bottom': props.safeAreaInsetBottom,
      },
    ]"
    :style="rootStyle"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div class="ky-floating-panel__header">
      <slot name="bar">
        <div class="ky-floating-panel__header-bar" :style="{ cursor: 'ns-resize' }"></div>
      </slot>
      <slot name="header"></slot>
    </div>
    <div
      ref="contentRef"
      class="ky-floating-panel__content"
      :style="{ backgroundColor: rootStyle.backgroundColor }"
    >
      <slot></slot>
    </div>
    <div class="ky-floating-panel__after" :style="{ backgroundColor: rootStyle.backgroundColor }"></div>
  </div>
</template>

<script lang="ts" setup name="ky-floating-panel">
import Taro from '@tarojs/taro'
import { ref, computed, onMounted, nextTick } from 'vue'
import { closest, useSyncPropRef } from '@ky-miniui-lib/utils'

const kyFloatingPanelRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)

type FloatingPanelProps = {
  height: number
  duration: number
  backgroundColor: string
  contentDraggable: boolean
  anchors: number[]
  safeAreaInsetBottom: boolean
}

const props = withDefaults(defineProps<FloatingPanelProps>(), {
  height: 100,
  duration: 0.3,
  backgroundColor: 'none',
  contentDraggable: true,
  anchors: [],
  safeAreaInsetBottom: true,
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

const rootStyle = computed(() => ({
  backgroundColor: `${props.backgroundColor}`,
  height: `${boundary.value.max}px`,
  transform: `translateY(calc(100% + ${-panelHeight.value}px))`,
  transition: !dragging.value ? `transform ${props.duration}s cubic-bezier(0.18, 0.89, 0.32, 1.28)` : 'none',
}))

const onTouchStart = (e: TouchEvent) => {
  console.log(e, 'onTouchStart')
  const touch = e.touches[0]
  dragging.value = true
  startY.value = touch.clientY
  startHeight.value = panelHeight.value
}

const onTouchMove = (e: TouchEvent) => {
  console.log('onTouchMove', e)
  const target = e.target
  if (!props.contentDraggable && target.dataset.ref && target.dataset.ref === 'contentRef') {
    return
  }
  const touch = e.touches[0]
  if (dragging.value && kyFloatingPanelRef.value) {
    const deltaY = startY.value - touch.clientY
    panelHeight.value = ease(startHeight.value + deltaY)
  }
}

const onTouchEnd = () => {
  console.log('onTouchEnd')
  dragging.value = false
  const nextH = closest(anchors.value, panelHeight.value)
  panelHeight.value = nextH
  nextTick(() => {
    emit('heightChangeEnd', nextH)
  })
}

onMounted(() => {
  const res = Taro.getSystemInfoSync()
  const windowWidth = res.windowWidth ?? window.innerHeight
  const windowHeight = res.windowHeight ?? window.innerWidth

  bubbleState.value = {
    windowWidth,
    windowHeight,
  }
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
  touch-action: none;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  will-change: transform;

  &__header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: grab;
    user-select: none;

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
