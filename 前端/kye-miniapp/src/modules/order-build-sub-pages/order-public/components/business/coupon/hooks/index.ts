import { computed } from 'vue'

import { isOrderBatchWaybill } from '@order-public-sub-public/utils/route'
import { ModuleType } from '@order-public-sub-public/constants'
import { Coupon, CouponDimension } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export function useData() {
  const data = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['优惠券']))

  const showText = computed(() => {
    if (data.value?.showText) {
      return data.value.showText
    }
    return piniaStore.order.moduleFormData(ModuleType.优惠券).showText
  })

  const visible = computed(() => piniaStore.globalData.dynamicConfig('coupon')?.visible && !isOrderBatchWaybill())

  return { data, showText, visible }
}
