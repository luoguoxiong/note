<template>
  <view class="list-demo">
    <view class="demo-container">
      <view class="demo-header">
        <view class="header-title">List 列表</view>
        <view class="header-subtitle">基于 scroll-view 封装，支持下拉刷新和上拉加载</view>
      </view>

      <view class="demo-content">
        <view class="card">
          <view class="card-header">
            <view class="card-icon">📋</view>
            <view class="card-title">列表完整示例</view>
            <text class="card-tip">下拉刷新 / 上拉加载 / 自定义状态</text>
          </view>
          <view class="card-body">
            <view class="list-container">
              <ky-list
                ref="listRef"
                v-model:refreshing="refreshing"
                v-model:loading="loading"
                :isFinished="finished"
                :isEmpty="isEmpty"
                :isLoadFail="isLoadFail"
                :scrollViewProps="scrollViewProps"
                @refresh="onRefresh"
                @load="onLoad"
                @scroll="handleScroll"
              >
                <template #empty>
                  <view class="custom-empty">
                    <text class="empty-icon">📭</text>
                    <text class="empty-text">暂无数据</text>
                    <text class="empty-tip">点击下拉刷新重新加载</text>
                  </view>
                </template>

                <view v-for="item in list" :key="item.id" class="list-item">
                  <view class="item-avatar">{{ item.avatar }}</view>
                  <view class="item-content">
                    <text class="item-name">{{ item.name }}</text>
                    <text class="item-position">{{ item.position }}</text>
                    <text class="item-desc">{{ item.desc }}</text>
                  </view>
                  <text class="item-tag" :class="`tag-${item.status}`">{{ statusMap[item.status] }}</text>
                </view>

                <template #finished>
                  <view class="list-footer">
                    <text class="footer-text">— 已加载全部数据 —</text>
                  </view>
                </template>

                <template #load-fail>
                  <view class="load-fail" @click="reload">
                    <text class="fail-icon">🔄</text>
                    <text class="fail-text">加载失败，点击重试</text>
                  </view>
                </template>
              </ky-list>
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
import { ref } from 'vue'
import '../index.scss'

interface ListData {
  id: number
  avatar: string
  name: string
  position: string
  desc: string
  status: 'active' | 'vacation' | 'business'
}

const listRef = ref()
const list = ref<ListData[]>([])
const page = ref(1)
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const isEmpty = ref(false)
const isLoadFail = ref(false)
const scrollTop = ref(0)

const statusMap: Record<string, string> = {
  active: '在职',
  vacation: '休假',
  business: '出差',
}

const scrollViewProps = {
  scrollWithAnimation: true,
  showScrollbar: false,
}

const handleScroll = (e: any) => {
  scrollTop.value = e?.detail?.scrollTop || 0
}

const fetchData = async (pageNum: number) => {
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

  const data: ListData[] = Array.from({ length: 10 }, (_, i) => {
    const idx = (pageNum - 1) * 10 + i
    const contentLength = (idx % 3) + 1
    const descs = [
      '负责前端页面开发与优化',
      '专注于后端服务架构设计和性能优化',
      '主导产品规划与设计，协调跨团队资源推动项目落地',
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

  return {
    data,
    total: 50,
  }
}

const onRefresh = async () => {
  page.value = 1
  finished.value = false
  isEmpty.value = false
  isLoadFail.value = false
  refreshing.value = true
  try {
    const data = await fetchData(1)
    list.value = data.data
    finished.value = list.value.length >= data.total
    isEmpty.value = !list.value.length
  } catch {
    isLoadFail.value = true
  } finally {
    refreshing.value = false
  }
}

onRefresh()

const onLoad = async () => {
  if (loading.value || finished.value) return

  loading.value = true
  isLoadFail.value = false

  try {
    const data = await fetchData(page.value + 1)
    list.value.push(...data.data)
    page.value++
    finished.value = list.value.length >= data.total
  } catch {
    isLoadFail.value = true
  } finally {
    loading.value = false
  }
}

const reload = () => {
  onRefresh()
}
</script>

<style lang="scss">
.list-demo .demo-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-demo .demo-header {
  flex-shrink: 0;
}

.list-demo .demo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.list-demo .card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.list-demo .card-header {
  flex-shrink: 0;
}

.list-demo .card-tip {
  font-size: 22rpx;
  color: #999;
  margin-left: 16rpx;
}

.list-demo .card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 24rpx;
}

.list-demo .list-container {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
}

.list-demo .scroll-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  margin-top: 16rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
}

.list-demo .info-label {
  font-size: 24rpx;
  color: #666;
}

.list-demo .info-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #667eea;
  margin-left: 8rpx;
}

.list-demo .list-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.list-demo .item-avatar {
  font-size: 64rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.list-demo .item-content {
  flex: 1;
  min-width: 0;
}

.list-demo .item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.list-demo .item-position {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
  display: block;
}

.list-demo .item-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

.list-demo .item-tag {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.list-demo .tag-active {
  background: #f6ffed;
  color: #52c41a;
}

.list-demo .tag-vacation {
  background: #fff7e6;
  color: #fa8c16;
}

.list-demo .tag-business {
  background: #e6f7ff;
  color: #1890ff;
}

.list-demo .custom-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.list-demo .empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.list-demo .empty-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.list-demo .empty-tip {
  font-size: 24rpx;
  color: #999;
}

.list-demo .list-footer {
  padding: 20rpx;
  text-align: center;
  background: #fff;
}

.list-demo .footer-text {
  font-size: 24rpx;
  color: #999;
}

.list-demo .load-fail {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  background: #fff;
}

.list-demo .fail-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.list-demo .fail-text {
  font-size: 24rpx;
  color: #fa5151;
}
</style>
