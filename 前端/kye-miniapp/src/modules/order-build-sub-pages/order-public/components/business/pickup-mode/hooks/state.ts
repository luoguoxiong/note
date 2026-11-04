import { ModuleType } from '@order-public-sub-public/constants'

import {
  Module,
  PickupMode,
  PickupModeTypeDimension,
  PickupType,
  PickupTypeConfig,
} from '@order-public-sub-public/types'
import { computed, ref } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
export const pickupMpdeLabelMap = {
  [PickupType.上门取件]: '上门取件',
  [PickupType.服务点自寄]: '服务点自寄',
}

export const visible = ref(false)

export const configData = computed(() => piniaStore.schema.moduleConfigData(ModuleType['寄件方式'], true))

export const moduleDemensionData = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['寄件方式']))

export const orderFormData = computed(() => piniaStore.order.moduleFormData(ModuleType.寄件方式))
export const selfDeliveryInfo = computed(() => orderFormData.value?.selfDeliveryInfo)

export const title = computed(() => {
  return (configData.value.config as PickupTypeConfig)?.alias || '寄件方式'
})

export const required = computed(() => configData.value.required)

// 提示信息: 在选择列表中取
export const warningText = computed(() => {
  const pickupMode = orderFormData.value?.pickupMode
  if (!pickupMode) return ''
  const pickupModeList = moduleDemensionData.value?.pickupModeList
  const curTip = pickupModeList?.find((item) => item.type === pickupMode)
  return curTip?.tip || ''
})
