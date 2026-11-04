import { preloadOrderData } from '@order-public-sub-public/apis'
import { BatchSingleProcessResponse } from '@order-public-sub-public/apis/types'
import { BusinessLogic } from '@order-public-sub-public/apis/waybill/types'
import { fillServiceModeInData } from '@order-public-sub-public/components/business/service-model/hooks/useServiceModeTypes'
import { OrderPageType, OrderSceneType } from '@order-public-sub-public/constants'

// import { OrderPageType } from '@order-public-sub-public/constants'
//
import { ChangeKeys, CheckResponse, ProcessHandleOptions, localCheckResult } from '@order-public-sub-public/types'
import { getCheckByComponentList } from '@order-public-sub-public/validate/utils'
import { lowerFirst } from 'lodash-es'
import { preLoadCouponStatic } from '@order-public-sub-root-pages/order-single/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const handleServiceMode = async (data: CheckResponse, options?: ProcessHandleOptions) => {
  // 处理服务方式逻辑
  const { changeKeys, processQuery, orderPageType } = options || {}
  // 当elementsChange不为waybill时，且moduleDimension不为空时才处理服务方式逻辑
  if (!changeKeys?.includes('waybill') && data?.moduleDimension) {
    const { serviceMode, serviceModeFlag = false } = data?.moduleDimension
    await fillServiceModeInData({ ...serviceMode, serviceModeFlag }, processQuery?.orderInfoList?.[0], orderPageType)
  }
}

/**
 * @description allCheck青春版，仅返回校验结果
 * @param elementsChange
 * @param orderInfo
 * @returns
 */
export const checkOrderInfoFulfilled = async (componentList: string[]) => {
  const checkMapList: Array<() => Promise<localCheckResult>> = getCheckByComponentList(componentList)

  const result = await Promise.all(checkMapList.map((i) => i()))

  return result.flat().every((item) => item.passed)
}

/**
 * @description 通知后端预加载数据，仅当后端和前端同时校验通过才会调用
 */
const preloadWaybill = async (data: CheckResponse, options?: ProcessHandleOptions) => {
  if (!options?.processQuery) {
    return
  }
  const componentList = (piniaStore.globalData.componentList || []).filter((comp) => !comp.includes('EstimatedCost'))
  const triggerWaybillKeys = [
    'sender.addressBook',
    'receive.addressBook',
    'goodsTime.goodsTime',
    'serviceMode.serviceMode',
    'protectPrice.declarativeValue',
    'dispatchInformation',
    'waybillRemark',
    'messageToDriver',
  ]
  const hasComponentKey = componentList
    .map((comp) => lowerFirst(comp))
    .concat(triggerWaybillKeys)
    ?.find((comp) => options?.processQuery.elementsChange?.includes(comp as ChangeKeys))
  if (data.status && hasComponentKey) {
    try {
      const status = await checkOrderInfoFulfilled(componentList)
      if (status) {
        const { orderInfo, ...queryExceptOrderInfo } = options.processQuery
        const query = {
          ...queryExceptOrderInfo,
          waybillInfo: orderInfo,
          type: OrderSceneType.SINGLE,
        }
        preloadOrderData(query)
      }
    } catch (error) {
      console.log('没有通过全量表单校验,吃掉这个异常')
    }
  }
}

/**
 * @description 单票处理函数
 * @param data
 * @param options
 */
const single = async (data: CheckResponse, options?: ProcessHandleOptions) => {
  // 处理通知后端预加载逻辑
  preloadWaybill(data, options)
  // 处理服务方式逻辑
  await handleServiceMode(data, options)
  preLoadCouponStatic()
}

/**
 * @description 返程单单票处理函数
 * @param data
 * @param options
 */
const orderBack = (data: CheckResponse, options?: ProcessHandleOptions) => {
  // 处理服务方式逻辑
  handleServiceMode(data, options)
}

/**
 * @description 批量单条处理函数
 * @param data
 * @param options
 */
const batchSingle = async (data: BatchSingleProcessResponse, options?: ProcessHandleOptions) => {
  const waybillInfoList = data.batchProcessResponse.waybillInfoList
  if (Array.isArray(waybillInfoList) && waybillInfoList.length > 0) {
    // 处理服务方式逻辑
    await handleServiceMode(waybillInfoList[0], options)
  }
}

// 单票、返程单、批量寄单票已启用
const map = {
  [OrderPageType.单票]: single,
  // [OrderPageType.修改]: single,
  // [OrderPageType.批量]: undefined,
  [OrderPageType.批量寄单票]: batchSingle,
  // [OrderPageType.批量导入]: undefined,
  [OrderPageType.返程单]: orderBack,
}

/**
 * @description 处理业务逻辑，目前仅单票生效
 * @param data
 * @param options
 */
export const handleBusinessLogic = async (
  data: CheckResponse | BatchSingleProcessResponse,
  options?: ProcessHandleOptions,
) => {
  const { orderPageType = piniaStore.root.getOrderPageType } = options || {}
  const func = map[orderPageType as OrderPageType.单票 | OrderPageType.返程单 | OrderPageType.批量寄单票]
  if (func) {
    await func(data as CheckResponse & BatchSingleProcessResponse, options)
  }
}

/**
 * @description 无论process返回的结果是否阻塞下单都会执行的逻辑
 * @param data
 * @param resolve
 */
const handleProcessResolve = async (
  data: unknown,
  resolve: (value: unknown) => void,
  orderPageType?: OrderPageType,
) => {
  try {
    const { businessLogic } = data as BusinessLogic
    await handleBusinessLogic(businessLogic.data, { ...businessLogic.options, orderPageType })
  } catch (error) {
    console.log(error)
  } finally {
    resolve(true)
    piniaStore.globalData.serServiceModePromise({
      serviceModePromise: null,
    })
  }
}

/**
 * @description processPromise结束后，调用服务方式在内的业务逻辑
 * @param processPromise
 */
export const callBusinessLogic = (processPromise: Promise<unknown>, orderPageType?: OrderPageType) => {
  return new Promise((resolve) => {
    processPromise
      .then(async (data) => {
        handleProcessResolve(data, resolve, orderPageType)
      })
      .catch((error) => {
        if (error?.businessLogic) {
          handleProcessResolve(error, resolve, orderPageType)
        } else {
          //过程接口报错，服务方式promise设置为null，保证其他地方不会卡在服务方式的pending
          piniaStore.globalData.serServiceModePromise({ serviceModePromise: null })
        }
      })
  })
}
