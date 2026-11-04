<template>
  <view class="switch-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Switch 开关</view>
      <view class="header-subtitle">用于在两种状态之间进行切换</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔘</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="switch-item">
            <view class="switch-label">默认开关</view>
            <ky-switch v-model="defaultValue" @change="onChange" />
          </view>
          <view class="switch-item">
            <view class="switch-label">当前值：{{ defaultValue }}</view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔒</view>
          <view class="card-title">禁用状态</view>
        </view>
        <view class="card-body">
          <view class="switch-item">
            <view class="switch-label">禁用 - 开启状态</view>
            <ky-switch v-model="disabledValue" disabled />
          </view>
          <view class="switch-item">
            <view class="switch-label">禁用 - 关闭状态</view>
            <ky-switch v-model="disabledValue2" disabled />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">自定义颜色</view>
        </view>
        <view class="card-body">
          <view class="switch-item">
            <view class="switch-label">自定义激活颜色</view>
            <ky-switch v-model="colorValue" active-color="#FF706D" />
          </view>
          <view class="switch-item">
            <view class="switch-label">自定义非激活颜色</view>
            <ky-switch v-model="colorValue2" inactive-color="#D0D0D0" />
          </view>
          <view class="switch-item">
            <view class="switch-label">双向自定义颜色</view>
            <ky-switch v-model="colorValue3" active-color="#00C58C" inactive-color="#E8F5F0" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📐</view>
          <view class="card-title">开关尺寸</view>
        </view>
        <view class="card-body">
          <view class="size-row">
            <ky-switch v-model="sizeValue" size="large" />
            <text class="size-label">large</text>
          </view>
          <view class="size-row">
            <ky-switch v-model="sizeValue" size="medium" />
            <text class="size-label">medium</text>
          </view>
          <view class="size-row">
            <ky-switch v-model="sizeValue" size="normal" />
            <text class="size-label">normal</text>
          </view>
          <view class="size-row">
            <ky-switch v-model="sizeValue" size="small" />
            <text class="size-label">small</text>
          </view>
          <view class="size-row">
            <ky-switch v-model="sizeValue" size="mini" />
            <text class="size-label">mini</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">☑️</view>
          <view class="card-title">Checkbox 类型</view>
        </view>
        <view class="card-body">
          <view class="switch-item">
            <view class="switch-label">Checkbox 样式</view>
            <ky-switch v-model="checkboxValue" type="checkbox" />
          </view>
          <view class="switch-item">
            <view class="switch-label">Checkbox 自定义颜色</view>
            <ky-switch v-model="checkboxValue2" type="checkbox" active-color="#FF706D" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔄</view>
          <view class="card-title">自定义值</view>
        </view>
        <view class="card-body">
          <view class="switch-item">
            <view class="switch-label">字符串值</view>
            <ky-switch v-model="customValue" active-value="'ON'" inactive-value="'OFF'" @change="onCustomChange" />
          </view>
          <view class="switch-item">
            <view class="switch-label">当前值：{{ customValue }}</view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏳</view>
          <view class="card-title">加载状态</view>
        </view>
        <view class="card-body">
          <view class="switch-item">
            <view class="switch-label">加载中</view>
            <ky-switch v-model="loadingValue" loading />
          </view>
          <view class="switch-item">
            <view class="switch-label">自定义加载图标</view>
            <ky-switch v-model="loadingValue2" loading>
              <template #icon>
                <view class="custom-loading">
                  <view class="loading-spinner"></view>
                </view>
              </template>
            </ky-switch>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const defaultValue = ref(true)
const disabledValue = ref(true)
const disabledValue2 = ref(false)
const colorValue = ref(true)
const colorValue2 = ref(true)
const colorValue3 = ref(true)
const sizeValue = ref(true)
const checkboxValue = ref(false)
const checkboxValue2 = ref(false)
const customValue = ref('ON')
const loadingValue = ref(true)
const loadingValue2 = ref(true)

const onChange = (value: any) => {
  console.log('开关状态变化:', value)
}

const onCustomChange = (value: any) => {
  console.log('自定义值变化:', value)
}
</script>

<style lang="scss">
.switch-demo .switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.switch-demo .switch-label {
  font-size: 26rpx;
  color: #666;
}

.switch-demo .size-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.switch-demo .size-label {
  font-size: 24rpx;
  color: #999;
  margin-left: 16rpx;
}

.switch-demo .custom-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-demo .loading-spinner {
  width: 16rpx;
  height: 16rpx;
  border: 2rpx solid rgba(131, 101, 246, 0.3);
  border-top-color: #8365f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
