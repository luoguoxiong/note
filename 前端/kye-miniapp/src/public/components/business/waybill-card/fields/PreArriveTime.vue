<template>
  <view v-if="show" class="waybill-card-extra-status mt-8">
    <view>预计派送时间：</view>
    <text class="black-color mr8">{{ finalAging }}</text>
    <ky-tag
      v-if="showFinalAgingChange"
      size="3"
      bgColor="#f0fff7"
      borderColor="#7DE3B7"
      textColor="#00c58c"
    >
      已改派送时间
    </ky-tag>
    <TimeTagsField v-if="showTags" :waybillData="waybillData" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatTime } from '@/public/utils'
import dayjs from 'dayjs'
import TimeTagsField from './TimeTagsField.vue'
import { isFieldVisible } from './visibility'
import type { FieldProps } from './types'

interface Props extends FieldProps {}

const props = defineProps<Props>()

const baseInfo = computed(() => props.waybillData?.waybill?.baseInfo)
const functionInfo = computed(() => props.waybillData?.functionInfo)

/** 是否显示（只有待签收状态显示） */
const show = computed(() => isFieldVisible(props.code, props.waybillData))

/** 预计派送时间 */
const finalAging = computed(() => {
  if (!baseInfo.value?.finalAging) return '--'
  return formatTime(dayjs(baseInfo.value.finalAging).valueOf())
})

/** 是否显示已改派送时间标签 */
const showFinalAgingChange = computed(() => {
  return functionInfo.value?.finalAgingChangeFlag?.showStatus
})
</script>
