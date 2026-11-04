<template>
  <view class="audit-waiting">
    <view class="loading-dots">
      <view class="dot dot-1"></view>
      <view class="dot dot-2"></view>
      <view class="dot dot-3"></view>
    </view>
    <view class="waiting-text">
      运单审核中，请稍等
      <text class="time">({{ remainingTime }}s)</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const MAX_COUNT = 10
const remainingTime = ref(MAX_COUNT)

const timer = setInterval(() => {
  if (remainingTime.value > 0) {
    remainingTime.value--
  }
}, 1000)

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss">
.audit-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0;

  .loading-dots {
    display: flex;
    gap: 16rpx;
    margin-bottom: 24rpx;

    .dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background-color: #c2b1fd;
      animation: bounce 1.4s infinite ease-in-out both;

      &-1 {
        animation-delay: -0.32s;
      }

      &-2 {
        animation-delay: -0.16s;
      }

      &-3 {
        animation-delay: 0s;
      }
    }
  }

  .waiting-text {
    font-size: 28rpx;
    color: #666;
    text-align: center;

    .time {
      color: #f57200;
      font-weight: 500;
    }
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
