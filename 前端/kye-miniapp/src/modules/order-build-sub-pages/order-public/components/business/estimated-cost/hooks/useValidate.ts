import useEffect from '@order-public-sub-public/validate'

import { EstimatedCostDimension, localCheckResult } from '@order-public-sub-public/types'
import { show } from '../components/netc-agreement/useData'
import { isOrderBackRoute } from '@order-public-sub-public/utils/route'
import { getStorge } from '../utils'
import { ModuleType } from '@order-public-sub-public/constants'
import { couponShowFlag } from './useExpose'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const useValidate = () => {
  const { effectBubble, remoteCheck } = useEffect()

  const validateField = async (): Promise<localCheckResult> => {
    try {
      // 往返寄情况不需要判断协议勾选
      const isBackRoute = isOrderBackRoute()
      if (!isBackRoute) {
        // Sometimes can't get store data
        const storeAgreementCheck = piniaStore.schema.moduleDimensionData(ModuleType.预估费用)?.agreementCheck
        const storgeAgreementCheck = getStorge('agreementCheck')
        console.log('validateField agreementCheck', storeAgreementCheck, 'storgeAgreementCheck', storgeAgreementCheck)
        const isChecked = storeAgreementCheck || storgeAgreementCheck
        if (!isChecked) {
          console.log('协议校验失败', isChecked)
          couponShowFlag.value = false
          show.value = true
          return {
            key: 'agreement',
            passed: false,
            // 小程序气泡定位不了 和产品协商先去除
            // content: '请先阅读勾选协议',
            bubbleConfig: { appendTo: document.body, offset: [0, 10] },
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
    couponShowFlag.value = true
    return {
      key: 'agreement',
      passed: true,
      content: '',
    }
  }

  const validateCollection = () => {
    const validatePromises = [validateField()]
    return Promise.all(validatePromises)
  }

  const confirmValidateCollection = async () => {
    const result = await validateCollection()
    try {
      // 触发副作用
      await effectBubble(result)
      // 远程校验
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore @ts-nocheck
      await remoteCheck('agreement')
    } catch (error) {
      console.log('error', error)
    }
  }

  return {
    validateField,
    validateCollection,
    confirmValidateCollection,
  }
}

export { useValidate }
