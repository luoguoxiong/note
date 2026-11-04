
import { OrderPickupInfo } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useUpdateStore = (data: Partial<OrderPickupInfo>) => {
  piniaStore.order.updateOrderByType({
    type: ModuleType['取货资料'],
    data,
  })
}
