import { computed, ref, watch } from 'vue'

import { OrderPageType } from '@order-public-sub-public/constants'
import { batchEstimateLoading } from '@order-public-sub-public/hooks/estimated-cost/useProcess'
import { isEmpty } from 'lodash-es'
import { singleFeeData } from './singleFeePolling'
import { estimatedCostItem } from '@order-public-sub-public/apis/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { results, isLoading, data } = singleFeeData()

// 预估运费总数据（包括往返）
// export const results = ref<EstimateFeeByTaskIdResponseResultItem[] | undefined>([])
export const totalCount = ref<number | null | undefined>(null)
export const showBatchFeeTipsStroe = ref<boolean>(false)

// 单票预估运费数据

export const isError = ref(false)
// 正常下单还是往返寄
export const isNormal = computed(() => {
  if (results.value && results.value?.length > 1) {
    return false
  }
  return true
})
export const showEstimatedCostModal = ref(false) // 显示预估运费弹窗
export const getShowEstimatedCostModal = () => showEstimatedCostModal

export const toogleEstimatedCostModal = () => {
  showEstimatedCostModal.value = !showEstimatedCostModal.value
}

// 隐藏预估运费明细弹窗，某些情况下可能有层级问题所以需要向外暴露此方法
export const hiddenEstimatedCostModal = () => {
  showEstimatedCostModal.value = false
}

export const moduleVisible = computed(() => {
  if (orderBatch.value) {
    const estimatedCost = piniaStore.globalData.estimatedCost
    if (!isEmpty(estimatedCost)) {
      // estimatedCost 有值则使用 否则取initConfig中配置
      return estimatedCost?.visible
    } else {
      return piniaStore.globalData.initConfig?.configDimension?.dynamicConfig?.estimatedCost?.visible
    }
  } else {
    return piniaStore.globalData.dynamicConfig('estimatedCost')?.visible
  }
})

const processLoading = computed(() => piniaStore.globalData.processLoading)
const taskId = computed(() => piniaStore.schema.currentSchema?.schema?.data?.estimateFeeTaskId || '')
export const orderBatch = computed(() => piniaStore.root.getOrderPageType === OrderPageType.批量寄)
export const orderBatchWaybill = computed(() => piniaStore.root.getOrderPageType === OrderPageType.批量寄单票)
export const returnWaybill = computed(() => piniaStore.root.getOrderPageType === OrderPageType.返程单)
export const showSingleEstimatedCost = ref(false)
export const estimatedCost = piniaStore.globalData.estimatedCost
export const concatLoading = computed(() => {
  if (piniaStore.root.getOrderPageType === OrderPageType.单票 || returnWaybill.value) {
    console.log(isLoading, 'isLoading')
    return isLoading.value
  } else {
    return batchEstimateLoading.value
  }
})

watch([() => moduleVisible.value, () => processLoading.value, () => taskId.value], (val, oldV) => {
  const visibleValue = val[0]
  const processLoading = val[1]
  const taskId = val[2]
  const oldTaskId = oldV[2]
  // 如果在process请求的时候就开始loading
  if (visibleValue && processLoading) {
    if (orderBatch.value || orderBatchWaybill.value || returnWaybill.value) {
      isLoading.value = false
    } else {
      // isLoading.value = true
    }
  } else if (taskId === oldTaskId) {
    // 如果taskId和上一次没有变化，取消isLoading
    isLoading.value = false
  }
})
const estimatedCostStore = computed(() => piniaStore.globalData.estimatedCost)
const singleResult = computed(() => {
  const waybillNumber = piniaStore.order.waybillNumber
  const estimatedCost = estimatedCostStore.value
  const responsesMap = estimatedCost?.responses?.find((x) => x.waybillNumber === waybillNumber)
  return responsesMap ? [responsesMap] : []
})
export const dataValue = computed(() => {
  const feeData = piniaStore.globalData.dynamicConfig('estimatedCost') as estimatedCostItem
  if (orderBatch.value) {
    return estimatedCostStore?.value?.responses || estimatedCostStore?.value?.noEstimateFeeText
      ? estimatedCostStore?.value
      : feeData
  } else if (orderBatchWaybill.value) {
    if (singleResult.value.length) {
      const haswaybillAmount = singleResult?.value[0]?.feeResponse?.waybillAmount
      return haswaybillAmount
        ? {
            ...singleResult.value[0]?.feeResponse,
            noEstimateFeeText: singleResult.value[0].noEstimateFeeText,
            estimateFeeTip: singleResult.value[0].estimateFeeTip,
          }
        : singleResult.value[0]
    }
    // bug#447282
    return feeData
  }
  // 初始化 没有data 时 使用过程中 dynamicConfig
  if (isEmpty(data.value)) {
    return feeData
  }
  if (piniaStore.root.getOrderPageType === OrderPageType.返程单) {
    // 往返寄 先判断是否有默认提示文案
    if (feeData?.noEstimateFeeText) {
      return feeData
    } else if (singleResult?.value?.length) {
      return singleResult.value[0]?.noEstimateFeeText
        ? singleResult.value[0]
        : singleResult.value[0]?.feeResponse || null
    }
    return null
  } else {
    // 先判断是否有默认提示文案 切换必填信息可能会清除 某些必填项，导致没有费用taskID
    return feeData?.noEstimateFeeText ? feeData : data.value
  }
})

export const lowestWaybillContent = computed(() => {
  if (piniaStore.root.getOrderPageType === OrderPageType.批量寄) {
    return (dataValue?.value as any)?.batchTips || ''
  } else {
    return dataValue?.value?.addedValueTips || ''
  }
})
