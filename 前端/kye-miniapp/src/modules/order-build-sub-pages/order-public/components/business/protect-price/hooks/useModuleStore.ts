import { ProtectPrice } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useUpdateOrderStore = (data: Partial<ProtectPrice>) => {
  piniaStore.order.updateOrderByType({ type: ModuleType['物品保价'], data: data })
}
