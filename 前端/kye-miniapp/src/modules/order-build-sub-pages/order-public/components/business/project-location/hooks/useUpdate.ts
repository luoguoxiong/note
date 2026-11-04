import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'

import { ChangeKeys, SenderExtend } from '@order-public-sub-public/types'
import useEffect from '@order-public-sub-public/validate'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const { remoteCheck } = useEffect()
export const updateOrderByType = (params: { data: SenderExtend; orderPageType?: OrderPageType }) => {
  const { data, orderPageType } = params
  piniaStore.order.updateOrderByType({
    type: ModuleType['寄方信息'],
    data: { extend: data },
    orderPageType,
  })
}

export const remoteCheckData = (key: ChangeKeys) => {
  remoteCheck(key)
}
