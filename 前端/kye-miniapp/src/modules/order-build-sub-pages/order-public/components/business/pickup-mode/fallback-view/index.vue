<template>
  <div class="pickup-mode-content">
    <KyCell :value="pickupMode" label="" :title="title" :required="required" placeholder="请选择"> </KyCell>
  </div>
</template>
<script setup lang="ts">
import { ModuleType } from '@order-public-sub-public/constants'
import { PickupMode } from '@order-public-sub-public/types'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

import { computed } from 'vue'
import { pickupMpdeLabelMap, title, required } from '../hooks/state'

const orderFormData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['寄件方式'])
})

// 取/存
const pickupMode = computed(() => {
  const type = orderFormData.value?.pickupMode
  if (!type) return ''
  return pickupMpdeLabelMap[type] || ''
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../popup/index.scss';
</style>
