<template>
  <div class="clearance-warehouse-tip" v-if="restrictData">
    <div class="msg" v-if="addedServiceSendShowTips">
      <SvgIcon name="dollar-reminder-line" />
      <span class="info" v-html="addedServiceSendShowTips"></span>
    </div>
    <div class="msg" v-if="addedServiceEndShowTips">
      <SvgIcon name="dollar-reminder-line" />
      <span class="info" v-html="addedServiceEndShowTips"></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

const restrictData = computed(() => {
  const restrictStoreData = piniaStore.globalData.restrictData?.clearanceWarehouse
  return restrictStoreData
})

// 入仓、入展提醒
const addedServiceSendShowTips = computed(() => {
  return restrictData.value?.addedServiceSendShowTips || ''
})

// 出仓、出展提醒
const addedServiceEndShowTips = computed(() => {
  return restrictData.value?.addedServiceEndShowTips || ''
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
