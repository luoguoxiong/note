<template>
  <div class="ky-waybill-number">
    <div class="content">
      <span class="text"> 运单号</span>
      <span class="num">{{ waybillNumber }}</span>
      <span v-if="showCompanyName && companyName" class="companyName">({{ companyName }})</span>
    </div>
    <div class="left-bg"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

defineProps({
  showCompanyName: {
    type: Boolean,
    default: false,
  },
})

const waybillNumber = piniaStore.order.waybillNumber

// 取消获取Url寄件公司改为获取初始化获取的寄件公司
const companyName = computed(() => {
  const { processCheckResponse } = piniaStore.globalData.preConfigProcess || {}
  const { orderCustomer } = processCheckResponse?.moduleDimension
  return orderCustomer?.customerName || ''
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
