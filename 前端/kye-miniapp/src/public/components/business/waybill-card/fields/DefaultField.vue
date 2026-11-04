<template>
  <view class="waybill-card-extra-info">
    <view class="waybill-card-extra-info-label">{{ name }}</view>
    <view class="waybill-card-extra-info-content">
      <text class="black-color mr8">{{ value }}</text>
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

/** 字段值（未知字段兜底：优先从 baseInfo 取，否则从 waybillData 取） */
const value = computed(() => {
  const rawValue = baseInfo.value?.[props.code] ?? props.waybillData?.[props.code]
  return isEmpty(rawValue) ? '--' : rawValue
})
</script>
