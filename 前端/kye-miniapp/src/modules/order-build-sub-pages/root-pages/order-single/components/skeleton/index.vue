<template>
  <view :disable-scroll="true" class="order-loading-masker" :catch-move="true">
    <img
      v-show="showImage"
      class="order-loading-masker-icon"
      src="https://ic-img.ky-express.com/order/order-loading.gif"
      alt=""
    />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  showImage?: boolean
}>()

const showIcon = ref(false)
onMounted(() => {
  setTimeout(() => {
    showIcon.value = true
  }, 300)
})
</script>

<style lang="scss">
@import './index.scss';
</style>
