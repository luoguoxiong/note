<template>
  <div class="order-waybill-number-block">
    <WaybillNumber v-if="isScan && !currentRoute" :showCompanyName="showCompanyName" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '@order-public-sub-public/vue-router/index'
import { useStore } from '@order-public-sub-public/store'
import WaybillNumber from '@order-public-sub-public/components/base/ky-waybill-number/index.vue'
import { Channel, OrderConfigType, OrderPageType } from '@order-public-sub-public/constants'
import { computed, watchEffect, ref } from 'vue'
const piniaStore = useStore()

const isScan = ref(false)
const waybillNumber = computed(() => {
  return piniaStore.order.waybillNumber
})
const router = useRoute()
watchEffect(() => {
  const query = router.query
  const channel = query.channel as Channel
  if (channel === Channel.扫二维码下单 && waybillNumber.value) {
    isScan.value = true
  }
})

const orderPageType = computed(() => piniaStore.root.getOrderPageType)
const currentRoute = computed(() => {
  return orderPageType.value === OrderPageType.返程单
})

const showCompanyName = computed(() => {
  // 如果配置消息展示下单公司，就不展示运单号上显示的公司名称
  const bindCustomerCodeFlag = piniaStore.extend.orderCustomer.bindCustomerCodeFlag
  const checkData = piniaStore.schema.getSchemaOrderConfig(OrderConfigType['切换客户编码']) as boolean
  return !(checkData && bindCustomerCodeFlag)
})
</script>

<style lang="scss">
.order-waybill-number-block {
  background: #f1f2f7;
  margin-right: -24px;
  margin-left: -24px;
}
</style>
