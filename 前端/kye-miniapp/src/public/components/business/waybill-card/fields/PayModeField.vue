<template>
  <view v-if="displayValue || showTags" class="waybill-card-extra-info">
    <template v-if="displayValue">
      <view class="waybill-card-extra-info-label">付款方式：</view>
      <view class="waybill-card-extra-info-content">
        <text class="black-color">{{ displayValue }}</text>
      </view>
    </template>
    <TimeTagsField v-if="showTags" :waybillData="waybillData" />
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

/** 空值隐藏整行（区别于通用字段的 -- 占位）；加密值(***)由后端下发直接展示 */
const displayValue = computed(() => {
  const value = baseInfo.value?.payModeText
  if (isEmpty(value)) return ''
  return value
})
</script>
