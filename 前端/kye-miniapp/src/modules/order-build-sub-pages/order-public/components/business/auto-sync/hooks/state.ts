import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'

import { BehaviorOption } from '@order-public-sub-public/types'
import useEffect from '@order-public-sub-public/validate'
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
export const { remoteCheck } = useEffect()

export const behaviorOptionOrderInfo = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['操作状态'])
})

export const dynamicConfig = computed(() => {
  return piniaStore.globalData.dynamicConfig('behaviorOption') || {}
})

export const orderPageType = computed(() => {
  return piniaStore.root.getOrderPageType
})

export const visible = computed(() => {
  return dynamicConfig.value?.syncReceive?.visible && orderPageType.value === OrderPageType.返程单
})

export const isChecked = computed({
  get: () => {
    return behaviorOptionOrderInfo.value?.syncReceiveFlag || false
  },
  set: (val) => {
    piniaStore.order.updateOrderByType({
      type: ModuleType['操作状态'],
      data: {
        syncReceiveFlag: val,
      },
    })
    remoteCheck('behaviorOption.syncReceiveFlag')
  },
})
