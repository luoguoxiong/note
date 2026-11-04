<template>
  <!-- 卡片组件容器 -->
  <view class="card">
    <!-- 卡片头部区域 -->
    <view class="card-header">
      <!-- 左侧内容 -->
      <view class="card-left">
        <!-- 卡片标题 -->
        <view class="card-title">{{ title }}</view>
        <!-- 审核状态标签（仅在需要显示时展示） -->
        <template v-if="shouldShowApplyStatus">
          <view class="tag" :class="{ error: isApplyRejected }">
            {{ isApplyRejected ? '不通过' : '审核中' }}
          </view>
        </template>
        <!-- 提示图标（编辑模式且显示提示时展示） -->
        <image
          v-if="isEdit && showTips"
          class="card-tips"
          @tap="handleShowTip"
          src="https://ic-img.ky-express.com/netc/20250308_93570395143_!!1741415486502_64_64.png"
        />
        <!-- 开关组件（编辑模式且配置了开关时展示） -->
        <view v-if="isEdit && editTools?.switch" class="view-margin card-title-tswitch">
          <ky-switch :model-value="isOpen" inactive-color="#ebedf5" active-color="#8365F6" @change="onSwitch" />
        </view>
      </view>
      <!-- 右侧操作按钮区域 -->
      <view class="card-right">
        <template v-if="isEdit">
          <!-- 上传按钮（编辑模式且配置了上传按钮时展示） -->
          <view
            v-if="editTools?.hasUploadtBtn"
            class="card-btn"
            :class="{ disabled: editTools?.uploadBtnDisabled }"
            @tap="onUpload"
          >
            <image :src="updateImg" />
            上传
          </view>

          <!-- 编辑按钮（编辑模式且配置了编辑按钮时展示） -->
          <view v-if="editTools?.hasEditBtn" class="card-btn" @tap="onEdit">
            <image src="https://ic-img.ky-express.com/netc/20250125_4447039519_!!1737788263616_56_56.png" />
            编辑
          </view>
          <!-- 上移按钮（编辑模式且配置了移动按钮时展示，第一个元素禁用） -->
          <view
            v-if="editTools?.hasMoveBtn"
            class="card-btn"
            :class="{ disabled: isFirst }"
            @tap="!isFirst && onMove(1)"
          >
            上移
          </view>
          <!-- 下移按钮（编辑模式且配置了移动按钮时展示，最后一个元素禁用） -->
          <view
            v-if="editTools?.hasMoveBtn"
            class="card-btn"
            :class="{ disabled: isLast }"
            @tap="!isLast && onMove(-1)"
          >
            下移
          </view>
        </template>
        <template v-if="!isEdit">
          <slot name="prefix" />
        </template>
      </view>
    </view>
    <view v-if="isOpen" class="card-wrap" :style="hiddenWrapPadding ? { paddingTop: '0rpx' } : {}">
      <view v-if="isLoading" class="card-loading">
        <IdcardLoading text="加载中..." />
      </view>
      <view v-else-if="isEmpty" class="card-empty">暂无内容</view>
      <slot v-else />
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed, watch, ref } from 'vue'
import type { CardProps } from './types.ts'
import IdcardLoading from '../idcard-loading/index.vue'

const props = withDefaults(defineProps<CardProps>(), {
  title: '',
  isEdit: false,
  isLoading: false,
  isOpen: false,
  isFirst: false,
  isLast: false,
  isEmpty: false,
  showTips: false,
  showApplayStatus: false,
  applyStatus: '',
  hiddenWrapPadding: false,
  editTools: null,
})

const emits = defineEmits(['switch', 'upload', 'edit', 'move'])

const handleShowTip = () => {
  console.log('点击提醒弹窗')
  Taro.showModal({
    title: '温馨提示',
    content: '支持上传小于50M的视频，上传后需由总经办进行工单审批，审批通过后将展示最新信息',
    showCancel: false,
    confirmColor: '#8365F6',
    confirmText: '我知道了',
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定')
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    },
  })
}

const updateImg = computed(() => {
  return props.editTools?.uploadBtnDisabled
    ? 'https://ic-img.ky-express.com/netc/20250308_39370395181_!!1741415105666_56_56.png'
    : 'https://ic-img.ky-express.com/netc/20250308_89470395128_!!1741415102417_56_56.png'
})

const shouldShowApplyStatus = computed(() => props?.showApplayStatus && props?.isEdit)

const isApplyRejected = computed(() => +props?.applyStatus === 3)

const onSwitch = (e) => emits('switch', e)
const onUpload = () => emits('upload')
const onEdit = () => emits('edit')
const onMove = (direction: number) => emits('move', direction)
</script>

<style lang="scss">
@import './index.scss';
</style>
