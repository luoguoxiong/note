<template>
  <div class="tip-content-main">
    <div class="tip-content" v-if="showWarningText">{{ warningText }}</div>
    <div @click.stop class="self-delivery-info content-main" v-if="showSelfDeliveryInfo">
      <div class="title"><span>服务点地址</span><span v-copy="onCopy()" class="copy-info"> 复制信息 </span></div>
      <div class="line address" v-if="selfDeliveryInfo?.dispatchCustomerDeliveryAddr">
        {{ selfDeliveryInfo.dispatchCustomerDeliveryAddr }}
      </div>
      <div class="line user-info">
        <span>联系信息：</span>
        <span>{{ selfDeliveryInfo?.dispatchDriverName }}</span>
        <span class="mobile">{{ selfDeliveryInfo?.dispatchDriverMobile }}</span>
      </div>
      <div class="line time">
        <span>约定送达时间：</span>
        <span>{{ selfDeliveryInfo?.customerPickGoodsTime }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import vCopy from '@order-public-sub-public/directives/copy'
import {
  warningText,
  orderFormData,
  selfDeliveryInfo,
} from '@order-public-sub-public/components/business/pickup-mode/hooks/state'
import { computed } from 'vue'
import { PickupType } from '@order-public-sub-public/types'

/**
 * 优先级:
 *  1. selfDeliveryInfo 修改运单-服务点自寄信息
 *  2. warningText 自寄提示
 */
const showWarningText = computed(() => {
  return warningText.value && !orderFormData.value.selfDeliveryInfo?.dispatchCustomerDeliveryAddr
})

const showSelfDeliveryInfo = computed(() => {
  return (
    orderFormData.value?.pickupMode === PickupType.服务点自寄 &&
    orderFormData.value.selfDeliveryInfo?.dispatchCustomerDeliveryAddr
  )
})

const onCopy = () => {
  const copyText = `
${selfDeliveryInfo.value?.dispatchCustomerDeliveryAddr}
${selfDeliveryInfo.value?.dispatchDriverName}
${selfDeliveryInfo.value?.dispatchDriverMobile}
${selfDeliveryInfo.value?.customerPickGoodsTime}
  `
  return copyText
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
