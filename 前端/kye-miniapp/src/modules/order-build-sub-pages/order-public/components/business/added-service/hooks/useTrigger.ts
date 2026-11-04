import { computed } from 'vue'

import { AddedServiceDimension } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useReceiptFlag, useReceiptProvider } from './useState'
import { useUpdateOrderStore } from './useModuleStore'
// eslint-disable-next-line no-duplicate-imports
import { ReceiptService, ReceiptProvider } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const { setReceiptFlag } = useReceiptFlag()
const { setReceiptProvider } = useReceiptProvider()

export const useTrigger = () => {
  const onTriggerByAddedService = () => {
    const moduleDimensionData = computed(() => {
      return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
    })
    if (moduleDimensionData.value) {
      moduleDimensionData.value?.receiptServiceList?.forEach((item) => {
        if (item.default) {
          setReceiptFlag(item.type)
          useUpdateOrderStore({ receiptFlag: item.type })
          // 回单提供方默认
          useTriggerProvider(item)
        }
      })
    }
  }

  return {
    onTriggerByAddedService,
  }
}

export const useTriggerProvider = (data: Partial<ReceiptService>) => {
  data?.receiptProviderList?.forEach((item: Partial<ReceiptProvider>) => {
    if (item.default) {
      setReceiptProvider(item.provider as string)
      useUpdateOrderStore({ receiptProvider: item.provider })
    }
  })
}
