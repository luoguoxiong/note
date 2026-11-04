import { computed, ref } from 'vue'
import { PayModeDimension, PayModeType } from '@order-public-sub-public/types'
import { ModuleType, PayMode } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const popVisible = ref(false)

export const payMethodList = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['付款方式'])?.payMethodList || []
})

export const getPaymodeItem = (key: PayMode) => {
  return payMethodList.value.find((item) => item.value + '' === key)
}

export const payModeOrderData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['付款方式'])
})
