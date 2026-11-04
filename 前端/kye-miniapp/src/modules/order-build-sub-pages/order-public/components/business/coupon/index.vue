<template>
  <div
    class="coupon-container coupon-ellipsis"
    :class="{ disabled: disabled }"
    v-if="visible"
    :type="type"
    :visible="visible"
    v-exposure-report="{
      eventCode: 'exp_express_single_coupon_v1',
    }"
  >
    <KyCell
      :no-bg-disabled="disabled"
      title="优惠券"
      placeholder="请填写"
      @click="handleClick"
      data-validate="coupon"
      :large-value="true"
    >
      <template #value>
        <div class="receiver-item__order-right">
          <SvgIcon name="coupon-icon" class="coupon-icon" v-if="isCanuseCount" />
          <SvgIcon name="coupon-icon-disable" class="coupon-icon" v-else />
          <span :class="contentClass" class="coupon-content-maxwidth">
            {{ showContent }}
          </span>
        </div>
      </template>
    </KyCell>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useData } from './hooks/index'
import useEffect from '@order-public-sub-public/validate'

import { ModuleType } from '@order-public-sub-public/constants/global'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { Module } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

defineProps<Module>()

const router = useRouter()
const { data, showText, visible } = useData() // 业务数据

const { effectBubble } = useEffect()

const isCanuseCount = computed(() => {
  if (data.value?.showTextStatus && [10, 20].includes(data.value?.showTextStatus)) {
    return true
  }
  return false
})

//   showText: '满100元减10元',
//   // 10: '已选优惠券文案',
//   // 20: '您有32张可用的优惠券'
//   // 30: '暂无可用优惠券'
//   // 40: '暂无优惠券'
//   showTextStatus: '10',
//   couponTips: '运单信息已变更，可重新选择优惠券',

const showContent = computed(() => {
  // console.log('优惠券入口文案showText text', showText.value)
  if (showText.value) {
    return showText.value
  }
  return '暂无可用'
})

const contentClass = computed(() => {
  if (isCanuseCount.value) {
    return 'coupon-content'
  }
  return 'coupon-content-disable'
})

const order = computed(() => piniaStore.order.orderState)
const handleClick = async () => {
  router.push({
    path: '/iframe-coupon',
    query: {
      couponCode: order.value?.coupon?.couponCode,
      waybillNumber: order.value?.waybillNumber,
    },
  })
  closeTippy()
}
// 优惠券提示气泡文案
const couponTips = computed(() => data?.value?.couponTips)

watch(
  () => couponTips.value,
  async (val) => {
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
      // 优惠券不展示时不触发
      if (visible.value) {
        await stopCouponTipsEffect(val)
      }
    }
  },
)

/**
 * @description 当提示文案不为空时，触发弹气泡的副作用，触发完立刻停止副作用
 */
const stopCouponTipsEffect = async (couponTips: string) => {
  await effectBubble([
    {
      key: 'coupon',
      passed: false,
      content: couponTips,
      bubbleConfig: {
        placement: 'top-end',
      },
      noNeedErrorColor: true,
    },
  ])
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
