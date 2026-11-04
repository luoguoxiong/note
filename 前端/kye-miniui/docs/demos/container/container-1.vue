<template>
  <ky-container
    :nav-bar-options="{ title: 'Container 容器示例' }"
    @click-left="handleClick"
    @click-right="handleClick"
    @click-title="handleClick"
    @container-init="handleInit"
  >
    <view class="container-demo demo-container">
      <view class="demo-header">
        <view class="header-title">Container 容器</view>
        <view class="header-subtitle">页面容器组件用法示例</view>
      </view>
    </view>
  </ky-container>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const eventLogs = ref<string[]>([])

const handleClick = () => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${time}] 触发点击事件`)
  if (eventLogs.value.length > 5) {
    eventLogs.value.pop()
  }
}

const handleInit = () => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${time}] 容器初始化完成`)
}
</script>

<style lang="scss">
.container-demo .demo-box {
  border: 1rpx solid #e8e8e8;
  border-radius: 12rpx;
  overflow: hidden;
}

.container-demo .content-inner {
  padding: 30rpx;
  background: #fafafa;
  font-size: 26rpx;
  color: #666;
  text-align: center;
}

.container-demo .custom-navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container-demo .custom-nav-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

.container-demo .slot-text {
  font-size: 32rpx;
}

.container-demo .scroll-content {
  padding: 20rpx;
}

.container-demo .scroll-item {
  padding: 24rpx;
  background: #f5f5f5;
  margin-bottom: 16rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;

  &:last-child {
    margin-bottom: 0;
  }
}

.container-demo .event-logs {
  max-height: 300rpx;
  overflow-y: auto;
}

.container-demo .event-log {
  padding: 12rpx;
  background: #f0f0f0;
  margin-bottom: 8rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  color: #666;
  word-break: break-all;
}

.container-demo .empty-log {
  text-align: center;
  color: #999;
  padding: 40rpx;
  font-size: 26rpx;
}
</style>
