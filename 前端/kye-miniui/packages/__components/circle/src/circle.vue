<template>
  <!-- canvas2D -->
  <view class="ky-circle" v-if="isWeapp">
    <canvas class="ky-circle-canvas" :id="canvasId" type="2d" :style="{ width: `${size}px`, height: `${size}px` }" />
    <view class="ky-circle-text" v-if="showText">
      <slot :currentProgress="Math.round(currentProgress)">
        {{ `${Math.round(currentProgress)}%` }}
      </slot>
    </view>
  </view>

  <view class="ky-circle" v-else>
    <canvas
      class="ky-circle-canvas"
      :id="canvasId"
      :canvasId="canvasId"
      :width="size * pixelRatio"
      :height="size * pixelRatio"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <view class="ky-circle-text" v-if="showText">
      <slot :currentProgress="Math.round(currentProgress)">
        {{ `${Math.round(currentProgress)}%` }}
      </slot>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { getCanvasNodeById, getWindowInfo } from '@ky-miniui-lib/utils'
import { TaroCircleCanvas } from './canvas-wx'
import { TaroCircleCanvas as TaroCircleCanvas1 } from './canvas'
import { CircleProps } from './types'
import Taro from '@tarojs/taro'
import './index.scss'

const isWeapp = Taro.getEnv() === 'WEAPP'

const isWeb = Taro.getEnv() === 'WEB'

const { pixelRatio } = getWindowInfo()

const canvasId = `circle-canvas-${Math.random().toString(36).substr(2, 8)}`

// 动画实现
let animationFrameId: number | null = null // 用于存储请求的动画帧ID

let taroCircleCanvas: TaroCircleCanvas | null = null

const props = withDefaults(defineProps<CircleProps>(), {
  size: 100,
  strokeWidth: 8,
  color: '#1989fa',
  trackColor: '#e5e5e5',
  progress: 0,
  duration: 200,
  showText: true,
})

const currentProgress = ref(0) // 当前进度

const initCanvas = async () => {
  if (isWeapp || isWeb) {
    const canvas = await getCanvasNodeById(canvasId)
    if (canvas) {
      taroCircleCanvas = new TaroCircleCanvas(canvas, {
        size: props.size,
        color: props.color,
        strokeWidth: props.strokeWidth,
        trackColor: props.trackColor,
      })
    }
  } else {
    taroCircleCanvas = new TaroCircleCanvas1(canvasId, {
      size: props.size,
      color: props.color,
      strokeWidth: props.strokeWidth,
      trackColor: props.trackColor,
    })
  }
}

// 绘制圆形
const drawCircle = async (currentValue: number) => {
  if (!taroCircleCanvas) return
  taroCircleCanvas.draw(currentValue)
}

const animateProgress = () => {
  const { progress, duration } = props

  if (duration === 0) {
    currentProgress.value = progress
    drawCircle(progress)
    return
  }

  const clampedProgress = Math.max(0, Math.min(100, progress))

  const totalSteps = Math.ceil(duration / 16) // 每帧约16.67ms（60fps）

  const step = (clampedProgress - currentProgress.value) / totalSteps

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  const animate = () => {
    if (Math.abs(currentProgress.value - clampedProgress) > Math.abs(step)) {
      currentProgress.value += step
      drawCircle(currentProgress.value)
      animationFrameId = requestAnimationFrame(animate)
    } else {
      currentProgress.value = clampedProgress
      drawCircle(clampedProgress)
    }
  }

  animate()
}

onMounted(async () => {
  // H5直接onMounted获取不到节点
  Taro.nextTick(async () => {
    await initCanvas()
    currentProgress.value = 0
    if (props.progress > 100 || props.progress < 0) return
    drawCircle(0)
    animateProgress()
  })
})

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

watch(
  () => props.progress,
  (newProgress) => {
    if (newProgress > 100 || newProgress < 0) {
      return
    }
    if (currentProgress.value !== newProgress) {
      animateProgress()
    }
  },
)
</script>
