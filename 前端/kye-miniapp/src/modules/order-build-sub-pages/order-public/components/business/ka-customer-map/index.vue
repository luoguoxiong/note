<template>
  <div class="ka-customer-map row-item" v-if="isVisible" :type="type" :visible="visible">
    <div
      class="cell-content"
      v-exposure-report="{
        eventCode: 'exp_express_single_custom_coding_v1',
      }"
    >
      <div v-if="allEncodeSelect && encodeSelect">
        <OrderNumber :disabled="disabled" :encodeSelect="encodeSelect" showType="page"></OrderNumber>
      </div>
      <KyCell
        v-else
        :no-bg-disabled="disabled"
        id="kaCustomerMap_customerFieldValue"
        data-validate="kaCustomerMap.customerFieldValue"
        :required="isRequired"
        :title="kaCustomerMapData?.fieldView || '自定义编码'"
        :value="kaCustomerMapValue"
        @click="clickHandel"
        placeholder="请填写"
      >
      </KyCell>
    </div>
  </div>
</template>

<script setup lang="ts">
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import OrderNumber from './page/custom-encode/components/order-number/index.vue'
import { KaCustomerMapDimension, KaCustomerMap, Module } from '@order-public-sub-public/types'
import { computed, watchEffect, ref, watch } from 'vue'
import { ModuleType } from '@order-public-sub-public/constants'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { initKaCustomerMap } from '@order-public-sub-public/components/business/ka-customer-map/hooks/useReset'
import { clkCustomer } from '@order-public-sub-public/components/business/ka-customer-map/report'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const router = useRouter()

const kaCustomerMapValue = ref('')

const props = defineProps<Module>()

const kaCustomerMapData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['自定义编码'])
})

const kaCustomerMapOrderData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['自定义编码'])
})

const encodeSelect = computed(() =>
  piniaStore.extend.kaCustomerMap?.find((x) => x.styleType === '20' && x.kyField === '50'),
)
// 判断全部是 50 不需要跳界面, 直接展示企业的popup
const allEncodeSelect = computed(
  () =>
    kaCustomerMapData.value?.rows?.length &&
    kaCustomerMapData.value?.rows?.filter((x) => x.styleType === '20' && x.kyField === '50')?.length ===
      kaCustomerMapData.value?.rows?.length,
)

const isVisible = computed(() => {
  return kaCustomerMapData.value?.rows?.length || false
})

const isRequired = computed(() => {
  return piniaStore.extend.kaCustomerMapStatus
})

watchEffect(() => {
  if (!kaCustomerMapOrderData?.value.length) {
    kaCustomerMapValue.value = ''
  } else {
    let isValue = false
    for (let i = 0; i < kaCustomerMapOrderData?.value.length; i++) {
      const curData = kaCustomerMapOrderData?.value[i]
      if (curData.customerFieldValue) {
        isValue = true
        break
      }
    }
    kaCustomerMapValue.value = isValue ? '已填写' : ''
  }
})
watch(
  () => kaCustomerMapData.value?.rows,
  (val) => {
    if (val?.length) {
      initKaCustomerMap()
    }
  },
)
const clickHandel = () => {
  clkCustomer()
  initKaCustomerMap()
  router.push({
    path: '/custom-encode',
  })
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
