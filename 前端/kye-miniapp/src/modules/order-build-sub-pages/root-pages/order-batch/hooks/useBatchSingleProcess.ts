import {
  ChangeKeys,
  OrderInfo,
  CheckDetail,
  CheckResponse,
  RemoteSingleCheckParams,
  ExtraRemoteCheckParams,
} from '@order-public-sub-public/types'
import { ModuleStyle, OrderPageType } from '@order-public-sub-public/constants'
import { useElementsChange } from '@order-public-sub-public/utils/cancel'
import {
  batchProcessLoading,
  batchProcessTimer,
  filterTempData,
  getElementsChange,
  handleAssembleData,
} from './useBatchProcessUtils'
import { getCurrentPageName, getModuleStyle } from '@order-public-sub-public/validate/utils'

import useEffect from '@order-public-sub-public/validate'
import { getBatchSingleProcess } from '@order-public-sub-public/apis/batch/index'
import { BatchSingleProcessResponse } from '@order-public-sub-public/apis/batch/types'
import { useStaticAndDynamicData } from '@order-public-sub-public/hooks/useStaticAndDynamicData'
import { useEstimateFeeResult } from '@order-public-sub-public/hooks/estimated-cost/useProcess'
import { ref } from 'vue'
import { commonStopPolling } from '@order-public-sub-public/hooks/usePolling'
import { filterFiledSpace } from '@order-public-sub-public/utils'
import { callBusinessLogic } from '@order-public-sub-public/hooks/handleBusinessLogic'
import { CanceledError } from 'axios'
import { handleServiceModeError } from '@order-public-sub-public/components/business/service-model/hooks/useServiceModeTypes'
import { isEmpty } from 'lodash-es'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { remoteCheckDataHandOut } = useEffect()
const { estimateFeeProcessPolling } = useEstimateFeeResult()
const { handleElementsChange, beforeProcess, afterProcess, onProcessError, resetElementsChange } = useElementsChange()
export const currentElementsChange = ref('')

/**
 * @description 根据singleProcess结果计算费用
 * @param data
 * @param key
 */
export const feeResult = async (data: BatchSingleProcessResponse, key?: ChangeKeys, couponBatch?: boolean) => {
  // 新增类型extraParams， 用于判断批量首页优惠券选择时, 卡片跳转到收件人信息修改返回也需要更新首页
  const updateHomeFee = couponBatch || (key && ['receive'].includes(key))
  if (data.computeCoupon || data.computeEstimateFee) {
    await estimateFeeProcessPolling({
      taskId: data.taskId,
      batchProcessResponse: data,
      computeEstimateFee: data?.computeEstimateFee,
      computeCoupon: data?.computeCoupon,
      key,
      orderPageType: updateHomeFee ? OrderPageType.批量寄 : OrderPageType.批量寄单票,
    })
  }
}

/**
 * @description 组装接口入参的elementsChange，优化之前的嵌套三元
 * @param key
 * @param keys
 * @returns
 */
const handleRemoteBatchSingleElementsChange = (key: ChangeKeys | undefined, keys: ChangeKeys[]) => {
  let elementsChange = keys
  // 命中管控确认场景，携带额外key
  if (key === 'waybill.confirm.restrict') {
    elementsChange = ['waybill', 'waybill.confirm.restrict']
  } else if (key?.includes('onlyEstimateFee')) {
    elementsChange = getElementsChange(key) as ChangeKeys[]
  }

  return elementsChange
}

/**
 * @description 处理入参
 * @param params
 * @returns
 */
const handleRemoteBatchSingleParams = (params: {
  elementsChange: ChangeKeys[]
  key?: ChangeKeys
  moduleStyle?: ModuleStyle
  orderInfoList: OrderInfo[]
  orderPageType: OrderPageType
  temporaryData?: OrderInfo
  extraParams?: RemoteSingleCheckParams['extraParams']
}) => {
  const { elementsChange, moduleStyle, key, orderInfoList, orderPageType, temporaryData, extraParams } = params

  const getCommonWaybillInfo = () => {
    if (orderPageType === OrderPageType.批量寄 && key !== 'init') {
      const waybillInfo = filterTempData(temporaryData)
      if (isEmpty(waybillInfo)) {
        return {}
      }
      return { commonWaybillInfo: { waybillInfo: filterTempData(temporaryData) } }
    } else {
      return {}
    }
  }

  const container = orderPageType === OrderPageType.批量寄单票 ? { container: 'page' } : {}

  const _extraParams = extraParams ? extraParams : {}

  const callFlag = _extraParams?.callFlag || false

  const requestParams = {
    elementsChange: elementsChange as ChangeKeys[],
    container: moduleStyle || getModuleStyle(key),
    moduleStyle: moduleStyle || getModuleStyle(key),
    pageName: getCurrentPageName(),
    orderInfoList: orderInfoList,
    ...getCommonWaybillInfo(),
    ...container,
    ..._extraParams,
    callFlag,
  }

  return requestParams
}

/**
 * @description 组装orderInfoList
 * @param params
 * @returns
 */
const getOrderInfoList = (params: RemoteSingleCheckParams & { orderPageType: OrderPageType }) => {
  let orderInfoList: OrderInfo[] = []
  const { temporaryData, key, orderPageType } = params

  let batchExtraData = params.batchExtraData

  if (batchExtraData && batchExtraData?.length > 0) {
    batchExtraData = batchExtraData.map((item) => {
      return { ...item, ...(filterTempData(temporaryData) as unknown as OrderInfo) }
    })
  }
  const prefixKey = key?.split('.')[0] || ''
  if (orderPageType === OrderPageType.批量寄) {
    if (key === 'init') {
      // 新增收件人  选择优惠券场景
      orderInfoList = [...(batchExtraData || [])]
    } else if (key === 'coupon' || ['receive', 'serviceMode'].includes(prefixKey)) {
      orderInfoList = [temporaryData as OrderInfo]
    }
  } else {
    orderInfoList = [temporaryData as OrderInfo]
  }
  return orderInfoList
}

/**
 * @description 初始化特殊处理checkResultList
 * @param params
 */
const handleInitCheckResultList = (params: {
  key?: ChangeKeys
  resultData: CheckResponse
  data: BatchSingleProcessResponse
}) => {
  const { key, resultData, data } = params
  if (key === 'init') {
    resultData.checkResultList =
      data?.batchProcessResponse?.commonWaybillInfo?.checkResultList &&
      data?.batchProcessResponse?.commonWaybillInfo?.checkResultList?.length > 0
        ? (data?.batchProcessResponse?.commonWaybillInfo?.checkResultList as CheckDetail[])
        : (data?.batchProcessResponse?.waybillInfoList?.[0]?.checkResultList as CheckDetail[])
  }
}

/**
 * @description 接口调用完成后处理数据
 * @param params
 * @returns
 */
const actionsAfterCallSingleProcess = (params: {
  data: BatchSingleProcessResponse
  key?: ChangeKeys
  keys: ChangeKeys[]
  orderPageType: OrderPageType
  temporaryData?: OrderInfo
  processQuery: ReturnType<typeof handleRemoteBatchSingleParams>
}) => {
  const { data, key, keys, orderPageType, temporaryData, processQuery } = params
  const { resultData, restrictWaybillNumber } = handleAssembleData(data?.batchProcessResponse)

  handleInitCheckResultList({ key, resultData, data })

  piniaStore.globalData.setRestrictWaybillNumber({ waybillNumber: restrictWaybillNumber })

  // 处理过程中数据
  const { handleProcessData, handleBatchProcessData } = useStaticAndDynamicData()

  handleProcessData(resultData)

  // 处理批量过程中数据
  if (data?.batchProcessResponse?.waybillInfoList) {
    if (key === 'init' || orderPageType === OrderPageType.批量寄) {
      handleBatchProcessData({
        processdata: data?.batchProcessResponse?.waybillInfoList,
        key,
      })
    }
  }
  handleElementsChange(keys || [], afterProcess)

  // 如果为提交，结束后清空被嘎调的key
  if (keys.includes('waybill')) {
    resetElementsChange()
  }

  return {
    resolveData: {
      data,
      businessLogic: {
        data,
        options: { tempOrderInfo: filterFiledSpace(temporaryData as OrderInfo), processQuery },
      },
      status: true,
    },
    resultData,
  }
}

/**
 * @description 处理process异常，判断是否会引起服务方式异常
 * @param params
 */
const handleSingleProcessError = (params: {
  error: unknown
  key?: ChangeKeys
  keys: ChangeKeys[]
  orderPageType: OrderPageType
  temporaryData?: OrderInfo
  moduleStyle?: ModuleStyle
  extraParams?: RemoteSingleCheckParams['extraParams']
}) => {
  const { error, key, keys, temporaryData, moduleStyle, extraParams } = params
  if (!(error instanceof CanceledError)) {
    const keyParams = key || []
    handleServiceModeError(keys, {
      key: keyParams,
      temporaryData,
      moduleStyle,
      cacheStrategy: extraParams?.cacheStrategy ? +extraParams.cacheStrategy : undefined,
      extraRemoteCheckParams: extraParams as ExtraRemoteCheckParams,
    })
  }
  console.log('过程中接口调用失败', error)
}

/**
 * @description 处理副作用函数
 * @param params
 */
const handleEffect = (params: {
  resolve: (value: unknown) => void
  reject: (value: unknown) => void
  resultData: CheckResponse
  data: BatchSingleProcessResponse
  key?: ChangeKeys
  couponBatch?: boolean
  resolveData: ReturnType<typeof actionsAfterCallSingleProcess>['resolveData']
}) => {
  const { resolve, reject, resultData, data, key, couponBatch, resolveData } = params
  remoteCheckDataHandOut(resultData, key)
    .then(async () => {
      const storeFormData = piniaStore.order.orderWaybillInfo()?.waybillInfo || {}
      if (storeFormData?.coupon?.couponCode || key === 'waybill') {
        // 选择过优惠券 || 点确定时， 等待费用计算完成
        try {
          await feeResult(data, key, couponBatch)
        } catch (error) {
          reject({
            data: '费用轮询失败',
            status: false,
          })
        }
      } else {
        feeResult(data, key, couponBatch)
      }
      resolve({ ...resolveData, status: true })
    })
    .catch((err) => {
      feeResult(data, key, couponBatch)
      resolveData.data = err
      reject({ ...resolveData, status: false })
    })
}

/**
 * @description 创建promise,singleProcess核心函数
 * @param params
 * @returns
 */
const createSingleProcessPromise = (
  params: RemoteSingleCheckParams & {
    changeKey: keyof OrderInfo
    orderPageType: OrderPageType
    currentPageName: string
  },
) => {
  const {
    key,
    changeKey,
    batchExtraData,
    temporaryData,
    orderPageType,
    moduleStyle,
    extraParams,
    currentPageName,
    couponBatch,
  } = params
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const keyList: ChangeKeys[] = [key] as ChangeKeys[]
    // 获取本次要发送的changeKeys
    const keys = handleElementsChange(keyList, beforeProcess) as ChangeKeys[]
    try {
      if (changeKey) {
        const orderInfoList: OrderInfo[] = getOrderInfoList({
          batchExtraData,
          temporaryData,
          key,
          orderPageType,
        })
        const elementsChange = handleRemoteBatchSingleElementsChange(key, keys)
        const processQuery = handleRemoteBatchSingleParams({
          elementsChange,
          moduleStyle,
          key,
          orderInfoList,
          extraParams,
          orderPageType,
          temporaryData,
        })
        const { data } = await getBatchSingleProcess(processQuery)
        const { resolveData, resultData } = actionsAfterCallSingleProcess({
          processQuery,
          data,
          key,
          keys,
          temporaryData,
          orderPageType,
        })
        // 如果发起远程的页面已经发生变化，则不触发副作用
        if (currentPageName !== getCurrentPageName() && currentPageName !== 'iframe-coupon') {
          // 如果调过程中路由发生了变化 此处return了 不会走下面的管控 导致没有算费用
          feeResult(data, key, couponBatch)
          return reject({ ...resolveData, status: false })
        }
        // 批量单条保存时，不在这里处理副作用，避免重复
        if (extraParams?.noHandout) {
          commonStopPolling('estimateFee')
          feeResult(data, key, couponBatch)
          return resolve(data)
        }
        handleEffect({ resolve, reject, key, resultData, resolveData, data, couponBatch })
      }
    } catch (error) {
      handleElementsChange(keys || [], onProcessError)
      reject({ data: error, status: false })
      handleSingleProcessError({ error, temporaryData, key, keys, orderPageType, moduleStyle })
    } finally {
      piniaStore.globalData.setProcessLoading({ loading: false })
    }
  })
}

/**
 * @description 批量修改单条singleProcess过程函数
 * @param remoteSingleCheckParams
 * @returns
 */
export const remoteBatchSingleCheck = async (remoteSingleCheckParams: RemoteSingleCheckParams) => {
  clearTimeout(batchProcessTimer.value)
  batchProcessLoading.value = true

  const { key, orderPageType = piniaStore.root.getOrderPageType } = remoteSingleCheckParams
  const currentPageName = getCurrentPageName() //当前页面路由名字
  const changeKey = (key?.split('.')?.[0] || '') as keyof OrderInfo
  currentElementsChange.value = changeKey

  const extraParams = remoteSingleCheckParams?.extraParams // 扩展参数
  if (!extraParams && orderPageType === OrderPageType.批量寄单票) {
    remoteSingleCheckParams.extraParams = { cacheStrategy: '20' }
  }

  const processPromise = createSingleProcessPromise({
    ...remoteSingleCheckParams,
    currentPageName,
    orderPageType,
    changeKey,
  })

  piniaStore.globalData.setProcessPromise({ processPromise: processPromise })

  // 点击下单时，不需要再处理后续业务逻辑
  if (!extraParams?.noHandout) {
    // 在批量寄场景时调用singleProcess需要await，否则不需要
    if (orderPageType === OrderPageType.批量寄) {
      await callBusinessLogic(processPromise, OrderPageType.批量寄单票)
    } else {
      callBusinessLogic(processPromise, OrderPageType.批量寄单票)
    }
  }

  return processPromise
}
