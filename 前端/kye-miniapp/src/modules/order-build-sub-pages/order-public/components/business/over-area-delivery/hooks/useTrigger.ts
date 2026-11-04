import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
import { resetOptionsStatus, resetPhoneData } from '.'

export const useTrigger = () => {
  const onTriggerBySender = () => {
    console.log(`收方信息改变了，超区派送清空内容！`)
    const params = {
      deliveryMode: '',
      selfPickupMobile: '',
      selfPickBranchId: '',
      selfPickBranchName: '',
    }
    piniaStore.order.updateOrderByType({
      type: ModuleType['超区派送'],
      data: params,
    })
    // 清空组件内状态
    resetOptionsStatus()
    resetPhoneData()
  }

  return {
    onTriggerBySender,
  }
}
