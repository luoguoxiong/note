<template>
  <AdvertiseFloatPanel
    :is-hide="isHide"
    :data="data"
    :topLimit="topLimit"
    :expQt="{
      event_code: 'exp_homepage_advertising_space_v1',
      page_code: 'page_homepage_v1',
      region_code: 'advertising_space',
      region_name: '侧边广告位',
      event_name: '移动端新版首页_侧边广告位_入口曝光',
    }"
    :clkQt="{
      event_code: 'clk_homepage_advertising_space_button_v1',
      page_code: 'page_homepage_v1',
      region_code: 'advertising_space',
      event_name: '点击移动端新版首页-侧边广告位_点击',
      region_name: '侧边广告位',
    }"
  >
  </AdvertiseFloatPanel>
</template>

<script setup lang="ts">
import { AdvertiseFloatPanel } from '@/public/components/business/advertise-center'
import { IdetailList } from '@/public/components/business/advertise-center/type'

defineProps<{
  data?: IdetailList[]
  isHide?: boolean
  topLimit: number
}>()
</script>
