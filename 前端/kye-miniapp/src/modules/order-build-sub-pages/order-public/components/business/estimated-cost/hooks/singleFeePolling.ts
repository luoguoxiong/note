import { ref, computed } from 'vue'
import {
  EstimateFeeByTaskIdResponseResultItem,
  FeeResponse,
  GetEstimateFeeByTaskIdResponse,
  getEstimatedCost,
} from '@order-public-sub-public/apis/waybill/estimated-cost'
import { HttpResponse } from '@order-public-sub-public/utils/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'

import { commonSetPolling } from '@order-public-sub-public/hooks/usePolling'
import { setStorge } from '../utils'

export const isLoading = ref(true)
export const data = ref<FeeResponse | null | Record<string, never> | undefined>(undefined)
export const results = ref<EstimateFeeByTaskIdResponseResultItem[] | undefined>([])
export const totalCount = ref<number | null | undefined>(null)

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

/**
 * 轮询hook，支持外部触发传入
 * @param interval 间隔时间
 * @param tryCount 轮询次数
 * @param options 外部传入触发选项
 * @returns
 */
const processingData = (response: HttpResponse<GetEstimateFeeByTaskIdResponse>) => {
  results.value = response.data?.responses
  // 成功获取预估运费
  const resultData = response.data?.responses[0]
  const resData = {
    ...resultData?.feeResponse,
    estimateFeeTip: resultData?.estimateFeeTip,
    noEstimateFeeText: resultData?.noEstimateFeeText,
  }
  const couponData = response.data?.couponCountResponseVo
  data.value = resData
  totalCount.value = response.data.batchAmount
  // SET_WAYBILL_ESTIMATED_COST
  piniaStore.globalData.setWaybillEstimatedCost(response)
  // 更新预估运费业务组件维度数据 - 增值服务里面有用到response
  piniaStore.schema.updateModuleDimensionByType({
    type: ModuleType['预估费用'],
    data: {
      response: resData,
    },
  })
  // 更新优惠券数量信息
  const showTextValue: Record<string, any> = {}
  response.data.showText && (showTextValue.showText = response.data.showText)
  piniaStore.schema.updateModuleDimensionByType({
    type: ModuleType['优惠券'],
    data: { ...couponData, couponTips: response.data.couponTips, ...showTextValue },
  })
}

const singleFeePolling = async (id: string) => {
  // 费用接口等待初始化
  try {
    const initDataPromise = piniaStore.globalData.initDataPromise
    if (initDataPromise) {
      await initDataPromise
    }
  } catch (err) {
    console.log('initDataPromise error', err)
  }
  isLoading.value = true
  if (orderPageType.value === OrderPageType.返程单) {
    // 返程单每次都是生成新运单 每次都会重新拉取费用，此处需要清除费用
    piniaStore.globalData.deleteEstimateResponses({ waybillNumber: 'all' })
  }
  try {
    const response = await commonSetPolling({
      delay: 500,
      count: 20,
      polling: getEstimatedCost,
      timerName: 'getEstimatedCost',
      overtimeMsg: false,
      finishStatus: (res) => {
        // 返回true 终止轮询
        return (res?.data?.responses && res.data.responses.length > 0) || res?.data === null
      },
      args: { taskId: id, orderScene: '10' },
    })
    if (response?.data?.responses && response.data.responses.length > 0) {
      processingData(response)
    } else if (response?.data === null) {
      data.value = null
    } else {
      data.value = {}
    }
  } catch (err) {
    data.value = null
  } finally {
    isLoading.value = false
  }
}

export const singleFeeData = () => {
  return {
    data,
    results,
    isLoading,
    totalCount,
    orderPageType,
    singleFeePolling,
  }
}

// 费用缓存信息清除
export const clearFeeData = () => {
  setStorge('agreementCheck', false)
  data.value = undefined
  results.value = undefined
  isLoading.value = false
  totalCount.value = null
}
