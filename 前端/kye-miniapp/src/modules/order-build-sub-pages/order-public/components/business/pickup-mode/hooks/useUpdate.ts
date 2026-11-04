import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'

import { PickupMode, PickupType } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const updateOrder = (params: { data: PickupMode; orderPageType?: OrderPageType }) => {
  const { data, orderPageType } = params
  console.log('orderPageType', orderPageType)
  piniaStore.order.updateOrderByType({
    type: ModuleType['寄件方式'],
    data: { ...data },
  })

  if (data.pickupMode === PickupType.服务点自寄) {
    // 已选服务点自寄，暂不支持选择返程寄
    piniaStore.globalData.setDynamicConfigItem({
      configItem: {
        key: 'goodsTime',
        value: {
          visible: false,
          required: false,
        },
      },
    })
    const dyamincData = piniaStore.globalData.dynamicConfig('returnWaybill') || {}
    // 已选服务点自寄，暂不支持选择返程寄
    piniaStore.globalData.setDynamicConfigItem({
      configItem: {
        key: 'returnWaybill',
        value: {
          disabledInfos: [
            {
              key: 'returnWaybill',
              tips: '已选服务点自寄，暂不支持选择返程寄',
            },
          ],
          visible: dyamincData.visible,
          required: false,
        },
      },
    })
  }
}
