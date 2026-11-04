import { computed } from 'vue'
import { ModuleType } from '@order-public-sub-public/constants'

import { forIn } from 'lodash-es'
import { localCheckResult } from '@order-public-sub-public/types'
import senderUseValidate from '@order-public-sub-public/hooks/address/sender/useValidate'
import receiveUseValidate from '@order-public-sub-public/hooks/address/receive/useValidate'
import pickupModeValidate from '@order-public-sub-public/components/business/pickup-mode/hooks/useValidate'
import { useValidate as goodsTimeValidate } from '@order-public-sub-public/components/business/goods-time/hooks/useValidate'
import payModeValidate from '@order-public-sub-public/components/business/pay-mode/hooks/useValidate'
import { useValidate as overAreaDeliveryValidate } from '@order-public-sub-public/components/business/over-area-delivery/hooks/useValidate'
import { useValidate as productInfoValidate } from '@order-public-sub-public/components/business/product-info/hooks/useValidate'
import serviceModeValidate from '@order-public-sub-public/components/business/service-model/hooks/useValidate'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { validateCollection: senderValidateCollection } = senderUseValidate()
const { validateCollection: receiveValidteCollection } = receiveUseValidate()
const { validateCollection: pickupModeValidteCollection } = pickupModeValidate()
const { validateCollection: goodsTimeValidateCollection } = goodsTimeValidate()
const { validateCollection: payModeValidateCollection } = payModeValidate()
const { validateCollection: overAreaDeliveryValidateCollection } = overAreaDeliveryValidate()
const { validateCollection: productInfoValidateCollection } = productInfoValidate()
const { validateCollection: serviceModeValidateCollection } = serviceModeValidate()

export type HotZoneDepend = Partial<Record<ModuleType, HotZoneDependDesc[]>>

export interface HotZoneDependDesc {
  dependComponents: ModuleType
  dependCallback: () => Promise<localCheckResult[]>
}

/**
 * 热区校验依赖
 */
export const hotZoneDependMap: HotZoneDepend = {
  [ModuleType['货好时间']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['收方信息'],
      dependCallback: receiveValidteCollection,
    },
    {
      dependComponents: ModuleType['寄件方式'],
      dependCallback: pickupModeValidteCollection,
    },
  ],
  [ModuleType['寄件方式']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['收方信息'],
      dependCallback: receiveValidteCollection,
    },
  ],
  [ModuleType['付款方式']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['收方信息'],
      dependCallback: receiveValidteCollection,
    },
    {
      dependComponents: ModuleType['货好时间'],
      dependCallback: goodsTimeValidateCollection,
    },
    {
      dependComponents: ModuleType['寄件方式'],
      dependCallback: pickupModeValidteCollection,
    },
  ],
  [ModuleType['超区派送']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['收方信息'],
      dependCallback: receiveValidteCollection,
    },
    {
      dependComponents: ModuleType['寄件方式'],
      dependCallback: pickupModeValidteCollection,
    },
    {
      dependComponents: ModuleType['货好时间'],
      dependCallback: goodsTimeValidateCollection,
    },
    {
      dependComponents: ModuleType['付款方式'],
      dependCallback: payModeValidateCollection,
    },
    {
      dependComponents: ModuleType['货物信息'],
      dependCallback: productInfoValidateCollection,
    },
  ],
  [ModuleType['货物信息']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['收方信息'],
      dependCallback: receiveValidteCollection,
    },
    {
      dependComponents: ModuleType['寄件方式'],
      dependCallback: pickupModeValidteCollection,
    },
    {
      dependComponents: ModuleType['货好时间'],
      dependCallback: goodsTimeValidateCollection,
    },
    {
      dependComponents: ModuleType['付款方式'],
      dependCallback: payModeValidateCollection,
    },
  ],
  [ModuleType['服务方式']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['收方信息'],
      dependCallback: receiveValidteCollection,
    },
    {
      dependComponents: ModuleType['寄件方式'],
      dependCallback: pickupModeValidteCollection,
    },
    {
      dependComponents: ModuleType['货好时间'],
      dependCallback: goodsTimeValidateCollection,
    },
    {
      dependComponents: ModuleType['付款方式'],
      dependCallback: payModeValidateCollection,
    },
    {
      dependComponents: ModuleType['货物信息'],
      dependCallback: productInfoValidateCollection,
    },
    {
      dependComponents: ModuleType['超区派送'],
      dependCallback: overAreaDeliveryValidateCollection,
    },
  ],
  [ModuleType['物品保价']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['收方信息'],
      dependCallback: receiveValidteCollection,
    },
    {
      dependComponents: ModuleType['寄件方式'],
      dependCallback: pickupModeValidteCollection,
    },
    {
      dependComponents: ModuleType['货好时间'],
      dependCallback: goodsTimeValidateCollection,
    },
    {
      dependComponents: ModuleType['付款方式'],
      dependCallback: payModeValidateCollection,
    },
    {
      dependComponents: ModuleType['货物信息'],
      dependCallback: productInfoValidateCollection,
    },
    {
      dependComponents: ModuleType['超区派送'],
      dependCallback: overAreaDeliveryValidateCollection,
    },
    {
      dependComponents: ModuleType['服务方式'],
      dependCallback: serviceModeValidateCollection,
    },
  ],
  [ModuleType['本次寄件信息统一']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['货好时间'],
      dependCallback: goodsTimeValidateCollection,
    },
  ],
  [ModuleType['批量新增收件人']]: [
    {
      dependComponents: ModuleType['寄方信息'],
      dependCallback: senderValidateCollection,
    },
    {
      dependComponents: ModuleType['货好时间'],
      dependCallback: goodsTimeValidateCollection,
    },
  ],
}

export const hotZoneDepend = computed(() => {
  const componentList = piniaStore.globalData.componentList
  const result: HotZoneDepend = {}
  forIn(hotZoneDependMap, (value, key) => {
    if (componentList.includes(key)) {
      const hotZoneDependDesc: HotZoneDependDesc[] = []
      value?.forEach((item) => {
        if (componentList.includes(item.dependComponents)) {
          hotZoneDependDesc.push(item)
        }
      })
      result[key as ModuleType] = hotZoneDependDesc
    }
  })

  return result
})
