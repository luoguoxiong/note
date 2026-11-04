import { PickUp, localCheckResult, GoodsTime, OrderInfo } from '@order-public-sub-public/types'

import { ModuleType } from '@order-public-sub-public/constants'
import useEffect from '@order-public-sub-public/validate'
import { showReceiveMask } from './utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { effectBubble } = useEffect()

export const useValidate = () => {
  const validateCollection = async (): Promise<localCheckResult[]> => {
    const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList

    let validateResult: localCheckResult[] = [
      { passed: true, content: '', key: 'batchWaybillList', bubbleConfig: { placement: 'top-end' } },
    ]

    if (!batchWaybillInfoList || batchWaybillInfoList.length <= 0) {
      validateResult = [
        {
          passed: false,
          content: '请新增收件人信息',
          key: 'batchAddReceive',
          bubbleConfig: { placement: 'top' },
        },
      ]
    } else {
      for (let i = 0; i < batchWaybillInfoList?.length; i++) {
        const curOrderInfo = batchWaybillInfoList[i].waybillInfo || {}

        // 取派管控前端不校验
        const restricInfo = batchWaybillInfoList[i].restrictData || {}
        const addressLimit = restricInfo?.addressRestrict?.restrictedType === 10

        const payModeVal = curOrderInfo.payMode?.payMode
        const serviceMode = curOrderInfo.serviceMode?.serviceMode
        const productInfo = curOrderInfo.productInfo?.goodsType
        if (showReceiveMask(batchWaybillInfoList[i])) {
          // 如果收件人信息不完整，先校验收件人信息，不需要提示完善运单信息
          break
        }
        // 服务方式接口解耦后，需要单独判断
        if ((!payModeVal && !productInfo && !addressLimit) || !serviceMode) {
          validateResult.push({
            passed: false,
            content: '请完善运单信息',
            key: 'batchWaybillInfoList',
            bubbleConfig: {
              waybillNumber: curOrderInfo.waybillNumber,
              placement: 'top-end',
            },
          })
        }
      }
    }

    return Promise.all(validateResult)
  }

  return {
    validateCollection,
  }
}

/**
 * @description 运单为空的工具函数
 * @param curOrderInfo
 * @returns
 */
export const isWaybillEmpty = (curOrderInfo: OrderInfo) => {
  const payModeVal = curOrderInfo.payMode?.payMode
  const serviceMode = curOrderInfo.serviceMode?.serviceMode
  const productInfo = curOrderInfo.productInfo?.goodsType

  return !payModeVal && !serviceMode && !productInfo
}

export const validateBatchSingleWaybill = async (waybillNumber?: string) => {
  const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList || []
  if (!batchWaybillInfoList.length) return

  const waybill = waybillNumber
    ? batchWaybillInfoList?.filter((item) => item.waybillNumber === waybillNumber)
    : batchWaybillInfoList

  if (!waybill.length) return

  const validateResult: localCheckResult[] = []

  for (let i = 0; i < waybill?.length; i++) {
    const curOrderInfo = waybill[i].waybillInfo || {}

    if (isWaybillEmpty(curOrderInfo)) {
      validateResult.push({
        passed: false,
        content: '请完善运单信息',
        key: 'batchWaybillInfoList',
        bubbleConfig: {
          waybillNumber: curOrderInfo.waybillNumber,
          placement: 'top-end',
        },
      })
    } else {
      validateResult.push({
        passed: true,
        content: '',
        key: 'batchWaybillInfoList',
        bubbleConfig: { placement: 'top-end', waybillNumber: curOrderInfo.waybillNumber },
      })
    }
  }
  console.log('批量收件信息结果：', validateResult)
  await effectBubble(validateResult)
}

export const checkReceive = async (waybillNumber: string) => {
  const receiveData = piniaStore.order.moduleFormData(ModuleType.收方信息, waybillNumber)
  if (!receiveData?.person) {
    return effectBubble([
      {
        key: 'receive',
        passed: false,
        content: '请输入收件人姓名',
        bubbleConfig: {
          waybillNumber: waybillNumber,
          placement: 'top-start',
        },
      },
    ])
  }

  if (!receiveData?.mobile && !receiveData?.telephone) {
    return effectBubble([
      {
        key: 'receive',
        passed: false,
        content: '请输入收件人手机号',
        bubbleConfig: {
          waybillNumber: waybillNumber,
          placement: 'top-start',
        },
      },
    ])
  }
}

export const checkGoodsTime = async () => {
  const goodstimeOrderInfo = piniaStore.order.moduleFormData(ModuleType['货好时间'])
  const goodsTime = goodstimeOrderInfo?.goodsTime || goodstimeOrderInfo?.goodsTimeFlag || ''
  if (!goodsTime) {
    return effectBubble([
      {
        key: 'goodsTime.goodsTime',
        passed: false,
        content: '请选择货好时间',
        bubbleConfig: {
          placement: 'top-end',
        },
      },
    ])
  }
}
