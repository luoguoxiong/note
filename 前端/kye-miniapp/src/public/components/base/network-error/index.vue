<template>
  <view class="netwrok-error">
    <view class="network-content">
      <image :src="base64"></image>
      <view class="network-text">网络异常，请重试</view>
      <ky-button type="primary" size="small" @click="handleClick">重新加载</ky-button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import './index.scss'

const emit = defineEmits(['refresh'])
const handleClick = () => {
  emit('refresh')
}

const base64 = ref('')

import('./base64').then((res) => {
  base64.value = res.base64
})
</script>
