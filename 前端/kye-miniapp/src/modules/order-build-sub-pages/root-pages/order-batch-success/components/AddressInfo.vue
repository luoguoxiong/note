<template>
  <div :class="classNames">
    <span class="city">{{ waybillInfo.city }}</span>
    <div class="person my-16 w-full" :data-type="type">{{ waybillInfo.person }}</div>
    <div class="address-detail w-full">{{ waybillInfo.customerName || '- -' }}</div>
  </div>
</template>
<script setup lang="ts">
import { Delivery, PickUp } from '@order-public-sub-public/types'

const props = defineProps<{ waybillInfo: PickUp | Delivery; type: 'delivery' | 'pickup' }>()

const classNames = ['flex-column', 'address', props.type === 'pickup' ? 'items-end' : '']
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
