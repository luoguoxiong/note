<template>
  <view
    style="position: relative"
    :id="id"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_waybill_todo_list_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        event_name: '移动端新版首页_待办区域_曝光',
        region_code: 'waybill_todo_list',
        region_name: '待办事项',
        access_name: name,
      },
    }"
  >
    <slot></slot>
  </view>
</template>
<script lang="ts" setup>
import { useExposureReport } from '@/public/hooks/useExposureReport'

const props = defineProps<{
  name: string
  index: string
}>()

const id = `tab-${props.index}-exp`

useExposureReport([id])
</script>
