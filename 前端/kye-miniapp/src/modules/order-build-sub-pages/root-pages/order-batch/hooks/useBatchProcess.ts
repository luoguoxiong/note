import { getBatchProcess, getBatchProcessResult, getBatchFiledInit } from '@order-public-sub-public/apis'
import { BatchProcessQuery, BatchProcessResultResponse } from '@order-public-sub-public/apis/types'

import { OrderInfo, ChangeKeys } from '@order-public-sub-public/types'
import { useStaticAndDynamicData } from '@order-public-sub-public/hooks/useStaticAndDynamicData'
import { getCurrentPageName, getModuleStyle } from '@order-public-sub-public/validate/utils'
import {
  ModuleStyle,
  OrderPageType,
  processCacheStrategy,
  BatchInitPollingStatus,
  Channel,
} from '@order-public-sub-public/constants'
// import { GetEstimateFeeByTaskIdResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import useEffect from '@order-public-sub-public/validate'
import { useEstimateFeeResult } from '@order-public-sub-public/hooks/estimated-cost/useProcess'
import { getBatchNightFeeTip } from '@order-public-sub-public/components/business/goods-time/hooks/useBatchNightFeeTip'
import {
  batchProcessLoading,
  batchProcessTimer,
  filterTempData,
  getCommonWaybillInfo,
  handleAssembleData,
} from './useBatchProcessUtils'
import { commonSetPolling, commonStopPolling } from '@order-public-sub-public/hooks/usePolling'
import { BatchPollingStatus } from '@order-public-sub-public/apis/waybill/types'
import { removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import { useElementsChange } from '@order-public-sub-public/utils/cancel'
import { getWaybillSource } from '@order-public-sub-public/utils'
import { saveBatchId } from '@order-public-sub-public/configs'
import { cloneDeep, pick } from 'lodash-es'
import { handleInitQuery } from '@order-public-sub-root-pages/order-single/hooks/utils'
import { localStorage } from '@order-public-sub-public/utils/storage'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { handleElementsChange, beforeProcess, afterProcess, onProcessError } = useElementsChange()
const { remoteCheckDataHandOut } = useEffect()
const { estimateFeeProcessPolling } = useEstimateFeeResult()

/**
 * @description 组装过程中接口的入参
 * @param params
 * @param changeKey
 */
// const handleRemoteBatchCheckParams = (params: RemoteCheckParams) => {
//   const {
//     key,
//     orderPageType = piniaStore.root.getOrderPageType,
//     temporaryData,
//     moduleStyle,
//     waybillNumber,
//     pageName = orderPageType === OrderPageType.批量寄单票 ? 'order-batch-waybill' : getCurrentPageName(),
//   } = params

//   const keyList = typeof key === 'string' ? [key] : key

//   const container = moduleStyle || getModuleStyle(key as ChangeKeys)

//   const batchProcessQuery: BatchProcessQuery = {
//     elementsChange: keyList as ChangeKeys[],
//     container: container,
//     moduleStyle: container,
//     orderInfoList: [],
//     pageName,
//   }

//   if (orderPageType === OrderPageType.批量寄单票) {
//     batchProcessQuery.cacheStrategy = processCacheStrategy.强制不缓存
//   }

//   let commonData: Partial<OrderInfo> | null = null

//   if (orderPageType === OrderPageType.批量寄) {
//     commonData = filterTempData(temporaryData as OrderInfo)
//   }

//   const batchOrderInfo = piniaStore.order.orderStateByType(orderPageType) as unknown as BatchOrderInfo

//   // 如果公共部分有值接口只传公共部分
//   if (!isEmpty(commonData)) {
//     batchProcessQuery.commonWaybillInfo = {
//       waybillInfo: {
//         ...batchOrderInfo.commonWaybillInfo,
//         ...commonData,
//       },
//     }
//   }

//   // 处理orderInfoList
//   let orderInfoList: OrderInfo[] = []

//   if (orderPageType === OrderPageType.批量寄) {
//     if (key === 'init') {
//       // 新增收件人  选择优惠券场景
//       orderInfoList = [...(batchExtraData || [])]
//     } else if (key === 'coupon' || key?.split('.')[0] === 'receive') {
//       orderInfoList = [temporaryData as OrderInfo]
//     }
//   } else {
//     orderInfoList = [temporaryData as OrderInfo]
//   }

//   // 处理参数
//   // handleOrderParams(batchProcessQuery, params.orderPageType)

//   return {
//     batchProcessQuery,
//     waybillNumber,
//     keys: keyList,
//   }
// }

// eslint-disable-next-line max-lines-per-function, complexity
export const remoteBatchCheck = async (
  key?: ChangeKeys,
  temporaryData?: OrderInfo,
  moduleStyle?: ModuleStyle,
  batchExtraData?: OrderInfo[], // 新增一条收件人需要的参数
  extraParams?: Record<string, string | number | undefined>, // 扩展参数
  // eslint-disable-next-line max-params
) => {
  clearTimeout(batchProcessTimer.value)
  batchProcessLoading.value = true

  const currentPageName = getCurrentPageName() //当前页面路由名字

  // 批量这里第一个参数固定传一级模块名称，后面的为追加的不做处理
  const changeKey = key?.split('|') || []
  // if (changeKey.length) {
  //   changeKey[0] = changeKey[0].split('.')?.[0] || ''
  // }

  const orderPageType = piniaStore.root.getOrderPageType

  if (batchExtraData && batchExtraData.length > 0) {
    batchExtraData = batchExtraData.map((item) => {
      return { ...item, ...(filterTempData(temporaryData) as unknown as OrderInfo) }
    })
  }

  // eslint-disable-next-line complexity, no-async-promise-executor, max-lines-per-function
  const processPromise = new Promise(async (reslove, reject) => {
    const keyList: ChangeKeys[] = changeKey as ChangeKeys[]
    // 获取本次要发送的changeKeys
    const keys = handleElementsChange(keyList, beforeProcess) as ChangeKeys[]
    try {
      if (!changeKey) return

      let orderInfoList: OrderInfo[] = []
      const isOrderBatch = orderPageType === OrderPageType.批量寄
      const isOrderBatchWaybill = orderPageType === OrderPageType.批量寄单票

      if (isOrderBatch) {
        if (key === 'init') {
          // 新增收件人  选择优惠券场景
          orderInfoList = [...(batchExtraData || [])]
        } else if (key === 'coupon' || key?.split('.')[0] === 'receive') {
          orderInfoList = [temporaryData as OrderInfo]
        }
      } else {
        orderInfoList = [temporaryData as OrderInfo]
      }
      console.log('orderInfoList', orderInfoList)
      if (!extraParams && isOrderBatchWaybill) {
        extraParams = { cacheStrategy: '20' }
      }

      const commonWaybillInfo = getCommonWaybillInfo(orderPageType, key, temporaryData)

      const data = await useBatchProcess(
        {
          elementsChange: keys,
          container: moduleStyle || getModuleStyle(key, orderPageType),
          moduleStyle: moduleStyle || getModuleStyle(key, orderPageType),
          pageName: getCurrentPageName(isOrderBatchWaybill),
          orderInfoList: orderInfoList,
          commonWaybillInfo,
          ...(isOrderBatchWaybill ? { container: 'page' } : {}),
          ...(extraParams ? extraParams : {}),
        },
        keys,
      )

      const { resultData, restrictWaybillNumber } = handleAssembleData(data, key)
      piniaStore.globalData.setRestrictWaybillNumber({ waybillNumber: restrictWaybillNumber })

      // 处理过程中数据
      const isNotCacheStrategy = data?.cacheStrategy === processCacheStrategy.强制不缓存
      const { handleProcessData, handleBatchProcessData } = useStaticAndDynamicData()
      if (!isNotCacheStrategy) {
        handleProcessData(resultData)
      }

      //如果发起远程的页面已经发生变化，则不触发副作用
      if (currentPageName !== getCurrentPageName()) {
        return reject(false)
      }

      // 先清卡片的样式再处理副作用
      removeErrClassByDataValidate('batchWaybillInfoList' as ChangeKeys)

      remoteCheckDataHandOut(resultData)
        .then((res) => {
          // 更新数据判断
          if (key === 'init' || key === 'waybill' || isOrderBatch) {
            handleBatchProcessData({
              processdata: data?.waybillInfoList || [],
              key,
              commonWaybillInfo: data?.commonWaybillInfo,
              isNotCacheStrategy,
            })
          }
          getBatchNightFeeTip()
          reslove({
            data: res,
            status: true,
          })
        })
        .catch((err) => {
          if (data?.waybillInfoList) {
            // 更新数据判断
            if (isOrderBatch) {
              handleBatchProcessData({
                processdata: data?.waybillInfoList || [],
                key,
                commonWaybillInfo: data?.commonWaybillInfo,
                isNotCacheStrategy,
              })
            }
          }
          reject({
            data: err,
            status: false,
          })
        })
    } catch (error) {
      handleElementsChange(keys || [], onProcessError)
      reject({ data: error, status: false })
      console.log('过程中接口调用失败')
    } finally {
      // SET_PROCESS_LOADING
      piniaStore.globalData.setProcessLoading({ loading: false })
    }
  })
  piniaStore.globalData.setProcessPromise({ processPromise: processPromise })
  return processPromise
}

export const useBatchProcess = async (params: BatchProcessQuery, keys?: ChangeKeys[]) => {
  commonStopPolling()
  const waybillSource = await getWaybillSource()
  const { data } = await getBatchProcess({ ...params, waybillSource })
  if (keys) {
    handleElementsChange(keys || [], afterProcess)
  }
  if (data.taskId) {
    const response = await setBatchProcessPolling(data.taskId)

    return { ...response }
  }
}

export const useBatchPreProcess = async (taskId: string) => {
  commonStopPolling()
  if (taskId) {
    const response = await setBatchPreProcessPolling(taskId)

    return { ...response }
  }
}

/**
 * @description 轮询主函数，初始化场景
 * @param taskId
 */
const handleBatchProcessData = async ({ taskId, result }: { taskId: string; result: BatchProcessResultResponse }) => {
  const { data } = await getBatchProcessResult(taskId)
  if (data?.commonWaybillInfo) {
    result.commonWaybillInfo = data.commonWaybillInfo
  }

  result.waybillInfoList = data?.waybillInfoList ?? []

  return data
}

const handleBatchPreProcessData = async ({
  taskId,
  result,
}: {
  taskId: string
  result: BatchProcessResultResponse
}) => {
  const maxWaybillId =
    result?.waybillInfoList?.length > 0
      ? Number(result.waybillInfoList[result.waybillInfoList.length - 1].waybillId)
      : 0

  const initQuery = pick(handleInitQuery(), [
    'configId',
    'configVersion',
    'textCode',
    'exhibitionFlag',
    'channel',
    'departmentQrCodeId',
    'extendInfo',
    'orderNo',
  ])

  const baseParams = {
    cacheVersion: '',
    machine: localStorage?.getItem('userUuid') || '',
    maxWaybillId: maxWaybillId,
    taskId: taskId,
  }

  let extraParams = {}
  if (initQuery.channel === Channel.批量扫二维码) {
    extraParams = initQuery
  }
  const { data } = await getBatchFiledInit({
    ...baseParams,
    ...extraParams,
  })
  const batchInitProcessResponse = data?.batchInitProcessResponse
  if (batchInitProcessResponse?.commonWaybillInfo) {
    result.commonWaybillInfo = batchInitProcessResponse?.commonWaybillInfo
  }

  result.waybillInfoList = batchInitProcessResponse?.waybillInfoList ?? []

  // 如果batchId不为空，保存batchId
  if (data?.pageInitConfigResponse?.batchId && batchInitProcessResponse?.status === BatchInitPollingStatus.完成) {
    saveBatchId(data.pageInitConfigResponse.batchId, true, {
      fromType: 'handleBatchPreProcessData',
    })
    piniaStore.globalData.setInitConfig({ initConfig: cloneDeep(data.pageInitConfigResponse) })
  }

  return data
}

/**
 * @description 启动轮询
 * @param taskId
 */
const setBatchProcessPolling = async (taskId: string) => {
  const result: BatchProcessResultResponse = {} as BatchProcessResultResponse

  const data = await commonSetPolling({
    polling: handleBatchProcessData,
    timerName: 'handleBatchProcessData',
    delay: 500,
    args: { taskId: taskId, result: result },
    resolveStatus: (data) =>
      data.processStatus >= BatchPollingStatus.开始计算费用 ||
      (data.waybillInfoList && data.waybillInfoList.length > 0),
    finishStatus: (data) => [BatchPollingStatus.成功, BatchPollingStatus.结束].includes(data.processStatus),
  })
  batchProcessLoading.value = false
  // 批量时 默认费用和优惠券都loading，只使用taskId轮询 (司机取货，修改货好时间不调用费用)
  if (data.computeEstimateFee || data.computeCoupon) {
    estimateFeeProcessPolling({
      taskId: taskId,
      batchProcessResponse: data,
      computeEstimateFee: data?.computeEstimateFee,
      computeCoupon: data?.computeCoupon,
      orderPageType: OrderPageType.批量寄,
    })
  }
  return data
}

const setBatchPreProcessPolling = async (taskId: string) => {
  const result: BatchProcessResultResponse = {} as BatchProcessResultResponse

  const data = await commonSetPolling({
    polling: handleBatchPreProcessData,
    timerName: 'handleBatchPreProcessData',
    delay: 500,
    args: { taskId: taskId, result: result },
    resolveStatus: (data) =>
      data?.batchInitProcessResponse?.status >= BatchPollingStatus.开始计算费用 ||
      (data?.batchInitProcessResponse?.waybillInfoList && data?.batchInitProcessResponse?.waybillInfoList.length > 0),
    finishStatus: (data) =>
      // [BatchPollingStatus.成功, BatchPollingStatus.结束].includes(data?.batchInitProcessResponse?.status),
      data?.batchInitProcessResponse.status === BatchInitPollingStatus.完成,
  })
  batchProcessLoading.value = false
  // 批量时 默认费用和优惠券都loading，只使用taskId轮询 (司机取货，修改货好时间不调用费用)
  if (data?.batchInitProcessResponse?.computeEstimateFee || data?.batchInitProcessResponse?.computeCoupon) {
    estimateFeeProcessPolling({
      taskId: taskId,
      batchProcessResponse: data?.batchInitProcessResponse as unknown as BatchProcessResultResponse,
      computeEstimateFee: data?.batchInitProcessResponse?.computeEstimateFee,
      computeCoupon: data?.batchInitProcessResponse?.computeCoupon,
      isInit: true,
      orderPageType: OrderPageType.批量寄,
    })
  }

  return data?.batchInitProcessResponse
}
