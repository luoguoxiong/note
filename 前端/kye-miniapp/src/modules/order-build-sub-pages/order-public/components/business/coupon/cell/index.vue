<template>
  <div
    class="waybill-item-info-content-cell flex items-center coupon-container coupon-ellipsis"
    v-if="visible"
    :visible="visible"
    :class="gray ? 'item-gray' : ''"
  >
    <div class="flex custom-title">优惠券</div>
    <div class="receiver-item__order-right" @click="handleClick">
      <SvgIcon name="coupon-icon" class="coupon-icon" v-if="isCanuseCount && !gray" />
      <SvgIcon name="coupon-icon-disable" class="coupon-icon" v-else />
      <span :class="contentClass" class="coupon-content-maxwidth">
        {{ showContent }}
      </span>
    </div>
    <div class="flex" @click="handleClick">
      <SvgIcon :name="`${gray ? 'right-arrow-gray' : 'right-arrow'}`"></SvgIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect, watch, nextTick } from 'vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import useEffect from '@order-public-sub-public/validate'

import { ModuleType } from '@order-public-sub-public/constants/global'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { Channel } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const props = defineProps({
  gray: {
    type: Boolean,
  },
  item: {
    type: Object,
  },
})

const router = useRouter()

const couponItem = computed(() => {
  const couponListMap = piniaStore.globalData.estimatedCost?.couponListMap || {}
  return couponListMap[props.item?.waybillNumber]
})
const visible = computed(() => props.item?.dynamicConfig?.coupon?.visible)

const { effectBubble } = useEffect()

// 可点击的状态
const isClick = computed(() => {
  if (couponItem.value?.showTextStatus && [10, 20, 30].includes(couponItem.value?.showTextStatus)) {
    return true
  }
  return false
})
const isCanuseCount = computed(() => {
  if (couponItem.value?.showTextStatus && [10, 20].includes(couponItem.value?.showTextStatus)) {
    return true
  }
  return false
})

const showContent = computed(() => {
  return couponItem?.value?.showText || '暂无优惠券'
})

const contentClass = computed(() => {
  if (isCanuseCount.value) {
    return 'coupon-content'
  }
  return 'coupon-content-disable'
})

const handleClick = () => {
  if (!isClick.value) {
    return
  }
  router.push({
    path: '/iframe-coupon',
    query: {
      couponCode: couponItem.value?.couponCode,
      waybillNumber: props.item?.waybillNumber,
      channel: Channel.批量寄,
    },
  })
  closeTippy()
}
// 优惠券提示气泡文案
const couponTips = computed(() => couponItem?.value?.couponTips)

watch(
  () => couponTips.value,
  (val) => {
    if (val) {
      // 清空优惠券对象
      console.log('清空优惠券对象......')
      piniaStore.order.updateOrderByType({
        type: ModuleType['优惠券'],
        data: {
          couponCode: '',
          showText: '',
        },
      })
    }
  },
)

/**
 * @description 当提示文案不为空时，触发弹气泡的副作用，触发完立刻停止副作用
 */
const stopCouponTipsEffect = watchEffect(async () => {
  if (couponTips.value) {
    nextTick(() => {
      piniaStore.globalData.clearBatchCouponTips({})
    })
    await effectBubble([
      {
        key: 'coupon',
        passed: false,
        content: couponTips.value,
        bubbleConfig: {
          placement: 'top-end',
        },
        noNeedErrorColor: true,
      },
    ])
    stopCouponTipsEffect()
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
