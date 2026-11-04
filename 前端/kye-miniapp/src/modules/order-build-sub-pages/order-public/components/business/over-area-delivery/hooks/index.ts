import { computed, ref } from 'vue'

import { DeliveryMode, ModuleType } from '@order-public-sub-public/constants'
import { IOption } from '../types'
import { OverAreaDelivery, OverAreaDeliveryDimension, PickUp } from '@order-public-sub-public/types'
import { decimal } from '@order-public-sub-public/utils/filter'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const modalShow = ref(false)
export const isAgreement = ref(false)
export const phoneData = ref('')

// 隐藏超区派送弹窗
export const hiddenOverAreaModal = () => {
  modalShow.value = false
}
export const showOverAreaModal = () => {
  modalShow.value = false
}

export const options = computed<IOption[]>(() => {
  const orderData = computed(() => piniaStore.order.moduleFormData(ModuleType.超区派送))
  return [
    {
      label: '送货上门',
      desc: '(需收取超区费)',
      id: DeliveryMode.SUPER_ZONE,
      checked: orderData?.value?.deliveryMode === DeliveryMode.SUPER_ZONE ? ref(true) : ref(false),
    },
    {
      label: '网点自提',
      id: DeliveryMode.SELF_PICKUP,
      checked: orderData?.value?.deliveryMode === DeliveryMode.SELF_PICKUP ? ref(true) : ref(false),
    },
  ]
})

// 清空选项选中状态
export const resetOptionsStatus = () => {
  options.value?.forEach((option) => {
    option.checked.value = false
  })
}

export const resetPhoneData = () => {
  phoneData.value = ''
}

// 入口文案
export const showValue = computed(() => {
  const data = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['超区派送']))

  const overAreaDeliveryStore = computed(() => {
    return piniaStore.order.moduleFormData(ModuleType.超区派送)
  })

  const overAreaTips = computed(() => data.value?.agent?.topTips || '')

  // 是否有查询运费权限
  // const isFreightLookAuthFlag = computed(() => {
  //   return (
  //     piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
  //       ?.freightLookAuthFlag === '10'
  //   )
  // })
  console.log('showValueshowValueshowValue', data)
  const isSelectSelfPick = overAreaDeliveryStore?.value?.deliveryMode === DeliveryMode.SELF_PICKUP
  const isSuperZone = overAreaDeliveryStore?.value?.deliveryMode === DeliveryMode.SUPER_ZONE
  const phone = overAreaDeliveryStore?.value?.selfPickupMobile || ''
  const selfLiftingDepot = overAreaDeliveryStore?.value?.selfPickBranchName || ''
  if (isSuperZone) {
    // 代理超区使用agent对象，返回的提示展示
    if (overAreaTips.value) {
      return overAreaTips.value
    }
    if (data.value) {
      if (data.value.showFeeFlag) {
        if (data.value?.superAreaFee && data.value?.superZoneDistance && data.value?.superAreaUnitePrice) {
          return `预估超区费${decimal(data.value?.superAreaFee) || 0}元，超出${
            data.value?.superZoneDistance || 0
          }km，收费价格：${decimal(data.value?.superAreaUnitePrice) || 0}元/km`
        } else {
          return '需收取一定超区费，具体以实际收费为准'
        }
      }
      return `超区${data.value?.superZoneDistance || 0}km，预估超区费按照付款公司报价进行计算，暂不支持查看`
    }
    return '送货上门'
  } else if (isSelectSelfPick) {
    return `自提手机号${phone}/${selfLiftingDepot}`
  }
  return ''
})

// 收件手机号
export const receivePhone = computed(() => {
  let phone = piniaStore.order.moduleFormData(ModuleType['收方信息'])?.mobile

  if (!phone || phone.includes('-')) {
    // 分机号情况不取
    return ''
  }
  phone = phone.replace(/\s/g, '') // 去掉空格

  return phone
})

// 收件地址
export const receiveAddress = computed(() => {
  const detailAddress = piniaStore.order.moduleFormData(ModuleType['收方信息']).detailAddress
  return detailAddress
})
