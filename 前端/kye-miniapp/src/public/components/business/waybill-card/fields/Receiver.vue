<template>
  <view v-if="show" class="waybill-card-extra-status mt-8">
    <view>签收人：</view>
    <text class="black-color mr8">{{ receiver }}</text>
    <TimeTagsField v-if="showTags" :waybillData="waybillData" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TimeTagsField from './TimeTagsField.vue'
import { isFieldVisible } from './visibility'
import type { FieldProps } from './types'

interface Props extends FieldProps {}

const props = defineProps<Props>()

const baseInfo = computed(() => props.waybillData?.waybill?.baseInfo)

/** 是否显示（只有已签收状态显示） */
const show = computed(() => isFieldVisible(props.code, props.waybillData))

/** 签收人 */
const receiver = computed(() => {
  return baseInfo.value?.receiver || '--'
})
</script>
