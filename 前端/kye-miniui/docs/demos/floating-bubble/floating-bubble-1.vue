<template>
  <view class="floating-bubble-demo demo-container">
    <view class="demo-header">
      <view class="header-title">FloatingBubble 浮动气泡</view>
      <view class="header-subtitle">浮动气泡用法示例</view>
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
        <view class="bubble-demo">
          <view class="demo-hint">
            <text>👆 拖拽气泡体验基本用法</text>
          </view>
          <ky-floating-bubble
            v-model:offset="offset1"
            axis="y"
            text="基础用法"
            @click="handleClick"
            @offsetChange="handleOffsetChange"
            @offsetChangeEnd="handleOffsetChangeEnd"
          />
        </view>
        <view class="offset-info">
          <text>当前位置：({{ offset1.x }}, {{ offset1.y }})</text>
        </view>
      </view>

      <view v-show="activeTab === 1" class="tab-panel">
        <view class="bubble-demo">
          <view class="demo-hint">
            <text>👆 尝试在 X/Y 方向拖拽</text>
          </view>
          <view class="axis-options">
            <view
              v-for="axis in axisOptions"
              :key="axis.value"
              :class="['axis-btn', { active: currentAxis === axis.value }]"
              @click="currentAxis = axis.value"
            >
              <text>{{ axis.label }}</text>
            </view>
          </view>
          <ky-floating-bubble v-model:offset="offset2" :axis="currentAxis" :magnetic="null" text="拖拽方向" />
        </view>
        <view class="offset-info">
          <text>当前位置：({{ offset2.x }}, {{ offset2.y }})</text>
          <text class="axis-info">拖拽方向：{{ currentAxis }}</text>
        </view>
      </view>

      <view v-show="activeTab === 2" class="tab-panel">
        <view class="bubble-demo">
          <view class="demo-hint">
            <text>👆 拖拽结束后自动吸附到边缘</text>
          </view>
          <view class="magnetic-options">
            <view
              v-for="magnetic in magneticOptions"
              :key="magnetic.value"
              :class="['magnetic-btn', { active: currentMagnetic === magnetic.value }]"
              @click="currentMagnetic = magnetic.value"
            >
              <text>{{ magnetic.label }}</text>
            </view>
          </view>
          <ky-floating-bubble v-model:offset="offset3" axis="xy" :magnetic="currentMagnetic" text="磁吸效果" />
        </view>
        <view class="offset-info">
          <text>当前位置：({{ offset3.x }}, {{ offset3.y }})</text>
          <text class="magnetic-info">磁吸方向：{{ currentMagnetic || '无' }}</text>
        </view>
      </view>

      <view v-show="activeTab === 3" class="tab-panel">
        <view class="bubble-demo">
          <view class="demo-hint">
            <text>👆 拖拽气泡，设置边距限制</text>
          </view>
          <view class="gap-options">
            <view
              v-for="gap in gapOptions"
              :key="gap"
              :class="['gap-btn', { active: currentGap === gap }]"
              @click="currentGap = gap"
            >
              <text>gap {{ gap }}</text>
            </view>
          </view>
          <ky-floating-bubble v-model:offset="offset4" axis="xy" :gap="currentGap" text="边距设置" />
        </view>
        <view class="offset-info">
          <text>当前位置：({{ offset4.x }}, {{ offset4.y }})</text>
          <text class="gap-info">边距：{{ currentGap }}px</text>
        </view>
      </view>

      <view v-show="activeTab === 4" class="tab-panel">
        <view class="bubble-demo">
          <view class="demo-hint">
            <text>👆 自定义气泡内容</text>
          </view>
          <ky-floating-bubble v-model:offset="offset5" axis="xy">
            <view class="custom-bubble">
              <view class="bubble-icon">🎯</view>
              <view class="bubble-text">自定义</view>
            </view>
          </ky-floating-bubble>
        </view>
        <view class="offset-info">
          <text>当前位置：({{ offset5.x }}, {{ offset5.y }})</text>
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
  { label: '拖拽方向', value: 1 },
  { label: '磁吸效果', value: 2 },
  { label: '边距设置', value: 3 },
  { label: '自定义内容', value: 4 },
]

const activeTab = ref(0)

const offset1 = ref({ x: 50, y: 100 })
const offset2 = ref({ x: 50, y: 100 })
const offset3 = ref({ x: 100, y: 150 })
const offset4 = ref({ x: 50, y: 100 })
const offset5 = ref({ x: 50, y: 100 })

const axisOptions = [
  { label: '仅X轴', value: 'x' },
  { label: '仅Y轴', value: 'y' },
  { label: '自由拖拽', value: 'xy' },
  { label: '锁定', value: 'lock' },
]

const currentAxis = ref('xy')

const magneticOptions = [
  { label: '无', value: null },
  { label: 'X方向', value: 'x' },
  { label: 'Y方向', value: 'y' },
]

const currentMagnetic = ref('x')

const gapOptions = [0, 10, 20, 30]
const currentGap = ref(10)

const handleClick = (e) => {
  console.log('click', e)
}

const handleOffsetChange = (offset) => {
  console.log('offsetChange', offset)
}

const handleOffsetChangeEnd = (offset) => {
  console.log('offsetChangeEnd', offset)
}
</script>

<style lang="scss">
.floating-bubble-demo .tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 30rpx;
  gap: 12rpx;
}

.floating-bubble-demo .tab-item {
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

.floating-bubble-demo .tab-content {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.floating-bubble-demo .tab-panel {
  padding: 24rpx;
}

.floating-bubble-demo .bubble-demo {
  position: relative;
  height: 500rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 100%);
}

.floating-bubble-demo .demo-hint {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.floating-bubble-demo .axis-options,
.floating-bubble-demo .magnetic-options,
.floating-bubble-demo .gap-options {
  position: absolute;
  top: 80rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16rpx;
  z-index: 1;
}

.floating-bubble-demo .axis-btn,
.floating-bubble-demo .magnetic-btn,
.floating-bubble-demo .gap-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: #667eea;
    color: #fff;
    border-color: #667eea;
  }
}

.floating-bubble-demo .offset-info {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;

  text {
    display: block;
    margin-bottom: 8rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.floating-bubble-demo .axis-info {
  color: #409eff;
}

.floating-bubble-demo .magnetic-info {
  color: #67c23a;
}

.floating-bubble-demo .gap-info {
  color: #e6a23c;
}

.floating-bubble-demo .custom-bubble {
  width: 100px;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px solid #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.floating-bubble-demo .bubble-icon {
  font-size: 20px;
}

.floating-bubble-demo .bubble-text {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}
</style>
