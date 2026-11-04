<template>
  <view class="floating-panel-demo demo-container">
    <view class="demo-header">
      <view class="header-title">FloatingPanel 浮动面板</view>
      <view class="header-subtitle">浮动面板用法示例</view>
    </view>

    <view class="tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: activeTab === index }]"
        @click="activeTab = index"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view class="tab-content">
      <view v-show="activeTab === 0" class="tab-panel">
        <view class="panel-demo">
          <view class="panel-bg">
            <view class="bg-hint">背景区域</view>
          </view>
          <ky-floating-panel
            v-model:height="height1"
            :anchors="[100, 300, 500]"
            @heightChange="heightChange"
            @heightChangeEnd="heightChangeEnd"
          >
            <template #header>
              <view class="panel-header-text">基本用法</view>
            </template>
            <view class="panel-content">
              <view class="height-info">
                <text>当前高度：{{ height1 }} px</text>
              </view>
              <view class="drag-hint">
                <text>👆 上下拖拽面板</text>
              </view>
            </view>
          </ky-floating-panel>
        </view>
      </view>

      <view v-show="activeTab === 1" class="tab-panel">
        <view class="panel-demo">
          <view class="panel-bg">
            <view class="bg-hint">背景区域</view>
          </view>
          <ky-floating-panel v-model:height="height2" :anchors="[120, 240, 480]" background-color="#fff">
            <template #header>
              <view class="panel-header-text">三个吸附点</view>
            </template>
            <view class="panel-content">
              <view class="height-info">
                <text>当前高度：{{ height2 }} px</text>
              </view>
              <view class="anchor-info">
                <text>吸附点：120 → 240 → 480</text>
              </view>
            </view>
          </ky-floating-panel>
        </view>
      </view>

      <view v-show="activeTab === 2" class="tab-panel">
        <view class="panel-demo">
          <view class="panel-bg">
            <view class="bg-hint">背景区域</view>
          </view>
          <ky-floating-panel
            v-model:height="height3"
            :anchors="[200, 600]"
            :contentDraggable="false"
            background-color="#fff"
          >
            <template #header>
              <view class="panel-header-text">可滚动列表</view>
            </template>
            <scroll-view scroll-y class="scroll-content">
              <view v-for="i in 30" :key="i" class="list-item">
                <text>列表项 {{ i }}</text>
              </view>
            </scroll-view>
          </ky-floating-panel>
        </view>
      </view>

      <view v-show="activeTab === 3" class="tab-panel">
        <view class="panel-demo">
          <view class="panel-bg">
            <view class="bg-hint">背景区域</view>
          </view>
          <ky-floating-panel v-model:height="height4" :anchors="[150, 450]" background-color="#fff">
            <template #bar>
              <view class="custom-bar">
                <view class="bar-dot"></view>
                <view class="bar-dot"></view>
                <view class="bar-dot"></view>
              </view>
            </template>
            <template #header>
              <view class="panel-header-text">自定义拖拽条样式</view>
            </template>
            <view class="panel-content">
              <view class="height-info">
                <text>当前高度：{{ height4 }} px</text>
              </view>
            </view>
          </ky-floating-panel>
        </view>
      </view>

      <view v-show="activeTab === 4" class="tab-panel">
        <view class="panel-demo">
          <view class="panel-bg">
            <view class="bg-hint">背景区域</view>
          </view>
          <ky-floating-panel v-model:height="height5" :anchors="[100, 500]" background-color="#f5f7fa" :duration="0.5">
            <template #header>
              <view class="panel-header-text">自定义背景色</view>
            </template>
            <view class="panel-content">
              <view class="height-info">
                <text>当前高度：{{ height5 }} px</text>
              </view>
              <view class="animation-info">
                <text>动画时长：0.5s</text>
              </view>
            </view>
          </ky-floating-panel>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import '../index.scss'

const tabs = [
  { label: '基本使用', value: 0 },
  { label: '吸附点', value: 1 },
  { label: '内容滚动', value: 2 },
  { label: '自定义拖拽条', value: 3 },
  { label: '背景色动画', value: 4 },
]

const activeTab = ref(0)

const height1 = ref(300)
const height2 = ref(240)
const height3 = ref(400)
const height4 = ref(300)
const height5 = ref(300)

const heightChange = (height: number) => {
  console.log('heightChange', height)
}

const heightChangeEnd = (height: number) => {
  console.log('heightChangeEnd', height)
}
</script>

<style lang="scss">
.floating-panel-demo .tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 30rpx;
  gap: 12rpx;
}

.floating-panel-demo .tab-item {
  flex-shrink: 0;
  text-align: center;
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  &.active {
    background: #fff;
    color: #667eea;
    font-weight: 600;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  }
}

.floating-panel-demo .tab-content {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.floating-panel-demo .tab-panel {
  padding: 24rpx;
}

.floating-panel-demo .panel-demo {
  position: relative;
  height: 600rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #e8ecf0;
}

.floating-panel-demo .panel-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #87ceeb 0%, #e0f7fa 100%);
}

.floating-panel-demo .bg-hint {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.4);
}

.floating-panel-demo .panel-header-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  padding-bottom: 16rpx;
}

.floating-panel-demo .panel-content {
  padding: 20rpx;
}

.floating-panel-demo .scroll-content {
  height: 500rpx;
}

.floating-panel-demo .list-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 26rpx;
  color: #333;
}

.floating-panel-demo .height-info {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.floating-panel-demo .drag-hint {
  font-size: 24rpx;
  color: #999;
}

.floating-panel-demo .anchor-info {
  font-size: 24rpx;
  color: #409eff;
}

.floating-panel-demo .animation-info {
  font-size: 24rpx;
  color: #67c23a;
}

.floating-panel-demo .custom-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 0;
}

.floating-panel-demo .bar-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
