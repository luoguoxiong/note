<template>
  <view class="id-card__progress-bar" v-if="loading">
    <view class="progress-inner" :style="{ width: progress + '%' }"></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onUnmounted } from 'vue'

const loading = ref(false)
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function start() {
  if (loading.value) return // 避免重复启动
  loading.value = true
  progress.value = 0

  timer && clearInterval(timer)
  timer = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10
    } else {
      clearInterval(timer!)
      timer = null
    }
  }, 200)
}

const finish = () => {
  if (!loading.value) return

  timer && clearInterval(timer)
  timer = null

  progress.value = 100
  setTimeout(() => {
    loading.value = false
    progress.value = 0
  }, 300)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

defineExpose({ start, finish })
</script>

<style>
.id-card__progress-bar {
  height: 2px;
  width: 100%;
  background: transparent;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

.progress-inner {
  height: 100%;
  background-color: #007aff;
  transition: width 0.3s ease;
  transform: translateZ(0); /* 强制 GPU 加速，避免亚像素模糊 */
}
</style>
