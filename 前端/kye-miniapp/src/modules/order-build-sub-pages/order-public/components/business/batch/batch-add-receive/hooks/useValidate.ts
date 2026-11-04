import { localCheckResult } from '@order-public-sub-public/types'

export const useValidate = () => {
  const validateCollection = async (): Promise<localCheckResult[]> => {
    const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList

    let validateResult = [{ passed: true, content: '', key: 'batchAddReceive' }]

    if (!batchWaybillInfoList || batchWaybillInfoList.length <= 0) {
      validateResult = [{ passed: false, content: '请选择收件人', key: 'batchAddReceive' }]
    }

    return Promise.all(validateResult)
  }

  return {
    validateCollection,
  }
}
