<template>
  <div class="address-unfold-ocr-module">
    <!-- 三角标 -->
    <div
      class="arrow-icon"
      :class="{ 'right-style': !addressVisible || rightStyleClass, header__right__btn__three: isShowAddressVisible }"
    ></div>
    <slot name="ocrModule" />
  </div>
</template>

<script setup lang="ts">
import { Address } from '@order-public-sub-public/constants'
import { isAmapApp, isAliPayClient } from '@order-public-sub-public/utils'
import { isWechatEnv } from '@/public/utils'

import { computed } from 'vue'

const props = defineProps({
  addressVisible: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    default: '',
  },
})

const isShowAddressVisible = computed(() => {
  let showContact =
    props.source === Address.SENDER_ADDRESS_BOOK_PAGE || props.source === Address.RECEIVE_ADDRESS_BOOK_PAGE
  return (
    (props.addressVisible && !isAliPayClient && !isAmapApp && !isWechatEnv) ||
    (!props.addressVisible && !(showContact && !isAliPayClient && !isAmapApp && !isWechatEnv))
  )
})

// 特殊场景
const rightStyleClass = computed(() => {
  let showContact =
    props.source === Address.SENDER_ADDRESS_BOOK_PAGE || props.source === Address.RECEIVE_ADDRESS_BOOK_PAGE

  return showContact && !isAliPayClient && !isAmapApp && !isWechatEnv
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
