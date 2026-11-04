import { ReturnWaybill } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useReturnWaybillValue } from './useState'
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useUpdateOrderStore = (data: Partial<ReturnWaybill>) => {
  piniaStore.order.updateOrderByType({ type: ModuleType['需返程'], data })
}

export const useResetReturnWaybillNumber = (data = '') => {
  piniaStore.globalData.setReturnWaybillNumber({
    waybillNumber: data,
  })
}
const orderPageType = computed(() => piniaStore.root.getOrderPageType)
// 清空返程单信息
export const clearReturnWaybill = () => {
  piniaStore.globalData.clearStaticConfigAndWaybillInfo({ orderPageType: orderPageType.value })
  piniaStore.globalData.setDynamicConfigItem({
    configItem: {
      key: 'returnWaybill',
      value: {
        visible: false,
        required: false,
      },
    },
  })
  const { setReturnWaybillValue } = useReturnWaybillValue()
  setReturnWaybillValue('')
}

export const chearReturnWaybillInfo = () => {
  piniaStore.globalData.clearStaticConfigAndWaybillInfo({ orderPageType: orderPageType.value })
}
