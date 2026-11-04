<template>
  <!-- 用show来控制显示隐藏 解决有滚动条时重置的问题呢 -->
  <!-- :class="{'flod-toast-wrapper'}" -->
  <view v-show="id ? id === toast.toastId && toast.visible : toast.visible" class="toast-wrapper">
    <!-- 遮罩 -->
    <view v-if="toast.mask" class="toast-mask"></view>

    <!-- Toast内容 -->
    <view class="toast-box" :style="toast.style">
      <!-- icon -->
      <view v-if="toast.icon !== 'none'" class="toast-icon">
        <!-- <image v-if="toast.icon === 'success'" class="icon" src="" mode="aspectFit" />
        <image v-else-if="toast.icon === 'error'" class="icon" src="" mode="aspectFit" /> -->
        <view v-if="toast.icon === 'loading'" class="loading">加载中...</view>
      </view>

      <!-- 文字 -->
      <view class="toast-text">{{ toast.title }}</view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  id: String,
})

import { useToastStore } from '@public/components/base/toast/store'

const toast = useToastStore()
</script>

<style lang="scss">
.toast-wrapper {
  position: fixed;
  // inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  top: 50%;
  transform: translateY(-50%);
  left: 50%;
  transform: translateX(-50%);
  .toast-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0);
  }
  .toast-box {
    max-width: 60%;
    min-width: 200rpx;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    border-radius: 16rpx;
    padding: 20rpx 30rpx;
    text-align: center;
  }
  .toast-icon {
    margin-bottom: 12rpx;
  }
  .icon {
    width: 48rpx;
    height: 48rpx;
  }
  .toast-text {
    font-size: 28rpx;
    word-break: break-all;
  }
}
/* #ifdef h5 */
.toast-wrapper {
  width: 750px !important;
}
/* #endif */
</style>
