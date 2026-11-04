<template>
  <view class="circle-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Circle 圆环进度条</view>
      <view class="header-subtitle">用于展示圆形进度</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📊</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="circle-demo-component">
            <ky-circle :size="120" :progress="progress" :duration="2000" />
          </view>
          <view class="progress-controls">
            <ky-button size="mini" type="primary" @click="increaseProgress">+10%</ky-button>
            <view class="progress-value">当前进度：{{ progress }}%</view>
            <ky-button size="mini" type="default" @click="decreaseProgress">-10%</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">不同尺寸</view>
        </view>
        <view class="card-body">
          <view class="size-row">
            <ky-circle :size="60" :progress="50" />
            <text class="size-label">size: 60</text>
          </view>
          <view class="size-row">
            <ky-circle :size="100" :progress="50" />
            <text class="size-label">size: 100</text>
          </view>
          <view class="size-row">
            <ky-circle :size="140" :progress="50" />
            <text class="size-label">size: 140</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">自定义颜色</view>
        </view>
        <view class="card-body">
          <view class="color-row">
            <ky-circle :size="100" color="#8365F6" :progress="70" />
            <text class="color-label">主色</text>
          </view>
          <view class="color-row">
            <ky-circle :size="100" color="#FF706D" :progress="70" />
            <text class="color-label">红色</text>
          </view>
          <view class="color-row">
            <ky-circle :size="100" color="#00C58C" :progress="70" />
            <text class="color-label">绿色</text>
          </view>
          <view class="color-row">
            <ky-circle :size="100" color="#57A8F9" :progress="70" />
            <text class="color-label">蓝色</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔘</view>
          <view class="card-title">轨道颜色</view>
        </view>
        <view class="card-body">
          <view class="track-row">
            <ky-circle :size="100" :progress="60" track-color="#eee" />
            <text class="track-label">浅灰轨道</text>
          </view>
          <view class="track-row">
            <ky-circle :size="100" :progress="60" track-color="#ddd" />
            <text class="track-label">深灰轨道</text>
          </view>
          <view class="track-row">
            <ky-circle :size="100" :progress="60" color="#8365F6" track-color="#F0EEFC" />
            <text class="track-label">主题色轨道</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📏</view>
          <view class="card-title">圆环宽度</view>
        </view>
        <view class="card-body">
          <view class="width-row">
            <ky-circle :size="100" :stroke-width="4" :progress="70" />
            <text class="width-label">strokeWidth: 4</text>
          </view>
          <view class="width-row">
            <ky-circle :size="100" :stroke-width="8" :progress="70" />
            <text class="width-label">strokeWidth: 8</text>
          </view>
          <view class="width-row">
            <ky-circle :size="100" :stroke-width="12" :progress="70" />
            <text class="width-label">strokeWidth: 12</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏱️</view>
          <view class="card-title">动画时长</view>
        </view>
        <view class="card-body">
          <view class="duration-row">
            <ky-circle :size="100" :progress="80" :duration="500" />
            <text class="duration-label">duration: 500ms</text>
          </view>
          <view class="duration-row">
            <ky-circle :size="100" :progress="80" :duration="2000" />
            <text class="duration-label">duration: 2000ms</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✕</view>
          <view class="card-title">隐藏文本</view>
        </view>
        <view class="card-body">
          <view class="no-text-demo">
            <ky-circle :size="100" :progress="66" :show-text="false" />
          </view>
          <text class="no-text-label">不显示百分比文本</text>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">自定义内容</view>
        </view>
        <view class="card-body">
          <view class="slot-demo">
            <ky-circle :size="120" :progress="customProgress" color="#00C58C">
              <template #default="{ currentProgress }">
                <view class="custom-content">
                  <text class="custom-number">{{ currentProgress }}</text>
                  <text class="custom-unit">分</text>
                </view>
              </template>
            </ky-circle>
          </view>
          <view class="slot-controls">
            <ky-button size="mini" type="primary" @click="increaseCustom">+5</ky-button>
            <ky-button size="mini" type="default" @click="decreaseCustom">-5</ky-button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const progress = ref(30)
const customProgress = ref(75)

const increaseProgress = () => {
  if (progress.value < 100) {
    progress.value += 10
  }
}

const decreaseProgress = () => {
  if (progress.value > 0) {
    progress.value -= 10
  }
}

const increaseCustom = () => {
  if (customProgress.value < 100) {
    customProgress.value += 5
  }
}

const decreaseCustom = () => {
  if (customProgress.value > 0) {
    customProgress.value -= 5
  }
}
</script>

<style lang="scss">
.circle-demo-component {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.circle-demo .progress-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
}

.circle-demo .progress-value {
  font-size: 26rpx;
  color: #666;
  min-width: 200rpx;
  text-align: center;
}

.circle-demo .size-row,
.circle-demo .color-row,
.circle-demo .track-row,
.circle-demo .width-row,
.circle-demo .duration-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.circle-demo .size-label,
.circle-demo .color-label,
.circle-demo .track-label,
.circle-demo .width-label,
.circle-demo .duration-label {
  font-size: 24rpx;
  color: #999;
  margin-left: 20rpx;
}

.circle-demo .no-text-demo {
  display: flex;
  justify-content: center;
  margin-bottom: 16rpx;
}

.circle-demo .no-text-label {
  display: block;
  text-align: center;
  font-size: 26rpx;
  color: #666;
}

.circle-demo .slot-demo {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.circle-demo .custom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circle-demo .custom-number {
  font-size: 36rpx;
  font-weight: 700;
  color: #00c58c;
}

.circle-demo .custom-unit {
  font-size: 20rpx;
  color: #999;
}

.circle-demo .slot-controls {
  display: flex;
  justify-content: center;
  gap: 20rpx;
}
</style>
