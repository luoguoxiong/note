<template>
  <view class="float-pagination-demo demo-container">
    <view class="demo-header">
      <view class="header-title">FloatPagination 浮动翻页器</view>
      <view class="header-subtitle">浮动翻页器用法示例</view>
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
        <view class="pagination-demo">
          <view class="demo-hint">
            <text>👆 点击上下按钮翻页，点击中间区域收起</text>
          </view>
          <ky-float-pagination
            v-model="current1"
            :max="5"
            @change="onChange"
            @prev="onPrev"
            @next="onNext"
            @open="onOpen"
            @close="onClose"
          />
        </view>
        <view class="info">
          <text>当前页码：{{ current1 }}</text>
        </view>
      </view>

      <view v-show="activeTab === 1" class="tab-panel">
        <view class="pagination-demo">
          <view class="demo-hint">
            <text>👆 切换左右靠边位置</text>
          </view>
          <view class="placement-options">
            <view
              v-for="p in placementOptions"
              :key="p.value"
              :class="['placement-btn', { active: currentPlacement === p.value }]"
              @click="currentPlacement = p.value"
            >
              <text>{{ p.label }}</text>
            </view>
          </view>
          <ky-float-pagination v-model="current2" :max="10" :placement="currentPlacement" />
        </view>
        <view class="info">
          <text>当前页码：{{ current2 }}</text>
          <text class="placement-info">靠边位置：{{ currentPlacement }}</text>
        </view>
      </view>

      <view v-show="activeTab === 2" class="tab-panel">
        <view class="pagination-demo">
          <view class="demo-hint">
            <text>👆 到达边界时按钮自动不可点击</text>
          </view>
          <ky-float-pagination v-model="current3" :min="1" :max="6" :disabled="disabled" />
          <view class="disabled-options">
            <view :class="['disabled-btn', { active: !disabled }]" @click="disabled = false">
              <text>启用</text>
            </view>
            <view :class="['disabled-btn', { active: disabled }]" @click="disabled = true">
              <text>禁用</text>
            </view>
          </view>
        </view>
        <view class="info">
          <text>当前页码：{{ current3 }}（min 1 / max 6）</text>
          <text class="disabled-info">禁用状态：{{ disabled }}</text>
        </view>
      </view>

      <view v-show="activeTab === 3" class="tab-panel">
        <view class="pagination-demo">
          <view class="demo-hint">
            <text>👆 自定义按钮文案</text>
          </view>
          <ky-float-pagination v-model="current4" :max="10" prevText="上一页" nextText="下一页" />
        </view>
        <view class="pagination-demo">
          <view class="demo-hint">
            <text>👆 操作组件查看事件日志</text>
          </view>
          <ky-float-pagination
            v-model="current5"
            :max="8"
            @change="logEvent('change', $event)"
            @prev="logEvent('prev', $event)"
            @next="logEvent('next', $event)"
            @open="logEvent('open')"
            @close="logEvent('close')"
          />
        </view>
        <view class="info log-info">
          <text v-for="(line, i) in logs" :key="i">{{ line }}</text>
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
  { label: '左右靠边', value: 1 },
  { label: '边界与禁用', value: 2 },
  { label: '自定义文案', value: 3 },
  { label: '事件', value: 4 },
]

const activeTab = ref(0)

const current1 = ref(1)
const current2 = ref(1)
const current3 = ref(1)
const current4 = ref(1)
const current5 = ref(1)

const placementOptions = [
  { label: '左靠边', value: 'left' },
  { label: '右靠边', value: 'right' },
]
const currentPlacement = ref('left')

const disabled = ref(false)

const logs = ref<string[]>([])
const logEvent = (name: string, value?: number) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${name}${value !== undefined ? ': ' + value : ''}`)
  if (logs.value.length > 6) logs.value.pop()
}

const onChange = (value: number) => console.log('change', value)
const onPrev = (value: number) => console.log('prev', value)
const onNext = (value: number) => console.log('next', value)
const onOpen = () => console.log('open')
const onClose = () => console.log('close')
</script>

<style lang="scss">
.float-pagination-demo {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.float-pagination-demo .demo-header {
  flex-shrink: 0;
}

.float-pagination-demo .tabs {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 20rpx;
  gap: 12rpx;
}

.float-pagination-demo .tab-item {
  flex-shrink: 0;
  text-align: center;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  &.active {
    background: #fff;
    color: #8365f6;
    font-weight: 600;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  }
}

.float-pagination-demo .tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.float-pagination-demo .tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
}

.float-pagination-demo .pagination-demo {
  flex: 1;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f7ff 0%, #f5f0ff 100%);
}

.float-pagination-demo .demo-hint {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.float-pagination-demo .placement-options,
.float-pagination-demo .disabled-options {
  position: absolute;
  top: 60rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16rpx;
  z-index: 1;
}

.float-pagination-demo .placement-btn,
.float-pagination-demo .disabled-btn {
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: #8365f6;
    color: #fff;
    border-color: #8365f6;
  }
}

.float-pagination-demo .info {
  flex-shrink: 0;
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #666;

  text {
    display: block;
    margin-bottom: 6rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.float-pagination-demo .placement-info {
  color: #8365f6;
}

.float-pagination-demo .disabled-info {
  color: #e6a23c;
}

.float-pagination-demo .log-info {
  min-height: 120rpx;

  text {
    font-family: monospace;
    color: #409eff;
  }
}
</style>
