<template>
  <div
    :class="`detail-address-tips ${moduleStyle ? '' : `${props.type}-detail-address-tips`}`"
    v-if="checkResultListTipsPrompt"
    v-html="checkResultListTipsPrompt"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  moduleStyle: {
    type: String,
    default: '',
  },
})

const checkResultListTipsPrompt = computed(() => {
  if (!props.type) return ''

  let result = ''
  const orderPageType = piniaStore.root.getOrderPageType

  const checkResultList =
    orderPageType === OrderPageType.批量寄
      ? piniaStore.order.batchCommonWaybill.checkResultList
      : piniaStore.globalData.checkResultList
  if (checkResultList && checkResultList.length > 0) {
    checkResultList.forEach((item) => {
      if (item.key === `${props.type}.address` && item.showType === 2) {
        result = item.content
      }
    })
  }
  return result
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
