<template>
  <div :class="classNames">
    <SvgIcon class="left-icon" :name="IconName[type]" />
    <div class="addr-detail-wrap flex-column ml-24">
      <div class="person-and-phone flex items-center">
        <div class="person">{{ waybillInfo.person || '--' }}</div>
        <div v-if="waybillInfo.mobile || waybillInfo.phone" class="phone ml-24">
          {{ waybillInfo.mobile || waybillInfo.phone || '--' }}
        </div>
      </div>
      <span v-if="waybillInfo.customerName" class="company-name mt-8 flex items-center">
        {{ waybillInfo.customerName || '--' }}
      </span>
      <span class="full-address mt-8 flex items-center">{{ getFullAddress(waybillInfo) || '--' }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { Delivery, PickUp } from '@order-public-sub-public/types'

const props = defineProps<{ waybillInfo: PickUp | Delivery; type: 'delivery' | 'pickup' }>()

const classNames = ['flex', 'address-info', props.type === 'delivery' ? 'pb-32 address-info-sender' : '']

const getFullAddress = (waybillInfo: PickUp | Delivery) => {
  const { province, city, district, detailAddress } = waybillInfo || {}
  return (province || '') + (city || '') + (district || '') + (detailAddress || '')
}

const IconName = {
  delivery: 'icon-sender',
  pickup: 'icon-receiver',
}
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
