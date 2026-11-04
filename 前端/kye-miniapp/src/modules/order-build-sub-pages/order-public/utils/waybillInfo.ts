import { waybillInfo } from '@order-public-sub-public/configs/initData'
import { AddressType, EAM_ORDER_ADDRESS_SCENE_TYPE } from '@order-public-sub-public/constants'
import { clearFeeData } from '@order-public-sub-public/components/business/estimated-cost/hooks/singleFeePolling'
import { getDefaultSelect } from '@order-public-sub-public/components/business/estimated-cost/hooks/useExpose'
import { cloneDeep } from 'lodash-es'
import { clearUUid } from '@public/hooks/useTmpCacheKey'
import { orderPageScrollTopHistory } from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * @description 重置resetWaybillInfo,退出活动时使用
 */
export const resetWaybillInfo = (reset?: boolean) => {
  // 清空费用提示
  clearFeeData()
  clearUUid()
  orderPageScrollTopHistory.value = 0
  piniaStore.order.updateOrder({ data: cloneDeep(waybillInfo), reset: reset })
}

/**
 * useInit 里面useRefresh方法不会再触发业务组件里面的onMounted，所以此场景需要执行一下
 * 重置业务挂载，
 */
export const refreshBusinessMounted = () => {
  getDefaultSelect()
}

/**
 * @description 获取寄收件详细地址AI识别的场景编码
 */
export const getDetailAddressSceneType = (addressType: AddressType) => {
  const map: Record<AddressType, EAM_ORDER_ADDRESS_SCENE_TYPE | ''> = {
    [AddressType.SENDER]: EAM_ORDER_ADDRESS_SCENE_TYPE.填写寄件信息寄件详细地址,
    [AddressType.RECEIVE]: EAM_ORDER_ADDRESS_SCENE_TYPE.填写收件件信息寄件详细地址,
    [AddressType.RECEIPTER]: EAM_ORDER_ADDRESS_SCENE_TYPE.回单返单识别,
  }

  return map[addressType]
}

/**
 * @description 获取智能识别的场景编码
 */
export const getOcrAddressSceneType = (addressType: AddressType) => {
  const map: Record<AddressType, EAM_ORDER_ADDRESS_SCENE_TYPE | ''> = {
    [AddressType.SENDER]: EAM_ORDER_ADDRESS_SCENE_TYPE.寄件智能识别,
    [AddressType.RECEIVE]: EAM_ORDER_ADDRESS_SCENE_TYPE.收件智能识别,
    [AddressType.RECEIPTER]: EAM_ORDER_ADDRESS_SCENE_TYPE.回单返单识别,
  }

  return map[addressType]
}

export const getAddressType = (addressType: string) => {
  return addressType.includes('SENDER') || addressType.toString() === '10' ? 10 : 20
}
