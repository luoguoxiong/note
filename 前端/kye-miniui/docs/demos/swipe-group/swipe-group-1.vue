<template>
  <view class="swipe-group-demo demo-container">
    <view class="demo-header">
      <view class="header-title">SwipeGroup 滑动组</view>
      <view class="header-subtitle">滑动单元格和分组容器用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">➡️</view>
          <view class="card-title">基础滑动</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">右侧滑动</view>
            <ky-swipe-cell>
              <ky-cell title="左滑显示操作"></ky-cell>
              <template #right>
                <ky-button type="primary">操作</ky-button>
              </template>
            </ky-swipe-cell>
          </view>
          <view class="demo-item">
            <view class="demo-label">左侧滑动</view>
            <ky-swipe-cell>
              <ky-cell title="右滑显示操作"></ky-cell>
              <template #left>
                <ky-button type="danger">删除</ky-button>
              </template>
            </ky-swipe-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">↔️</view>
          <view class="card-title">双向滑动</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">左右都可滑动</view>
            <ky-swipe-cell>
              <ky-cell title="双向滑动">
                <view style="display: flex">
                  <view>← 左滑</view>
                  <view style="margin: 0 10rpx">内容区域</view>
                  <view>右滑 →</view>
                </view>
              </ky-cell>
              <template #left>
                <ky-button type="primary">收藏</ky-button>
              </template>
              <template #right>
                <ky-button type="danger">删除</ky-button>
              </template>
            </ky-swipe-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔒</view>
          <view class="card-title">互斥模式</view>
        </view>
        <view class="card-body">
          <view class="demo-label">同一时间仅一个打开</view>
          <ky-swipe-group lock>
            <ky-swipe-cell name="row-1">
              <ky-cell title="列表项 1"></ky-cell>
              <template #right>
                <ky-button type="primary">操作</ky-button>
              </template>
            </ky-swipe-cell>
            <ky-swipe-cell name="row-2">
              <ky-cell title="列表项 2"></ky-cell>
              <template #right>
                <ky-button type="primary">操作</ky-button>
              </template>
            </ky-swipe-cell>
            <ky-swipe-cell name="row-3">
              <ky-cell title="列表项 3"></ky-cell>
              <template #right>
                <ky-button type="primary">操作</ky-button>
              </template>
            </ky-swipe-cell>
          </ky-swipe-group>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🚫</view>
          <view class="card-title">禁用状态</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">禁止滑动</view>
            <ky-swipe-cell disabled>
              <ky-cell title="禁止滑动"></ky-cell>
              <template #right>
                <ky-button type="primary">操作</ky-button>
              </template>
            </ky-swipe-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎮</view>
          <view class="card-title">手动控制</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">点击按钮控制打开</view>
            <ky-swipe-cell ref="swipeRef">
              <ky-cell title="手动触发"></ky-cell>
              <template #left>
                <ky-button type="primary">收藏</ky-button>
              </template>
              <template #right>
                <ky-button type="danger">删除</ky-button>
              </template>
            </ky-swipe-cell>
            <view class="action-buttons">
              <ky-button type="primary" size="mini" @click="handleOpenLeft">打开左侧</ky-button>
              <ky-button type="primary" size="mini" @click="handleOpenRight">打开右侧</ky-button>
              <ky-button type="default" size="mini" @click="handleClose">关闭</ky-button>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✅</view>
          <view class="card-title">关闭前确认</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">点击内容区弹出确认框</view>
            <ky-swipe-cell :beforeClose="onBeforeClose">
              <ky-cell title="关闭前拦截"></ky-cell>
              <template #right>
                <ky-button type="danger">删除</ky-button>
              </template>
            </ky-swipe-cell>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔄</view>
          <view class="card-title">双向绑定</view>
        </view>
        <view class="card-body">
          <view class="demo-item">
            <view class="demo-label">通过 v-model:show 控制</view>
            <ky-swipe-cell v-model:show="show">
              <ky-cell title="双向绑定"></ky-cell>
              <template #right>
                <ky-button type="primary">操作</ky-button>
              </template>
            </ky-swipe-cell>
            <view class="action-buttons">
              <ky-button type="primary" size="mini" @click="show = true">打开</ky-button>
              <ky-button type="default" size="mini" @click="show = false">关闭</ky-button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)
const swipeRef = ref(null)

const handleOpenLeft = () => {
  swipeRef.value?.open('left')
}

const handleOpenRight = () => {
  swipeRef.value?.open('right')
}

const handleClose = () => {
  swipeRef.value?.close()
}

const onBeforeClose = ({ position }) => {
  debugger
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const result = window.confirm('确定要关闭吗？')
      resolve(result)
    } else {
      resolve(true)
    }
  })
}
</script>

<style lang="scss">
.swipe-group-demo .action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}
</style>
