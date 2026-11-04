<template>
  <div
    class="coupon-poper"
    v-if="couponShow && !isAudit && !showEstimatedCostModal"
    @click="handleClick"
    v-click-report="{
      eventCode: 'clk_express_single_use_coupon_popup_v1',
    }"
    v-exposure-report="{
      eventCode: 'exp_express_single_use_coupon_popup_v1',
    }"
  >
    <div class="jsf_right_text">
      您有<span class="jsf_right_count">{{ count }}</span
      >张优惠券可用 <SvgIcon :name="'right-arrow-warn2'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { computed } from 'vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'

// showEstimatedCostModal 有费用弹框也要隐藏优惠券气泡
import { showBatchFeeTipsStroe, showEstimatedCostModal } from '../../hooks/data'
import { couponShowFlag } from '../../hooks/useExpose'
import { Channel, ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { Coupon, CouponDimension } from '@order-public-sub-public/types'
import { useData } from '@order-public-sub-public/components/business/coupon/hooks'
import { getChannel } from '@order-public-sub-public/configs'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const router = useRouter()
const orderPageType = piniaStore.root.getOrderPageType
const { visible } = useData()
const couponShow = computed(() => {
  return (
    orderPageType === OrderPageType.单票 &&
    !!count.value &&
    !couponObj.value.couponCode &&
    !showBatchFeeTipsStroe.value &&
    couponShowFlag.value &&
    visible.value
  )
})

const isAudit = computed(() => {
  const channel = getChannel()
  return [Channel.运单审核, Channel.调价审核].includes(channel)
})

const count = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['优惠券'])?.usableCount)
const couponObj = computed(() => piniaStore.order.moduleFormData(ModuleType.优惠券))
const waybillNumber = computed(() => piniaStore.order.waybillNumber)
const handleClick = () => {
  router.push({
    path: '/iframe-coupon',
    query: {
      couponCode: couponObj.value?.couponCode,
      waybillNumber: waybillNumber.value,
    },
  })
}
defineOptions({
  name: 'CouponPoper',
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
