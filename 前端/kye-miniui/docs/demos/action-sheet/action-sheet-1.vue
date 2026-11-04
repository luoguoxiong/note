<template>
  <view class="action-sheet-demo demo-container">
    <view class="demo-header">
      <view class="header-title">ActionSheet 动作面板</view>
      <view class="header-subtitle">底部弹出的动作菜单面板</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📋</view>
          <view class="card-title">基础用法</view>
        </view>
        <view class="card-body">
          <ky-button type="primary" @click="showBasic = true">显示基础面板</ky-button>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">选项状态</view>
        </view>
        <view class="card-body">
          <ky-button type="primary" @click="showStatus = true">显示状态面板</ky-button>
          <view class="result-tip">已选择：{{ selectedItem }}</view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📝</view>
          <view class="card-title">自定义信息</view>
        </view>
        <view class="card-body">
          <ky-button type="primary" @click="showCustom = true">显示自定义面板</ky-button>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">自定义内容</view>
        </view>
        <view class="card-body">
          <ky-button type="primary" @click="showSlot = true">显示插槽面板</ky-button>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">自定义选项</view>
        </view>
        <view class="card-body">
          <ky-button type="primary" @click="showItemSlot = true">显示自定义选项</ky-button>
        </view>
      </view>
    </view>

    <ky-action-sheet
      v-model:show="showBasic"
      :menu-items="basicItems"
      @choose="onChoose"
      @cancel="onCancel"
    ></ky-action-sheet>

    <ky-action-sheet v-model:show="showStatus" :menu-items="statusItems" @choose="onChooseStatus"></ky-action-sheet>

    <ky-action-sheet
      v-model:show="showCustom"
      title="操作提示"
      description="请选择您要执行的操作"
      cancel-txt="取消操作"
      :menu-items="basicItems"
      @choose="onChoose"
    ></ky-action-sheet>

    <ky-action-sheet v-model:show="showSlot" title="自定义内容" @cancel="showSlot = false">
      <view class="custom-content">
        <view class="custom-item">自定义列表项一</view>
        <view class="custom-item">自定义列表项二</view>
        <view class="custom-item">自定义列表项三</view>
      </view>
    </ky-action-sheet>

    <ky-action-sheet v-model:show="showItemSlot" title="自定义选项" :menu-items="basicItems" @choose="onChoose">
      <template #item="{ item, index }">
        <view class="custom-item-slot">
          <text class="item-index">{{ index + 1 }}.</text>
          <text class="item-name">{{ item.name }}</text>
        </view>
      </template>
    </ky-action-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const showBasic = ref(false)
const showStatus = ref(false)
const showCustom = ref(false)
const showSlot = ref(false)
const showItemSlot = ref(false)
const selectedItem = ref('')

const basicItems = [{ name: '操作一' }, { name: '操作二' }, { name: '操作三' }]

const statusItems = [{ name: '正常选项' }, { name: '禁用选项', disable: true }, { name: '高亮选项', color: '#FF706D' }]

const onChoose = (item: any) => {
  console.log('选择:', item.name)
}

const onChooseStatus = (item: any) => {
  if (!item.disable) {
    selectedItem.value = item.name
  }
}

const onCancel = () => {
  console.log('取消')
}
</script>

<style lang="scss">
.action-sheet-demo .result-tip {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #666;
  padding-left: 8rpx;
}

.action-sheet-demo .custom-content {
  padding: 20rpx 0;
}

.action-sheet-demo .custom-item {
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.action-sheet-demo .custom-item-slot {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
}

.action-sheet-demo .item-index {
  font-size: 26rpx;
  color: #999;
  margin-right: 12rpx;
}

.action-sheet-demo .item-name {
  font-size: 28rpx;
  color: #333;
}
</style>
