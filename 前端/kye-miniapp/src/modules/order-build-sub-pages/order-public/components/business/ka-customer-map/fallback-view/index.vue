<template>
  <div class="fallback-view-ka-customer-map" v-if="isVisible">
    <div class="cell-content">
      <div v-if="allEncodeSelect && encodeSelect">
        <OrderNumber :disabled="disabled" :encodeSelect="encodeSelect" showType="page"></OrderNumber>
      </div>
      <KyCell
        v-else
        :required="required"
        :title="kaCustomerMapData?.fieldView || '自定义编码'"
        :value="kaCustomerMapValue"
        placeholder="请填写"
      >
      </KyCell>
    </div>
  </div>
</template>

<script setup lang="ts">
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import OrderNumber from '../page/custom-encode/components/order-number/index.vue'
import { KaCustomerMapDimension, KaCustomerMap, Module } from '@order-public-sub-public/types'
import { computed } from 'vue'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface kaCustomerProps extends Module {
  moduleDimension: KaCustomerMapDimension
}
const props = defineProps<kaCustomerProps>()

const kaCustomerMapData = computed(() => {
  return props?.moduleDimension
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
  console.log('121212121', kaCustomerMapData.value?.rows?.length)
  return kaCustomerMapData.value?.rows?.length || false
})

const isRequired = computed(() => {
  return piniaStore.extend.kaCustomerMapStatus
})

const kaCustomerMapValue = computed(() => {
  if (!kaCustomerMapOrderData?.value.length) {
    return ''
  } else {
    let isValue = false
    for (let i = 0; i < kaCustomerMapOrderData?.value.length; i++) {
      const curData = kaCustomerMapOrderData?.value[i]
      if (curData.customerFieldValue) {
        isValue = true
        break
      }
    }
    return isValue ? '已填写' : ''
  }
})
</script>
