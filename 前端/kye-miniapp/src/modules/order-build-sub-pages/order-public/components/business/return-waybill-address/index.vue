<template>
  <div class="return-waybill-address" v-if="visible">
    <img class="img" :src="returnBanner" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const returnBanner = 'https://ic-img.ky-express.com/netc/20250619_72931_!!1750314560764_1500_444.png'

const isReturnSend = computed(() => {
  const orderPageType = piniaStore.root.getOrderPageType
  return orderPageType === OrderPageType.返程单
})

const visible = computed(() => {
  return isReturnSend.value
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
