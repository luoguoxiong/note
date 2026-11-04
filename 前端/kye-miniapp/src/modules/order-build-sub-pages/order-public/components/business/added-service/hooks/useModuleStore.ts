import { AddedService, AddedServiceDimension } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useUpdateOrderStore = (data: Partial<AddedService>) => {
  piniaStore.order.updateOrderByType({ type: ModuleType['增值服务'], data })
}

export const useUpdateDimensionStore = (data: Partial<AddedServiceDimension>) => {
  piniaStore.schema.updateModuleDimensionByType({ type: ModuleType['增值服务'], data: data })
}
