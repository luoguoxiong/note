<script setup lang="ts">
import Kyloading from '@packages/__components/loading'
const props = defineProps<{
  height: string
}>()
</script>

<template>
  <view class="ky-picker-loading">
    <ky-loading size="large"></ky-loading>
  </view>
  <view class="ky-picker-loading__content" :style="`height: ${height}`"></view>
</template>

<style lang="scss">
.ky-picker-loading {
  justify-content: center;
  align-items: center;
  display: flex;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
