import { localCheckResult, PickupMode } from '@order-public-sub-public/types'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'

import { configData, moduleDemensionData } from './state'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const useValidate = () => {
  // 单个校验
  const validateField = async (): Promise<localCheckResult> => {
    const baseCheckResult: localCheckResult = {
      key: `pickupMode.pickupMode`,
      passed: true,
      bubbleConfig: {
        placement: 'top-end',
      },
      content: '',
    }
    const pickupModeData = piniaStore.order.moduleFormData(ModuleType.寄件方式)

    const isVisiable = configData.value.visible && moduleDemensionData.value?.pickupModeList?.length

    if (!isVisiable || pickupModeData.pickupMode) {
      return baseCheckResult
    }

    const { visible } = piniaStore.globalData.dynamicConfig('pickupModeExtraInfo') || {}
    // 新前端老后端兼容
    if (visible !== undefined && !visible) {
      return baseCheckResult
    }

    return {
      ...baseCheckResult,
      passed: false,
      content: '请选择寄件方式',
    }
  }

  const validateCollection = async (): Promise<localCheckResult[]> => {
    const orderPageType = piniaStore.root.getOrderPageType

    if (orderPageType !== OrderPageType.批量寄) {
      const validationPromises = [validateField()]
      return Promise.all(validationPromises)
    } else {
      return Promise.all([])
    }
  }

  return {
    validateField,
    validateCollection,
  }
}
export default useValidate
