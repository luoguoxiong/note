<template>
  <view class="overlay-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Overlay 遮罩层</view>
      <view class="header-subtitle">各种遮罩层用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="overlay-item">
            <view class="overlay-label">基本遮罩</view>
            <ky-button type="primary" size="mini" @click="basicVisible = true">显示遮罩</ky-button>
            <ky-overlay v-model:show="basicVisible"></ky-overlay>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎭</view>
          <view class="card-title">自定义内容</view>
        </view>
        <view class="card-body">
          <view class="overlay-item">
            <view class="overlay-label">加载动画</view>
            <ky-button type="primary" size="mini" @click="contentVisible = true">显示加载</ky-button>
            <ky-overlay v-model:show="contentVisible">
              <view class="overlay-content">
                <view class="loading-spinner"></view>
                <view class="loading-text">加载中...</view>
              </view>
            </ky-overlay>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏱️</view>
          <view class="card-title">动画时长</view>
        </view>
        <view class="card-body">
          <view class="overlay-item">
            <view class="overlay-label">500ms 动画</view>
            <ky-button type="primary" size="mini" @click="durationVisible = true">显示遮罩</ky-button>
            <ky-overlay v-model:show="durationVisible" :duration="500"></ky-overlay>
          </view>
          <view class="overlay-item">
            <view class="overlay-label">入场200ms 出场400ms</view>
            <ky-button type="primary" size="mini" @click="durationArrayVisible = true">显示遮罩</ky-button>
            <ky-overlay v-model:show="durationArrayVisible" :duration="[200, 400]"></ky-overlay>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✕</view>
          <view class="card-title">点击关闭</view>
        </view>
        <view class="card-body">
          <view class="overlay-item">
            <view class="overlay-label">点击遮罩关闭（默认）</view>
            <ky-button type="primary" size="mini" @click="closeClickVisible = true">显示遮罩</ky-button>
            <ky-overlay v-model:show="closeClickVisible"></ky-overlay>
          </view>
          <view class="overlay-item">
            <view class="overlay-label">禁止点击关闭</view>
            <ky-button type="primary" size="mini" @click="noCloseVisible = true">显示遮罩</ky-button>
            <ky-overlay v-model:show="noCloseVisible" :close-on-click-overlay="false">
              <view class="overlay-content">
                <view class="tip-text">点击按钮关闭</view>
                <ky-button type="danger" size="mini" @click="noCloseVisible = false">关闭</ky-button>
              </view>
            </ky-overlay>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">层级设置</view>
        </view>
        <view class="card-body">
          <view class="overlay-item">
            <view class="overlay-label">z-index: 1000</view>
            <ky-button type="primary" size="mini" @click="zindexVisible = true">显示遮罩</ky-button>
            <ky-overlay v-model:show="zindexVisible" :z-index="1000"></ky-overlay>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">自定义样式</view>
        </view>
        <view class="card-body">
          <view class="overlay-item">
            <view class="overlay-label">深色遮罩</view>
            <ky-button type="primary" size="mini" @click="customVisible = true">显示遮罩</ky-button>
            <ky-overlay v-model:show="customVisible" overlay-class="dark-overlay"></ky-overlay>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📡</view>
          <view class="card-title">事件监听</view>
        </view>
        <view class="card-body">
          <view class="overlay-item">
            <view class="overlay-label">监听点击事件</view>
            <ky-button type="primary" size="mini" @click="eventVisible = true">显示遮罩</ky-button>
            <ky-overlay v-model:show="eventVisible" @click-overlay="handleClickOverlay"></ky-overlay>
            <view class="event-log" v-if="clickLog"> 📝 遮罩被点击 </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const basicVisible = ref(false)
const contentVisible = ref(false)
const durationVisible = ref(false)
const durationArrayVisible = ref(false)
const closeClickVisible = ref(false)
const noCloseVisible = ref(false)
const zindexVisible = ref(false)
const customVisible = ref(false)
const eventVisible = ref(false)
const clickLog = ref(false)

const handleClickOverlay = () => {
  clickLog.value = true
  setTimeout(() => {
    clickLog.value = false
  }, 2000)
}
</script>

<style lang="scss">
.overlay-demo .overlay-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.overlay-demo .overlay-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.overlay-demo .overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.overlay-demo .loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.overlay-demo .loading-text {
  font-size: 28rpx;
  color: #fff;
}

.overlay-demo .tip-text {
  font-size: 28rpx;
  color: #fff;
  margin-bottom: 20rpx;
}

.overlay-demo .dark-overlay {
  background-color: rgba(0, 0, 0, 0.9) !important;
}

.overlay-demo .event-log {
  font-size: 24rpx;
  color: #67c23a;
  margin-top: 12rpx;
  padding: 12rpx;
  background: #f0f9eb;
  border-radius: 8rpx;
}
</style>
