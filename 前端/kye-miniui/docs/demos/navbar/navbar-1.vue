<template>
  <view class="navbar-demo demo-container">
    <ky-navbar
      :title="currentNavbar.title"
      :left-text="currentNavbar.leftText"
      :right-text="currentNavbar.rightText"
      :border="currentNavbar.border"
      :left-arrow="currentNavbar.leftArrow"
      :placeholder="currentNavbar.placeholder"
      :show-plat-list="['wx']"
      @click-title="handleClickTitle"
      @click-left="handleClickLeft"
      @click-right="handleClickRight"
    >
      <template #left v-if="currentNavbar.leftSlot">
        <text class="slot-text">{{ currentNavbar.leftSlot }}</text>
      </template>
      <template #title v-if="currentNavbar.titleSlot">
        <text class="slot-title">{{ currentNavbar.titleSlot }}</text>
      </template>
      <template #right v-if="currentNavbar.rightSlot">
        <text class="slot-text">{{ currentNavbar.rightSlot }}</text>
      </template>
    </ky-navbar>

    <view class="section-header">
      <view class="section-title">Navbar 导航栏</view>
      <view class="section-desc">自定义导航栏组件，支持多端适配</view>
    </view>

    <view class="feature-grid">
      <view
        v-for="item in navbarItems"
        :key="item.type"
        class="card feature-card"
        :class="{ active: currentNavbar.type === item.type }"
        @click="selectNavbar(item)"
      >
        <view class="card-header">
          <view class="card-icon">{{ item.icon }}</view>
          <view class="card-title">{{ item.title }}</view>
        </view>
        <view class="card-body">
          <view class="feature-desc">{{ item.desc }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import '../index.scss'

interface NavbarConfig {
  type: string
  title: string
  leftText: string
  rightText: string
  border: boolean
  leftArrow: boolean
  placeholder: boolean
  leftSlot?: string
  titleSlot?: string
  rightSlot?: string
}

const navbarItems = [
  { type: 'basic', icon: '🏠', title: '基础使用', desc: '默认导航栏配置' },
  { type: 'custom-title', icon: '📝', title: '切换标题', desc: '设置不同的标题内容' },
  { type: 'left-btn', icon: '⬅️', title: '左侧按钮', desc: '控制返回按钮显示' },
  { type: 'right-btn', icon: '➡️', title: '右侧按钮', desc: '设置右侧操作按钮' },
  { type: 'border', icon: '🎨', title: '边框样式', desc: '显示底部边框' },
  { type: 'slots', icon: '✨', title: '插槽', desc: '完全自定义内容' },
]

const navbarConfigs: Record<string, NavbarConfig> = {
  basic: {
    type: 'basic',
    title: '标题内容',
    leftText: '',
    rightText: '',
    border: false,
    leftArrow: true,
    placeholder: true,
  },
  'custom-title': {
    type: 'custom-title',
    title: '订单详情',
    leftText: '',
    rightText: '',
    border: false,
    leftArrow: true,
    placeholder: true,
  },
  'left-btn': {
    type: 'left-btn',
    title: '个人中心',
    leftText: '返回',
    rightText: '',
    border: false,
    leftArrow: true,
    placeholder: true,
  },
  'right-btn': {
    type: 'right-btn',
    title: '设置',
    leftText: '',
    rightText: '保存',
    border: false,
    leftArrow: true,
    placeholder: true,
  },
  border: {
    type: 'border',
    title: '带边框导航',
    leftText: '',
    rightText: '更多',
    border: true,
    leftArrow: true,
    placeholder: true,
  },
  slots: {
    type: 'slots',
    title: '',
    leftText: '',
    rightText: '',
    border: false,
    leftArrow: false,
    placeholder: true,
    leftSlot: '← 返回',
    titleSlot: '自定义标题',
    rightSlot: '更多',
  },
}

const currentNavbar = reactive<NavbarConfig>({ ...navbarConfigs.basic })
const clickLog = ref('')

const selectNavbar = (item: { type: string }) => {
  const config = navbarConfigs[item.type]
  Object.keys(currentNavbar).forEach((key) => {
    delete currentNavbar[key as keyof NavbarConfig]
  })
  Object.assign(currentNavbar, config)
  clickLog.value = ''
}

const handleClickTitle = () => {
  clickLog.value = '点击标题'
}

const handleClickLeft = () => {
  clickLog.value = '点击左侧按钮'
}

const handleClickRight = () => {
  clickLog.value = '点击右侧按钮'
}

const generateCode = () => {
  const config = currentNavbar
  const parts: string[] = []

  if (config.title && !config.titleSlot) {
    parts.push(`title="${config.title}"`)
  }
  if (config.leftText) {
    parts.push(`left-text="${config.leftText}"`)
  }
  if (config.rightText) {
    parts.push(`right-text="${config.rightText}"`)
  }
  if (!config.leftArrow) {
    parts.push(':left-arrow="false"')
  }
  if (config.border) {
    parts.push('border')
  }

  const code = parts.length > 0 ? `<ky-navbar ${parts.join(' ')} />` : '<ky-navbar title="标题" />'

  return code
}
</script>

<style lang="scss">
.navbar-demo .demo-container {
  padding: 0;
}

.navbar-demo .navbar-showcase {
  position: sticky;
  top: 0;
  z-index: 999;
  background: #fff;
}

.navbar-demo .section-header {
  text-align: center;
  padding: 40rpx 0 30rpx;
}

.navbar-demo .section-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.navbar-demo .section-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.navbar-demo .feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 24rpx;
  padding: 0 30rpx;
}

.navbar-demo .card {
  &.feature-card {
    width: calc(50% - 18rpx);
    border: 2rpx solid transparent;
    transition: all 0.3s ease;

    &.active {
      border-color: #8365f6;
      background: #f8f5ff;
      box-shadow: 0 4rpx 20rpx rgba(131, 101, 246, 0.15);
    }
  }
}

.navbar-demo .card-header {
  padding: 20rpx 24rpx;
}

.navbar-demo .card-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.navbar-demo .card-title {
  font-size: 22px;
}

.navbar-demo .card-body {
  padding: 16rpx 24rpx;
}

.navbar-demo .feature-desc {
  font-size: 22rpx;
  color: #999;
}

.navbar-demo .config-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.navbar-demo .config-item {
  width: calc(50% - 8rpx);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.navbar-demo .config-label {
  font-size: 24rpx;
  color: #666;
}

.navbar-demo .config-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.navbar-demo .code-block {
  background: #1e1e1e;
  border-radius: 12rpx;
  padding: 20rpx;
  overflow-x: auto;
}

.navbar-demo .code-lang {
  font-size: 20rpx;
  color: #8365f6;
  margin-bottom: 12rpx;
  font-weight: 600;
}

.navbar-demo .code-content {
  font-size: 24rpx;
  color: #d4d4d4;
  font-family: 'Monaco', 'Menlo', monospace;
  white-space: nowrap;
}

.navbar-demo .interaction-tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.navbar-demo .event-log {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.navbar-demo .log-label {
  font-size: 24rpx;
  color: #666;
}

.navbar-demo .log-content {
  font-size: 24rpx;
  color: #8365f6;
  font-weight: 500;
}

.navbar-demo .slot-text {
  font-size: 28rpx;
  color: #8365f6;
}

.navbar-demo .slot-title {
  font-size: 32rpx;
  color: #8365f6;
  font-weight: 600;
}
</style>
