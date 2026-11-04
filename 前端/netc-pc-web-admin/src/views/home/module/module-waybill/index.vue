<template>
  <Content v-if="showLogistics || showBusiness" :to-refresh="toRefresh" :is-loading="homeStatus.businessLoading">
    <template v-slot:logstics>
      <LogsticsOverview v-if="showLogistics"></LogsticsOverview>
    </template>
    <template v-slot:business>
      <BusinessOverview v-if="showBusiness"></BusinessOverview>
    </template>
  </Content>
</template>
<script setup lang="ts">
import Content from './content/index.vue'
import LogsticsOverview from './logstics-overview/index.vue'
import BusinessOverview from './business-overview/index.vue'
import { useHomeStore } from '@/hooks'

const { store, homeStatus, showLogistics, showBusiness } = useHomeStore()

const toRefresh = () => {
  void store.refreshOverview()
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_waybill_refresh_v1',
    },
    {
      region_code: 'waybill_overview',
    }
  )
}
</script>
