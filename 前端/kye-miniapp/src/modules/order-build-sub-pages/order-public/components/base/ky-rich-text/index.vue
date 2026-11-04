<template>
  <view class="rich-text-container">
    <rich-text :nodes="nodes" />
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  // 支持传入 html 字符串 或 nodes 数组
  nodes: {
    type: [String, Array],
    required: true
  }
})
</script>

<style lang="scss">
.rich-text-container {
  font-size: 16px;
  line-height: 1.6;
}
</style>