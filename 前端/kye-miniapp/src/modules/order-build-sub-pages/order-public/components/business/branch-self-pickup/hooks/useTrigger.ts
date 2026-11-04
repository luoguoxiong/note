import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

import { resetOptionsStatus } from '.'
import { computed } from 'vue'

export const useTrigger = () => {
  const onTriggerBySender = () => {
    const orderPageType = computed(() => piniaStore.root.getOrderPageType)

    console.log(`收方信息改变了，网点自提需要清空内容！`)
    const params = {
      selfPickupMobile: '',
      selfPickBranchId: '',
      selfPickBranchName: '',
    }
    piniaStore.order.updateOrderByType({
      type: ModuleType['网点自提'],
      data: params,
      orderPageType: orderPageType.value,
    })
    // 清空组件内状态
    resetOptionsStatus()
  }

  return {
    onTriggerBySender,
  }
}
