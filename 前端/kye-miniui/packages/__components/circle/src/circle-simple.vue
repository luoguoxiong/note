<template>
  <view class="ky-circle" :style="circleStyle">
    <!-- 背景轨道 -->
    <view
      class="ky-circle-track"
      :style="{
        borderWidth: `${strokeWidth}px`,
        borderColor: trackColor,
      }"
    />
    <!-- 进度圆环 -->
    <view
      class="ky-circle-progress"
      :style="{
        background: `conic-gradient(${color} ${currentProgress}%, ${trackColor} ${currentProgress}%)`,
      }"
    >
      <view
        class="ky-circle-progress-inner"
        :style="{
          width: `${props.size - 8 / pixelRatio}px`,
          height: `${props.size - 8 / pixelRatio}px`,
          background: '#f1f2f7',
        }"
      ></view>
    </view>
    <!-- 中心文本 -->
    <view class="ky-circle-text" v-if="showText">
      <slot :currentProgress="Math.round(currentProgress)">
        {{ `${Math.round(currentProgress)}%` }}
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { getWindowInfo } from '@packages/utils'

const { pixelRatio } = getWindowInfo()

interface CircleProps {
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  progress?: number
  duration?: number
  showText?: boolean
  background?: string
}

const props = withDefaults(defineProps<CircleProps>(), {
  size: 100,
  strokeWidth: 8,
  color: '#1989fa',
  trackColor: '#e5e5e5',
  progress: 0,
  duration: 200,
  showText: true,
})

const currentProgress = ref(0)

const circleStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

// 动画过渡
let timer: number | null = null
const animateProgress = () => {
  if (timer) clearInterval(timer)
  const { progress, duration } = props
  if (duration === 0) {
    currentProgress.value = progress
    return
  }
  const start = currentProgress.value
  const diff = progress - start
  const steps = Math.ceil(duration / 16)
  let i = 0
  timer = setInterval(() => {
    i++
    currentProgress.value = start + (diff * i) / steps
    if (i >= steps) {
      currentProgress.value = progress
      if (timer) clearInterval(timer)
    }
  }, 16)
}

onMounted(() => {
  animateProgress()
})

watch(
  () => props.progress,
  () => {
    animateProgress()
  },
)
</script>

<style lang="scss">
.ky-circle {
  position: relative;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .ky-circle-track,
  .ky-circle-progress {
    position: absolute;
    border-radius: 50%;
    inset: 0;
    height: 100%;
  }

  .ky-circle-track {
    border-style: solid;
  }

  .ky-circle-progress {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .ky-circle-progress-inner {
      border-radius: 50%;
    }
  }

  .ky-circle-text {
    position: relative;
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
}
</style>
