<template>
  <view class="waybill-card-extra-info">
    <view class="waybill-card-extra-info-label">回单服务：</view>
    <view class="waybill-card-extra-info-content">
      <view
        v-if="isUrgent"
        class="receipt-urgent-tag"
      >
        <image class="receipt-urgent-icon" src="https://ic-img.ky-express.com/netc/20260708_66246_!!1783483209722_36_44.png" />
        <text class="receipt-urgent-text">加急</text>
      </view>
      <text class="black-color mr8">{{ displayValue }}</text>
      <TimeTagsField v-if="showTags" :waybillData="waybillData" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isEmpty } from '@/public/utils/tools'
import TimeTagsField from './TimeTagsField.vue'
import type { FieldProps } from './types'

interface Props extends FieldProps {}

const props = defineProps<Props>()

const baseInfo = computed(() => props.waybillData?.waybill?.baseInfo)

const isUrgent = computed(() => {
  return baseInfo.value?.receiptFlagUrgentState
})

const displayValue = computed(() => {
  const value = baseInfo.value?.receiptFlagDesc
  if (isEmpty(value)) return '--'
  return value
})
</script>

<style lang="scss">
.receipt-urgent-tag {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  height: 34px;
  padding: 0 8px;
  margin-right: 8px;
  border-radius: 4px;
  background: #FFF3E5;
  color: #F57200;

  .receipt-urgent-icon {
    width: 18px;
    height: 22px;
    flex-shrink: 0;
    margin-right: 4px;
  }

  .receipt-urgent-text {
    font-size: 24px;
    line-height: 34px;
  }
}
</style>
