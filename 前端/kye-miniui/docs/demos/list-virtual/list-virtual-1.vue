<template>
  <view class="list-virtual-demo">
    <view class="list-virtual-demo demo-container">
      <view class="demo-header">
        <view class="header-title">ListVirtual 虚拟列表</view>
        <view class="header-subtitle">基于 List 组件开发，支持大数据量渲染</view>
      </view>

      <view class="demo-content-list">
        <view class="card">
          <view class="card-body-list">
            <view class="list-container">
              <ky-list-virtual
                ref="listRef"
                :fetch="fetchData"
                :item-height="100"
                :item-space="8"
                :overscan="overscanCount"
                :get-key="getKey"
                :scroll-view-props="scrollViewProps"
                @scroll="handleScroll"
              >
                <template #beforeContent>
                  <view class="list-header">
                    <text class="header-label">👥 员工列表</text>
                    <text class="header-count">共 {{ total }} 人</text>
                  </view>
                </template>

                <template #default="{ data, index }">
                  <view class="list-item">
                    <view class="item-avatar">{{ data.avatar }}</view>
                    <view class="item-content">
                      <text class="item-name">{{ data.name }}</text>
                      <text class="item-position">{{ data.position }}</text>
                      <text class="item-desc">{{ data.desc }}</text>
                    </view>
                    <text class="item-tag" :class="`tag-${data.status}`">{{ statusMap[data.status] }}</text>
                  </view>
                </template>

                <template #empty>
                  <view class="custom-empty">
                    <text class="empty-icon">📭</text>
                    <text class="empty-text">暂无数据</text>
                    <text class="empty-tip">点击下拉刷新重新加载</text>
                  </view>
                </template>

                <template #finished>
                  <view class="list-footer">
                    <text class="footer-text">— 已加载全部数据 —</text>
                  </view>
                </template>
              </ky-list-virtual>
            </view>
            <view class="scroll-info">
              <text class="info-label">滚动位置：</text>
              <text class="info-value">{{ scrollTop.toFixed(0) }}px</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'

interface ListData {
  id: number
  avatar: string
  name: string
  position: string
  desc: string
  status: 'active' | 'vacation' | 'business'
}

const listRef = ref()
const total = ref(0)
const scrollTop = ref(0)

const systemInfo = Taro.getSystemInfoSync()
const isLowPerformanceDevice = computed(() => {
  return (
    systemInfo.platform === 'devtools' ||
    (systemInfo.system?.includes('iOS') && parseFloat(systemInfo.system?.split(' ')[1]) < 15)
  )
})

const overscanCount = computed(() => {
  return isLowPerformanceDevice.value ? 5 : 10
})

const scrollViewProps = {
  scrollWithAnimation: true,
  enhanced: true,
  showScrollbar: false,
}

const getKey = (item: ListData) => item.id

const statusMap: Record<string, string> = {
  active: '在职',
  vacation: '休假',
  business: '出差',
}

const handleScroll = (e: any) => {
  scrollTop.value = e?.detail?.scrollTop || 0
}

const fetchData = async (page: number) => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const avatars = ['👨‍💻', '👩‍💻', '👨‍🚀', '👩‍🚀', '🧑‍🎨', '👨‍🎨', '👩‍⚕️', '👨‍⚕️', '👩‍🎓', '👨‍🎓']
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑一', '陈二']
  const positions = [
    '前端工程师',
    '后端工程师',
    '产品经理',
    '设计师',
    '测试工程师',
    '运维工程师',
    '项目经理',
    '技术总监',
  ]
  const statuses: ('active' | 'vacation' | 'business')[] = ['active', 'vacation', 'business']

  const data: ListData[] = Array.from({ length: 20 }, (_, i) => {
    const idx = (page - 1) * 20 + i
    const contentLength = (idx % 4) + 1
    const descs = [
      '负责前端页面开发与优化',
      '专注于后端服务架构设计和性能优化，具备丰富的微服务开发经验',
      '主导产品规划与设计，协调跨团队资源推动项目落地',
      '负责产品视觉设计，包括UI/UX设计和品牌设计',
    ]

    return {
      id: idx,
      avatar: avatars[idx % avatars.length],
      name: names[idx % names.length] + (idx + 1),
      position: positions[idx % positions.length],
      desc: descs[contentLength - 1],
      status: statuses[idx % statuses.length],
    }
  })

  const totalCount = 100
  total.value = totalCount

  return {
    data,
    total: totalCount,
  }
}
</script>

<style lang="scss">
.list-virtual-demo .demo-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-virtual-demo .demo-header {
  flex-shrink: 0;
}

.list-virtual-demo .demo-content-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.list-virtual-demo .card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.list-virtual-demo .card-body-list {
  min-height: 0;
  padding: 24rpx;
}

.list-virtual-demo .list-container {
  height: 100%;
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
}

.list-virtual-demo .scroll-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  margin-top: 16rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
}

.list-virtual-demo .info-label {
  font-size: 24rpx;
  color: #666;
}

.list-virtual-demo .info-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #667eea;
  margin-left: 8rpx;
}

.list-virtual-demo .list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #8365f6 0%, #667eea 100%);
}

.list-virtual-demo .header-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}

.list-virtual-demo .header-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.list-virtual-demo .list-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.list-virtual-demo .item-avatar {
  font-size: 64rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.list-virtual-demo .item-content {
  flex: 1;
  min-width: 0;
}

.list-virtual-demo .item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.list-virtual-demo .item-position {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
  display: block;
}

.list-virtual-demo .item-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

.list-virtual-demo .item-tag {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.list-virtual-demo .tag-active {
  background: #f6ffed;
  color: #52c41a;
}

.list-virtual-demo .tag-vacation {
  background: #fff7e6;
  color: #fa8c16;
}

.list-virtual-demo .tag-business {
  background: #e6f7ff;
  color: #1890ff;
}

.list-virtual-demo .custom-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.list-virtual-demo .empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.list-virtual-demo .empty-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.list-virtual-demo .empty-tip {
  font-size: 24rpx;
  color: #999;
}

.list-virtual-demo .list-footer {
  padding: 20rpx;
  text-align: center;
  background: #fff;
}

.list-virtual-demo .footer-text {
  font-size: 24rpx;
  color: #999;
}
</style>
