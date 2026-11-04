<template>
  <view class="tab-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Tab 标签页</view>
      <view class="header-subtitle">用于在不同内容区域之间进行切换</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📊</view>
          <view class="card-title">基本使用</view>
        </view>
        <view class="card-body">
          <view class="tab-demo-item">
            <ky-tab :tabs="basicTabs" v-model="activeIndex" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">排列方式</view>
        </view>
        <view class="card-body">
          <view class="tab-demo-item">
            <view class="demo-label">等比排列（默认）</view>
            <ky-tab :tabs="basicTabs" v-model="activeIndex" />
          </view>
          <view class="tab-demo-item">
            <view class="demo-label">左对齐</view>
            <ky-tab :tabs="basicTabs" v-model="activeIndex" :distributeEvenly="false" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🏷️</view>
          <view class="card-title">徽标提示</view>
        </view>
        <view class="card-body">
          <view class="tab-demo-item">
            <view class="demo-label">数量徽标</view>
            <ky-tab :tabs="badgeTabs" v-model="activeIndex" />
          </view>
          <view class="tab-demo-item">
            <view class="demo-label">红点提示</view>
            <ky-tab :tabs="dotTabs" v-model="activeIndex" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">💊</view>
          <view class="card-title">胶囊主题</view>
        </view>
        <view class="card-body">
          <view class="tab-demo-item">
            <ky-tab :tabs="capsuleTabs" v-model="activeIndex" theme="capsule" :distributeEvenly="false" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">下划线动画</view>
        </view>
        <view class="card-body">
          <view class="tab-demo-item">
            <view class="demo-label">首次开启动画</view>
            <ky-tab :tabs="basicTabs" v-model="activeIndex" underline-first-animation />
          </view>
          <view class="tab-demo-item">
            <view class="demo-label">关闭动画</view>
            <ky-tab :tabs="basicTabs" v-model="activeIndex" :no-animation="true" />
          </view>
          <view class="tab-demo-item">
            <view class="demo-label">隐藏下划线</view>
            <ky-tab :tabs="basicTabs" v-model="activeIndex" :underline="false" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🌙</view>
          <view class="card-title">深色主题</view>
        </view>
        <view class="card-body">
          <ky-tab :tabs="basicTabs" v-model="activeIndex" theme="dark" />
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⚡</view>
          <view class="card-title">动态标签</view>
        </view>
        <view class="card-body">
          <view class="demo-buttons">
            <ky-button size="mini" type="primary" @click="addTab">添加标签</ky-button>
            <ky-button size="mini" type="default" @click="removeTab">删除标签</ky-button>
          </view>
          <view class="tab-demo-item">
            <ky-tab :tabs="dynamicTabs" v-model="dynamicActive" dynamic-tab :distributeEvenly="false" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔒</view>
          <view class="card-title">禁用点击</view>
        </view>
        <view class="card-body">
          <view class="demo-buttons">
            <ky-button size="mini" type="primary" @click="activeIndex = 0">切换到第一个</ky-button>
            <ky-button size="mini" type="default" @click="activeIndex = 1">切换到第二个</ky-button>
          </view>
          <view class="tab-demo-item">
            <ky-tab :tabs="basicTabs" v-model="activeIndex" disable-tab-click />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import '../index.scss'

const activeIndex = ref(0)
const dynamicActive = ref(0)

const basicTabs = ref([{ label: '全部' }, { label: '待处理' }, { label: '处理中' }, { label: '已完成' }])

const badgeTabs = ref([
  { label: '消息', badgeCount: 5 },
  { label: '通知', badgeCount: 12 },
  { label: '动态', badgeCount: 100 },
])

const dotTabs = ref([
  { label: '收件箱', showBadgeDot: true },
  { label: '已发送', showBadgeDot: true },
  { label: '草稿箱' },
])

const capsuleTabs = ref([{ label: '全部' }, { label: '待处理', badgeCount: 8 }, { label: '已完成', badgeCount: 100 }])

const dynamicTabs = ref([{ label: '标签一' }, { label: '标签二' }])

let tabCount = 3

const addTab = () => {
  dynamicTabs.value.push({ label: `标签${tabCount++}` })
}

const removeTab = () => {
  if (dynamicTabs.value.length > 1) {
    dynamicTabs.value.pop()
    if (dynamicActive.value >= dynamicTabs.value.length) {
      dynamicActive.value = dynamicTabs.value.length - 1
    }
  }
}
</script>

<style lang="scss">
.tab-demo .card-body {
  padding: 32rpx;
}

.tab-demo .tab-demo-item {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.tab-demo .demo-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.tab-demo .demo-buttons {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.tab-demo .dark-bg {
  background: #1a1a1a;
  padding: 24rpx;
  border-radius: 12rpx;
}
</style>
