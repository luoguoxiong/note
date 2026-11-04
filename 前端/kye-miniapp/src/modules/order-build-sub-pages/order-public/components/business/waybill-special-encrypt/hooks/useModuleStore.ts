import { WaybillSpecialEncrypt } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useUpdateStore = (data: Partial<WaybillSpecialEncrypt>) => {
  piniaStore.order.updateOrderByType({ type: ModuleType['运单加密'], data })
}
