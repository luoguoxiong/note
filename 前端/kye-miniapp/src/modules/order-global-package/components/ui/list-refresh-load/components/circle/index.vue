<template>
  <div class="circle">
    <van-circle
      v-bind="$attrs"
      v-model:current-rate="currentRate"
      size="24px"
      color="#7653D9"
      layer-color="transparent"
      :speed="80"
      :stroke-width="80"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import './index.scss'

const currentRate = ref(0)

/**
 * 重置加载图标计算值
 */
const currentRateReset = () => {
  document.addEventListener('touchend', () => (currentRate.value = 0))
}

onMounted(() => {
  currentRateReset()
})
</script>
