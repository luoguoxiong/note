<template>
  <view v-if="show" class="waybill-card-extra-info">
    <view class="waybill-card-extra-info-label">{{ routeStepDesc }}：</view>
    <view class="waybill-card-extra-info-content">
      <text class="black-color mr8">{{ routeDescription }}</text>
      <TimeTagsField v-if="showTags" :waybillData="waybillData" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TimeTagsField from './TimeTagsField.vue'
import { isFieldVisible } from './visibility'
import type { FieldProps } from './types'

interface Props extends FieldProps {}

const props = defineProps<Props>()

const newExteriorRouteInfo = computed(() => props.waybillData?.newExteriorRouteInfo)

/** 是否显示（仅在待揽件/待签收且有路由信息时显示） */
const show = computed(() => isFieldVisible(props.code, props.waybillData))

/** 路由状态描述 */
const routeStepDesc = computed(() => {
  return newExteriorRouteInfo.value?.routeStepDesc || '--'
})

/** 路由描述 */
const routeDescription = computed(() => {
  return newExteriorRouteInfo.value?.routeDescription || '--'
})
</script>
