import { ProductInfo } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useUpdateStore = (data: Partial<ProductInfo>) => {
  piniaStore.order.updateOrderByType({ type: ModuleType['货物信息'], data })
}
