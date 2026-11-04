<template>
  <template v-if="isApproveTips">
    <view class="id-card-page-edit__tips">
      编辑个人名片信息后需由上级领导或总经办进行工单审批，审批通过后将更新展示最新名片信息
    </view>
  </template>

  <template v-if="isPaddingOrReject">
    <view class="id-card-page-edit__apply-content">
      <view class="item">
        <text class="label">审批状态</text>
        <image :src="statusTargetImg" class="status-img" />
      </view>
      <view v-if="isReject" class="item border-top">
        <text class="label">原因</text>
        <text class="rejectReason">{{ rejectReasonText }}</text>
      </view>
    </view>
  </template>

  <view v-if="isPaddingOrReject" class="id-card-page-edit__gray-line"></view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { lastModifyWorkOrderStatusMap } from '@/packages/idcard/const/index'

const props = defineProps({
  detail: {
    type: Object,
    default: () => {},
  },
})

const isPadding = computed(() => {
  return +props.detail?.lastModifyWorkOrderStatus === lastModifyWorkOrderStatusMap.padding
})

const statusTargetImg = computed(() => {
  return isPadding.value
    ? 'https://ic-img.ky-express.com/netc/20250225_50166301120_!!1740455003699_176_68.png'
    : 'https://ic-img.ky-express.com/netc/20250225_56666301164_!!1740454993614_176_68.png'
})

const isApproveTips = computed(() => {
  return props.detail?.approveTips
})

const isPaddingOrReject = computed(() => {
  return [lastModifyWorkOrderStatusMap.padding, lastModifyWorkOrderStatusMap.reject].includes(
    props.detail?.lastModifyWorkOrderStatus,
  )
})

const isReject = computed(() => {
  return +props.detail?.lastModifyWorkOrderStatus === lastModifyWorkOrderStatusMap.reject
})

const rejectReasonText = computed(() => {
  return props.detail?.rejectReason
})
</script>

<style lang="scss">
@import './index.scss';
</style>
