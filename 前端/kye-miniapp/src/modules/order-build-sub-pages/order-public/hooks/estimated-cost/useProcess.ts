/*
 * @Description: 预估费用、优惠券处理
 * @Date: 2023-12-18 10:12:38
 */
import {
  GetEstimateFeeByTaskIdResponse,
  getEstimateFeeResult,
} from '@order-public-sub-public/apis/waybill/estimated-cost'
import { BatchEstimateFeeResult } from '@order-public-sub-public/apis/types'
import { BatchPollingStatus } from '@order-public-sub-public/apis/waybill/types'
import { BatchSaveSingleWaybillRespones } from '@order-public-sub-public/apis/batch/types'

import { ref } from 'vue'
import { commonSetPolling } from '../usePolling'
import { ChangeKeys } from '@order-public-sub-public/types'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { HttpResponse } from '@order-public-sub-public/utils/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
// import { OrderPageType } from '@order-public-sub-public/constants'

export const batchEstimateLoading = ref(false)

export const waybillEstimateLoading = ref([] as string[])
export const waybillCouponLoading = ref([] as string[])
export const batchEstimateFeeResult = ref<BatchEstimateFeeResult>()
export const batchEstimateFeeResultPromise = ref<Promise<HttpResponse<BatchEstimateFeeResult>>>()

const estimateFeeProcessPolling = async (params: BatchSaveSingleWaybillRespones, waybillNumber?: string) => {
  const { taskId, computeEstimateFee, computeCoupon, key } = params
  if (!taskId) return
  if (waybillNumber) {
    if (computeEstimateFee) waybillEstimateLoading.value.push(waybillNumber)
    if (computeCoupon) waybillCouponLoading.value.push(waybillNumber)
  }
  batchEstimateLoading.value = computeEstimateFee || false
  try {
    const promise = commonSetPolling({
      polling: getEstimateFeeResult,
      delay: 500,
      args: { taskId: taskId, isInit: params.isInit || false },
      timerName: 'estimateFee',
      finishStatus: (data) => {
        if ([BatchPollingStatus.成功].includes(data?.data.status) && data?.data?.taskId !== taskId) {
          // taskId 不一致时，不是最后一次轮询 先保存一次费用，继续用新taskId轮询
          saveEstimateFeeResult(data.data, key, params.orderPageType)
          return false
        } else {
          return [BatchPollingStatus.成功].includes(data?.data.status)
        }
      },
    })
    batchEstimateFeeResultPromise.value = promise
    const data = await promise
    saveEstimateFeeResult(data.data, key, params.orderPageType)
    // console.log('data: ', data)
  } catch (error) {
    console.log(error)
  } finally {
    batchEstimateLoading.value = false
    waybillEstimateLoading.value = []
    waybillCouponLoading.value = []
  }

  console.log('finallyPolling', waybillEstimateLoading)
}

/**
 * @description 保存预估费用数据
 * @param initData
 */
const saveEstimateFeeResult = (data: BatchEstimateFeeResult, key?: ChangeKeys, orderPageType?: OrderPageType) => {
  console.log(key)
  if (data) {
    batchEstimateFeeResult.value = data
    piniaStore.globalData.setWaybillEstimatedCost({
      data: data?.estimateFeeResult as GetEstimateFeeByTaskIdResponse,
      cacheStrategy: data?.cacheStrategy,
      orderPageType,
    })
    const waybillNumber = piniaStore.order.waybillNumber
    const resultData = data?.estimateFeeResult?.responses?.find((item) => item?.waybillNumber === waybillNumber)
    if (!resultData) {
      return
    }
    const resData = {
      ...resultData?.feeResponse,
      estimateFeeTip: resultData?.estimateFeeTip || '',
      noEstimateFeeText: resultData?.noEstimateFeeText || '',
    }

    // 更新预估运费业务组件维度数据 - 增值服务里面有用到response
    piniaStore.schema.updateModuleDimensionByType({
      type: ModuleType['预估费用'],
      data: {
        response: resData,
      },
    })

    /**
     * 批量修改单票- 保存 此时OrderPageType 还是 order-batch-waybill
     * 需要把数据更新到 order-batch，保证返回时 统计金额正确
     */
    // # 446707 不再需要这个逻辑，这个会导致触发管控不保存运单外面就显示了费用
    // const orderPageType = piniaStore.root.getOrderPageType
    // if (key === 'waybill' && orderPageType === OrderPageType.批量寄单票) {
    //   piniaStore.globalData.setWaybillEstimatedCost({
    //     data: data?.estimateFeeResult as GetEstimateFeeByTaskIdResponse,
    //     cacheStrategy: data?.cacheStrategy,
    //     orderPageType: OrderPageType.批量寄,
    //   })
    // }
    piniaStore.order.couponUpdateClearOrderCouponCode({ data: data?.estimateFeeResult })
  }
}

export const useEstimateFeeResult = () => {
  return {
    saveEstimateFeeResult,
    estimateFeeProcessPolling,
  }
}
