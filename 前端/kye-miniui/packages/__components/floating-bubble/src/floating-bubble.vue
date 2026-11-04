<template>
  <div
    :id="`bubble-${kyFloatingBubbleId}`"
    ref="kyFloatingBubbleRef"
    :class="['ky-floating-bubble', { 'ky-safe-area-bottom': props.safeAreaInsetBottom }]"
    :style="rootStyle"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
    @click.capture="onClick"
  >
    <slot>
      <div class="ky-floating-bubble__base">
        <img v-if="icon" class="ky-floating-bubble__base-img" :src="props.icon" />
        <span class="ky-floating-bubble__base-text">{{ props.text }}</span>
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup name="ky-floating-bubble">
import Taro from '@tarojs/taro'
import { ref, onMounted, computed, nextTick } from 'vue'
import { closest, useSyncPropRef } from '@ky-miniui-lib/utils'
import { FloatingBubbleProps, FloatingBubbleEvents } from "./types";

const props = withDefaults(defineProps<FloatingBubbleProps>(), {
  axis: 'y',
  gap: 0,
  magnetic: null,
  offset: null,
  safeAreaInsetBottom: true,
  icon: '',
  text: '浮动气泡',
})

const emit = defineEmits<FloatingBubbleEvents>()

const kyFloatingBubbleId = ref<string>(String(Date.now()))
const kyFloatingBubbleRef = ref<HTMLElement | null>(null)
const bubbleState = ref({
  x: 5000,
  y: 5000,
  width: 0,
  height: 0,
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
})
// 是否在拖拽的标识
const dragging = ref(false)

// 获取整体定位位置
const boundary = computed<{
  top: number
  right: number
  bottom: number
  left: number
}>(() => ({
  top: props.gap,
  right: bubbleState.value.windowWidth - bubbleState.value.width - props.gap,
  bottom: bubbleState.value.windowHeight - bubbleState.value.height - props.gap,
  left: props.gap,
}))

const panelOffsetRef = useSyncPropRef(
  () => {
    if (props.offset) {
      return props.offset
    }
    return { x: bubbleState.value.x, y: bubbleState.value.y }
  },
  (value) => {
    if (props.offset) {
      emit('update:offset', value)
    }
    emit('offsetChange', value)
  },
)

const startOffsetRef = ref({ x: 0, y: 0 })
const offsetRef = ref({ x: 0, y: 0 })

const onTouchStart = (e: TouchEvent) => {
  console.log('onTouchStart', e)
  const touch = e.touches[0]
  dragging.value = true
  startOffsetRef.value = { x: touch.clientX, y: touch.clientY }
  offsetRef.value = panelOffsetRef.value
}

const onTouchEnd = () => {
  console.log('onTouchEnd')
  dragging.value = false
  nextTick(() => {
    if (props.magnetic === 'x') {
      const { x, y } = panelOffsetRef.value
      const nextX = closest([boundary.value.left, boundary.value.right], x)
      panelOffsetRef.value = { x: nextX, y }
    }
    if (props.magnetic === 'y') {
      const { x, y } = panelOffsetRef.value
      const nextY = closest([boundary.value.top, boundary.value.bottom], y)
      panelOffsetRef.value = { x, y: nextY }
    }
    emit('offsetChangeEnd', panelOffsetRef.value)
  })
}

const onTouchMove = async (e: TouchEvent) => {
  console.log('onTouchMove')
  if (dragging.value && kyFloatingBubbleRef.value) {
    const touch = e.touches[0]
    let deltaX = touch.clientX - startOffsetRef.value.x
    let deltaY = touch.clientY - startOffsetRef.value.y
    let newOffsetX = offsetRef.value.x + deltaX
    let newOffsetY = offsetRef.value.y + deltaY

    if (props.axis === 'x') {
      newOffsetY = offsetRef.value.y // 保持 y 轴偏移不变
    } else if (props.axis === 'y') {
      newOffsetX = offsetRef.value.x // 保持 x 轴偏移不变
    } else if (props.axis === 'lock') {
      return // 不更新偏移
    }

    // 对偏移量进行四舍五入
    newOffsetX = Math.round(newOffsetX)
    newOffsetY = Math.round(newOffsetY)

    // 判定边界问题
    if (newOffsetX < boundary.value.left) {
      newOffsetX = boundary.value.left
    } else if (newOffsetX > boundary.value.right) {
      newOffsetX = boundary.value.right
    }

    if (newOffsetY < boundary.value.top) {
      newOffsetY = boundary.value.top
    } else if (newOffsetY > boundary.value.bottom) {
      newOffsetY = boundary.value.bottom
    }

    panelOffsetRef.value = { x: newOffsetX, y: newOffsetY }
  }
}

const onClick = (e: TouchEvent) => {
  console.log('onClick')
  emit('click', e)
  e.stopPropagation()
}

const rootStyle = computed(() => ({
  transform: `translate3d(${panelOffsetRef.value.x}px, ${panelOffsetRef.value.y}px, 0px)`,
}))

onMounted(() => {
  const res = Taro.getSystemInfoSync()
  const windowWidth = res.windowWidth ?? window.innerHeight
  const windowHeight = res.windowHeight ?? window.innerWidth

  const query = Taro.createSelectorQuery()
  query
    .select(`#bubble-${kyFloatingBubbleId.value}.ky-floating-bubble`)
    .boundingClientRect()
    .exec(function (res) {
      if (Array.isArray(res)) {
        const [rect] = res
        if (rect) {
          bubbleState.value = {
            x: windowWidth - rect.width - props.gap,
            y: windowHeight - rect.height - props.gap,
            width: rect.width,
            height: rect.height,
            windowWidth,
            windowHeight,
          }
        }
      }
    })
})
</script>

<style lang="scss">
.ky-floating-bubble {
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s ease;
  touch-action: none;

  &:active {
    opacity: 0.8;
  }

  &__base {
    width: 128px;
    height: 128px;
    border-radius: 50%;
    // padding: 7px 16px;
    box-sizing: border-box;
    background: linear-gradient(135deg, #a48bf9 2%, #8365f6 100%);
    box-sizing: border-box;
    border: 4px solid #ffffff;
    box-shadow:
      0px 8px 16px 0px rgba(0, 0, 0, 0.05),
      0px 4px 32px 0px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &-img {
      width: 48px;
      height: 48px;
      margin-bottom: 4px;
    }

    &-text {
      font-size: 24px;
      font-weight: 600;
      line-height: 34px;
      color: #ffffff;
    }
  }
}

.ky-safe-area-bottom {
  // Add any necessary styles for safe area inset bottom
}
</style>
