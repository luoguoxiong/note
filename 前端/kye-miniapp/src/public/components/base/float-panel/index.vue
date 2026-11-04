<template>
  <movable-area
    class="float-ball__area"
    :class="{ 'is-pc': isPc && usePCAreaLimit }"
    :style="{ top: topLimit + 'px' }"
    catch-move
  >
    <movable-view class="float-ball__view" :x="translateX" :y="top" :animation="false" :damping="0" direction="all">
      <view
        id="float-content"
        :style="{ opacity: isInit ? 1 : 0 }"
        :class="['float-ball__content', { hide: props.isHide }]"
        :catchMove="true"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
      >
        <slot />
      </view>
    </movable-view>
  </movable-area>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import Taro from '@tarojs/taro'
import { getSystemInfo } from '@/public/utils/getSystemInfo'
import { isPc } from '@public/utils'
import './index.scss'
defineOptions({ name: 'float-panel' })

const props = withDefaults(
  defineProps<{
    isHide: boolean
    topLimit?: number
    initTop?: number
    adsorbDirection?: 'left' | 'right' | 'auto'
    usePCAreaLimit?: boolean
  }>(),
  {
    isHide: false,
    usePCAreaLimit: false,
    topLimit: 100,
    initTop: 0,
    adsorbDirection: 'right',
  },
)

const emit = defineEmits(['handleTouchStart'])

const isInit = ref(false)
const translateX = ref(0)
const top = ref(500)

const systemInfo = ref({
  windowHeight: 0,
  windowWidth: 0,
})

/* -------------------- DOM 测量 -------------------- */

const getRect = (selector: string): Promise<any> => {
  return new Promise((resolve) => {
    Taro.createSelectorQuery()
      .select(selector)
      .boundingClientRect()
      .exec((res) => resolve(res?.[0] || null))
  })
}

const measureContentHeight = async (maxTry = 10) => {
  for (let i = 0; i < maxTry; i++) {
    const rect = await getRect('#float-content')
    if (rect?.height) return rect.height
    await new Promise((r) => setTimeout(r, 50))
  }
  return null
}

const updateFloatPannel = async () => {
  const info = await getSystemInfo()
  systemInfo.value = {
    windowHeight: info.windowHeight,
    windowWidth: info.windowWidth,
  }

  translateX.value = props.adsorbDirection === 'left' ? 0 : info.windowWidth - (124 / 750) * info.windowWidth

  await nextTick()

  const height = await measureContentHeight()

  if (!height) {
    console.warn('无法获取 #float-content 高度')
    isInit.value = true
    return
  }

  top.value = info.windowHeight - height - 80 - props.topLimit - props.initTop

  isInit.value = true
}

onMounted(() => {
  setTimeout(updateFloatPannel, 1000)
})

/* -------------------- 拖拽核心 -------------------- */

const rightX = computed(() => systemInfo.value.windowWidth - (124 / 750) * systemInfo.value.windowWidth)

const startX = ref(0)
const startY = ref(0)
const startTop = ref(0)
const startTranslateX = ref(0)
const isDragging = ref(false)

const onDragStart = (x: number, y: number) => {
  isDragging.value = true
  startX.value = x
  startY.value = y
  startTranslateX.value = translateX.value
  startTop.value = top.value
  emit('handleTouchStart')
}

const onDragMove = (x: number, y: number) => {
  if (!isDragging.value) return
  translateX.value = startTranslateX.value + (x - startX.value)
  top.value = startTop.value + (y - startY.value)
}

const onDragEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false

  const duration = 300
  const startTime = Date.now()
  const start_X = translateX.value

  let targetX = rightX.value
  if (props.adsorbDirection === 'left') {
    targetX = 0
  } else if (props.adsorbDirection === 'auto') {
    targetX = start_X + 50 < systemInfo.value.windowWidth / 2 ? 0 : rightX.value
  }

  const distance = targetX - start_X

  const animate = () => {
    const progress = Math.min((Date.now() - startTime) / duration, 1)
    const easing = progress * (2 - progress)
    translateX.value = start_X + distance * easing
    if (progress < 1) setTimeout(animate, 20)
  }

  setTimeout(animate, 20)
}

/* -------------------- Touch 事件 -------------------- */

const handleTouchStart = (e) => {
  const t = e.touches[0]
  onDragStart(t.clientX, t.clientY)
}

const handleTouchMove = (e) => {
  const t = e.touches[0]
  onDragMove(t.clientX, t.clientY)
}

const handleTouchEnd = () => {
  onDragEnd()
}

/* -------------------- Mouse 事件（PC） -------------------- */

const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  onDragStart(e.clientX, e.clientY)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  onDragMove(e.clientX, e.clientY)
}

const handleMouseUp = () => {
  onDragEnd()
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})

/* -------------------- 对外暴露 -------------------- */

defineExpose({
  isInit,
  updateFloatPannel,
})
</script>
