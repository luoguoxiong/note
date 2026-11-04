<template>
  <view class="auto-complete-demo demo-container" id="ky-auto-complete-content">
    <view class="demo-header">
      <view class="header-title">AutoComplete 自动完成</view>
      <view class="header-subtitle">根据输入内容提供相关的输入建议</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔍</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">手机号联想</view>
            <ky-auto-complete
              v-model="phoneValue"
              placeholder="请输入手机号"
              :fetch-suggestions="querySearchAsync"
              listenClickId="ky-auto-complete-content"
            >
            </ky-auto-complete>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">自定义模板</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">自定义建议项内容</view>
            <ky-auto-complete
              v-model="customValue"
              placeholder="请输入城市名"
              :fetch-suggestions="queryCity"
              listenClickId="ky-auto-complete-content"
            >
              <template #default="{ item }">
                <view class="custom-item">
                  <view class="item-icon">📍</view>
                  <view class="item-content">
                    <view class="item-name">{{ item.name }}</view>
                    <view class="item-pinyin">{{ item.pinyin }}</view>
                  </view>
                </view>
              </template>
            </ky-auto-complete>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⏱️</view>
          <view class="card-title">防抖搜索</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">600ms 防抖延迟</view>
            <ky-auto-complete
              v-model="debounceValue"
              :debounce="600"
              placeholder="输入后延迟搜索"
              :fetch-suggestions="querySearchAsync"
              listenClickId="ky-auto-complete-content"
            >
            </ky-auto-complete>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🚫</view>
          <view class="card-title">禁用状态</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">禁用输入框</view>
            <ky-auto-complete
              v-model="disabledValue"
              placeholder="禁用状态"
              disabled
              :fetch-suggestions="querySearchAsync"
              listenClickId="ky-auto-complete-content"
            >
            </ky-auto-complete>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">高亮首项</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">默认高亮第一项</view>
            <ky-auto-complete
              v-model="highlightValue"
              :highlight-first-item="true"
              placeholder="自动高亮首个建议"
              :fetch-suggestions="querySearchAsync"
              listenClickId="ky-auto-complete-content"
            >
            </ky-auto-complete>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">边框样式</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">全边框（默认）</view>
            <ky-auto-complete
              v-model="borderAll"
              border="all"
              placeholder="全边框样式"
              :fetch-suggestions="querySearchAsync"
              listenClickId="ky-auto-complete-content"
            >
            </ky-auto-complete>
          </view>
          <view class="input-item">
            <view class="input-label">底部边框</view>
            <ky-auto-complete
              v-model="borderBottom"
              border="bottom"
              placeholder="底部边框样式"
              :fetch-suggestions="querySearchAsync"
              listenClickId="ky-auto-complete-content"
            >
            </ky-auto-complete>
          </view>
          <view class="input-item">
            <view class="input-label">无边框</view>
            <ky-auto-complete
              v-model="borderNone"
              border="none"
              placeholder="无边框样式"
              :fetch-suggestions="querySearchAsync"
              listenClickId="ky-auto-complete-content"
            >
            </ky-auto-complete>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">⚠️</view>
          <view class="card-title">错误状态</view>
        </view>
        <view class="card-body">
          <view class="input-item">
            <view class="input-label">错误样式</view>
            <ky-auto-complete
              v-model="errorValue"
              :is-error="true"
              placeholder="错误状态"
              :fetch-suggestions="querySearchAsync"
              listenClickId="ky-auto-complete-content"
            >
            </ky-auto-complete>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const phoneValue = ref('')
const customValue = ref('')
const debounceValue = ref('')
const disabledValue = ref('')
const highlightValue = ref('')
const loadingValue = ref('')
const borderAll = ref('')
const borderBottom = ref('')
const borderNone = ref('')
const errorValue = ref('')

const phoneList = ref(['17311111111', '17322222222', '17333333333', '17344444444', '13800138000', '13900139000'])

const cityList = ref([
  { name: '北京', pinyin: 'Beijing' },
  { name: '上海', pinyin: 'Shanghai' },
  { name: '广州', pinyin: 'Guangzhou' },
  { name: '深圳', pinyin: 'Shenzhen' },
  { name: '杭州', pinyin: 'Hangzhou' },
  { name: '成都', pinyin: 'Chengdu' },
])

const querySearchAsync = (queryString: string, cb: Function) => {
  if (!queryString) {
    cb([])
    return
  }
  const list = phoneList.value.filter((i) => i.indexOf(queryString) > -1)
  cb(list)
}

const queryCity = (queryString: string, cb: Function) => {
  if (!queryString) {
    cb([])
    return
  }
  const list = cityList.value.filter(
    (item) => item.name.indexOf(queryString) > -1 || item.pinyin.toLowerCase().indexOf(queryString.toLowerCase()) > -1,
  )
  cb(list)
}

const queryWithDelay = (queryString: string, cb: Function) => {
  if (!queryString) {
    cb([])
    return
  }
  setTimeout(() => {
    const list = phoneList.value.filter((i) => i.indexOf(queryString) > -1)
    cb(list)
  }, 1000)
}
</script>

<style lang="scss">
.auto-complete-demo .input-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.auto-complete-demo .input-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.auto-complete-demo .custom-item {
  display: flex;
  align-items: center;
  padding: 20rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.auto-complete-demo .item-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.auto-complete-demo .item-content {
  flex: 1;
}

.auto-complete-demo .item-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.auto-complete-demo .item-pinyin {
  font-size: 22rpx;
  color: #999;
}

.auto-complete-demo .loading-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
}

.auto-complete-demo .loading-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid #f3f3f3;
  border-top: 3rpx solid #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 12rpx;
}

.auto-complete-demo .loading-text {
  font-size: 26rpx;
  color: #999;
}
</style>
