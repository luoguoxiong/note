<template>
  <div class="batch-order-customer">
    <OrderCustomer v-bind="orderCustomerModuleData"></OrderCustomer>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@order-public-sub-public/store'
import OrderCustomer from '../../order-customer/index.vue'
import { ModuleType } from '@order-public-sub-public/constants'

const orderCustomerModuleData = piniaStore.schema.moduleConfigData(ModuleType['下单公司'], true)
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
.batch-order-customer {
  min-height: 1px;
}
</style>
