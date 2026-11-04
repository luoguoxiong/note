<template>
  <movable-area
    class="ky-floating-panel-wx"
    :style="{
      height: `${height}px`,
      maxHeight: maxMoveAbleHeight,
      minHeight: minMoveAbleHeight,
      transition: isReleaseAnimation ? 'height 0.3s' : 'none',
    }"
    :catch-move="catchMove"
  >
    <movable-view
      direction="vertical"
      :y="panelY"
      damping="60"
      outOfBounds
      friction="2"
      inertia
      class="ky-floating-panel-wx__box"
    >
      <CoverViewAlipay class="ky-floating-panel-wx__touch" :catch-move="!isWxAppClient">
        <view class="ky-floating-panel-wx__touch" @touchstart="onStart" @touchmove="onMove" @touchend="onRelease">
          <CoverViewAlipay class="ky-floating-panel-wx__header">
            <slot name="bar">
              <view class="ky-floating-panel-wx__header-bar"></view>
            </slot>
            <slot name="header" />
          </CoverViewAlipay>
          <CoverViewAlipay class="ky-floating-panel-wx__content" :style="{ backgroundColor: backgroundColor }">
            <slot />
          </CoverViewAlipay>
          <div class="ky-floating-panel-wx__after" :style="{ backgroundColor: backgroundColor }"></div>
        </view>
      </CoverViewAlipay>
    </movable-view>
  </movable-area>
</template>

<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { ref, computed, onMounted } from 'vue'
import { closest } from '@ky-miniui-lib/utils'
import CoverViewAlipay from './components/cover-view-alipay.vue'
import useEnvConfig from '@packages/utils/hooks/useEnvConfig'

const props = defineProps<{
  height: number
  anchors: number[]
  backgroundColor?: string
  catchMove: boolean
}>()

const emit = defineEmits(['update:height', 'heightChange', 'heightChangeEnd'])

const screenHeight = ref(window.innerHeight ?? Taro.getSystemInfoSync().windowHeight)
const isWxAppClient = ref(false) // 是否是多端原生APP

// 计算有效的锚点
const anchors = computed(() =>
  props.anchors.length >= 2 ? props.anchors : [100, Math.round(screenHeight.value * 0.6)],
)

const maxMoveAbleHeight = computed(() => {
  const maxAnchorsHeight = anchors.value[anchors.value.length - 1]
  return maxAnchorsHeight ? `${maxAnchorsHeight}px` : 'initial'
})

const minMoveAbleHeight = computed(() => {
  const minAnchorsHeight = anchors.value[0]
  return minAnchorsHeight ? `${minAnchorsHeight}px` : 'initial'
})

console.log('anchors>>>', anchors.value)

// 当前 panel 的位置，y = 窗口高度 - 高度
const panelY = computed(() => screenHeight.value - props.height)

// 阻尼缓动逻辑
const ease = (moveY: number): number => {
  const absDistance = Math.abs(moveY)
  const min = anchors.value[0]
  const max = anchors.value[anchors.value.length - 1]

  if (absDistance > max) {
    return max + (absDistance - max) * 0.2
  }

  if (absDistance < min) {
    return min - (min - absDistance) * 0.2
  }

  return moveY
}

const lastHeight = ref<number>()
const startY = ref<number>()
const isReleaseAnimation = ref<boolean>(false)
// 开始拖动
const onStart = (e: any) => {
  lastHeight.value = props.height
  // startY.value = screenHeight.value - e.touches[0].clientY - props.height
  startY.value = e.touches[0].clientY + props.height
}

// 拖动中
const onMove = (e: any) => {
  const y = e.touches[0].clientY
  if (!y) return
  const rawHeight = -y + startY.value
  // const h = ease(rawHeight)
  const h = rawHeight

  emit('update:height', h)
  emit('heightChange', h)
}

// 拖动释放后，吸附到最近的 anchor
const onRelease = () => {
  // const closestAnchor = closest(anchors.value, props.height)
  const current = props.height
  const last = lastHeight.value

  let closestAnchor = last

  const index = anchors.value.indexOf(last)

  if (index === -1) {
    closestAnchor = last
  } else if (current > last) {
    closestAnchor = anchors.value[index + 1] ?? anchors.value[index]
  } else if (current < last) {
    closestAnchor = anchors.value[index - 1] ?? anchors.value[index]
  } else {
    closestAnchor = last
  }

  isReleaseAnimation.value = true
  emit('update:height', closestAnchor)
  emit('heightChangeEnd', closestAnchor)
  setTimeout(() => {
    isReleaseAnimation.value = false
  }, 300)
}
/* 获取端配置 */
const getEnvConfig = () => {
  const { isWxApp } = useEnvConfig()
  isWxAppClient.value = !!isWxApp
}

onMounted(() => {
  getEnvConfig()
})
</script>

<style lang="scss">
.ky-floating-panel-wx {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  // pointer-events: none;
  background-color: transparent;
  z-index: 99;

  &__box {
    width: 100%;
    height: 100%;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    // overflow: hidden;
    display: flex;
    flex-direction: column;
    padding-top: 10px;
    box-sizing: border-box;
  }

  &__touch {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    background-color: transparent;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 8px;
    user-select: none;
    background-color: transparent;
  }

  &__header-bar {
    width: 80px;
    height: 8px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    margin-bottom: 12px;
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
