<template>
  <div class="pay-mode">
    <div class="pay-mode-content">
      <KyCell
        data-validate="payMode.payMode"
        :required="true"
        title="付款方式"
        :value="payMode"
        isLink
        label=""
        placeholder="请选择"
      >
      </KyCell>
    </div>
  </div>
</template>
<script setup lang="ts">
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import { ModuleType, PayMode } from '@order-public-sub-public/constants'
import { PayModeType } from '@order-public-sub-public/types'
import { computed } from 'vue'
import { PayModeObj } from '../type'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const payModeData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType.付款方式)
})
const payMode = computed(() => {
  return PayModeObj[payModeData.value?.payMode as PayMode] || ''
})
</script>
<style lang="scss">
@import '../index.scss';
</style>
