<template>
  <view class="waybill-card-extra-info">
    <view class="waybill-card-extra-info-label">计费重量/方数：</view>
    <view class="waybill-card-extra-info-content">
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

const displayValue = computed(() => {
  const value = baseInfo.value?.freightWeight
  if (isEmpty(value)) return '--'
  return value
})
</script>
