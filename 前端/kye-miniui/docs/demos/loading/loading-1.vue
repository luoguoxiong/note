<template>
  <view class="loading-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Loading 加载</view>
      <view class="header-subtitle">用于页面和区块的加载状态</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏳</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="loading-item">
            <ky-loading></ky-loading>
            <text class="loading-label">默认加载</text>
          </view>
          <view class="loading-item">
            <ky-loading>加载中...</ky-loading>
            <text class="loading-label">带文案</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">加载尺寸</view>
        </view>
        <view class="card-body">
          <view class="size-row">
            <ky-loading size="large">large</ky-loading>
          </view>
          <view class="size-row">
            <ky-loading size="normal">normal</ky-loading>
          </view>
          <view class="size-row">
            <ky-loading size="small">small</ky-loading>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">加载类型</view>
        </view>
        <view class="card-body">
          <view class="type-row">
            <ky-loading type="default">default</ky-loading>
          </view>
          <view class="type-row">
            <ky-loading type="circle">circle</ky-loading>
          </view>
          <view class="type-row">
            <ky-loading type="dots">dots</ky-loading>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">文本颜色</view>
        </view>
        <view class="card-body">
          <view class="color-row">
            <ky-loading text-color="#8365F6">主题色文案</ky-loading>
          </view>
          <view class="color-row">
            <ky-loading text-color="#FF706D">红色文案</ky-loading>
          </view>
          <view class="color-row">
            <ky-loading text-color="#00C58C">绿色文案</ky-loading>
          </view>
          <view class="color-row">
            <ky-loading text-color="#57A8F9">蓝色文案</ky-loading>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📏</view>
          <view class="card-title">文本尺寸</view>
        </view>
        <view class="card-body">
          <view class="text-size-row">
            <ky-loading text-size="1" size="large">textSize: 1</ky-loading>
          </view>
          <view class="text-size-row">
            <ky-loading text-size="2" size="medium">textSize: 2</ky-loading>
          </view>
          <view class="text-size-row">
            <ky-loading text-size="3" size="normal">textSize: 3</ky-loading>
          </view>
          <view class="text-size-row">
            <ky-loading text-size="4" size="small">textSize: 4</ky-loading>
          </view>
          <view class="text-size-row">
            <ky-loading text-size="5" size="mini">textSize: 5</ky-loading>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">垂直排列</view>
        </view>
        <view class="card-body">
          <view class="vertical-row">
            <ky-loading vertical>垂直排列加载中...</ky-loading>
          </view>
          <view class="vertical-row">
            <ky-loading vertical type="circle" size="large">circle 垂直</ky-loading>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">自定义图标</view>
        </view>
        <view class="card-body">
          <view class="custom-row">
            <ky-loading>
              <template #icon>
                <view class="custom-icon">🔄</view>
              </template>
              自定义图标加载中...
            </ky-loading>
          </view>
          <view class="custom-row">
            <ky-loading vertical>
              <template #icon>
                <view class="custom-icon-large">🚀</view>
              </template>
              火箭加载中...
            </ky-loading>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import '../index.scss'
</script>

<style lang="scss">
.loading-demo .loading-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.loading-demo .loading-label {
  font-size: 24rpx;
  color: #999;
  margin-left: 16rpx;
}

.loading-demo .size-row,
.loading-demo .type-row,
.loading-demo .color-row,
.loading-demo .text-size-row,
.loading-demo .vertical-row,
.loading-demo .custom-row {
  display: flex;
  justify-content: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.loading-demo .custom-icon {
  font-size: 32rpx;
  animation: spin 1s linear infinite;
}

.loading-demo .custom-icon-large {
  font-size: 48rpx;
  animation: spin 1s linear infinite;
}
</style>
