import { computed } from 'vue'

import { switchFlag, returnWaybillValue } from './state'
import { localCheckResult } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useValidate = () => {
  const dyamincData = computed(() => piniaStore.globalData.dynamicConfig('returnWaybill') || {})

  const bubbleConfig = { placement: 'top-end', offset: [30, 18] } as localCheckResult['bubbleConfig']

  const validateField = async (): Promise<localCheckResult> => {
    let result: localCheckResult = {
      key: 'returnWaybill.returnWaybill',
      passed: true,
      content: '',
      bubbleConfig,
    }

    if (dyamincData.value?.visible && switchFlag.value) {
      if (!returnWaybillValue.value) {
        result = {
          key: 'returnWaybill.returnWaybill',
          passed: false,
          content: '请完善返程运单信息',
          bubbleConfig,
        }
      }
    }

    return result
  }

  const validateCollection = (): Promise<localCheckResult[]> => {
    const validateResult: Promise<localCheckResult>[] = [validateField()]

    return Promise.all(validateResult)
  }

  return { validateCollection }
}
