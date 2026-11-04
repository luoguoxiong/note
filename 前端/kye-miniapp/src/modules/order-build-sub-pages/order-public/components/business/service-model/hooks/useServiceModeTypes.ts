import {
  ChangeKeys,
  OrderInfo,
  ServiceModeDimension,
  ServiceModeType,
  localCheckResult,
  RemoteCheckParams,
  CheckResponse,
  OrderResponse,
} from '@order-public-sub-public/types'
import { getCheckByComponentList } from '@order-public-sub-public/validate/utils'
import { omit, upperFirst, cloneDeep } from 'lodash-es'

import { ModuleType, OrderPageType, YesOrNoString } from '@order-public-sub-public/constants'
import { getBatchServiceModes, getServiceModes } from '@order-public-sub-public/apis'
import apm from '@order-public-sub-public/utils/apm-sdk'
import useEffect from '@order-public-sub-public/validate'
import { nextTick, ref } from 'vue'
import { CanceledError } from 'axios'
import { remoteBatchSingleCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchSingleProcess'
import { BatchOrderInfo } from '@order-public-sub-public/apis/types'
import { isBatchOrderPageType } from '@order-public-sub-public/store/utils'
import useServiceMode from './useServiceMode'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

// 保存下单的promise
export const saveOrderPromise = ref<Promise<CheckResponse | OrderResponse> | null>(null)

const CONNECTION_WITH_SERVICE_MODE = ['sender', 'receive', 'goodsTime', 'payMode', 'productInfo'] // 会影响服务方式的key

const DIRECTLY_CALL_SERVICE_MODE = [
  'productInfo.actualWeight',
  'productInfo.count',
  'productInfo.volumeSize',
  'productInfo.preWaybillGoodsSizeList',
] //直接调用服务方式的key

const { remoteCheck } = useEffect()

/**
 * @description 检查是否和服务方式有关
 * @param elementsChange
 * @returns
 */
const checkElementsChange = (elementsChange: ChangeKeys[]) => {
  return elementsChange?.some((key) => key && CONNECTION_WITH_SERVICE_MODE.toString().includes(key.split('.')[0]))
}

/**
 * @description 检查是否是直接调服务方式的key
 */
const checkDirectlyCallServiceModeKey = (elementsChange: ChangeKeys[]) => {
  return elementsChange.every((key) => key && DIRECTLY_CALL_SERVICE_MODE.includes(key))
}

/**
 * @description 检查影响服务方式key的表单的是否都通过了校验
 * @param elementsChange
 * @param orderInfo
 * @returns
 */
const checkOrderInfoFulfilled = async (elementsChange: ChangeKeys[]) => {
  const checkMapList: Array<() => Promise<localCheckResult>> = getCheckByComponentList(
    elementsChange.filter((key) => CONNECTION_WITH_SERVICE_MODE.includes(key)).map((key) => upperFirst(key)),
  )

  const result = await Promise.all(checkMapList.map((i) => i()))

  return result.every((item) => item.passed)
}

/**
 * @description 判断服务方式是否受影响
 * @param query
 */
const checkServiceModeError = (elementsChange: ChangeKeys[]) => {
  if (!checkElementsChange(elementsChange)) {
    return false
  }

  if (!checkOrderInfoFulfilled(elementsChange)) {
    return false
  }

  const serviceModeDimension = piniaStore.schema.moduleDimensionData(ModuleType.服务方式)

  return !serviceModeDimension?.serviceTypes.length
}

/**
 * @description 保存服务方式接口返回值
 * @param data
 * @param orderPageType
 */
const saveServiceModeResponse = (
  data: {
    serviceMode: ServiceModeType
    serviceModuleDimension: ServiceModeDimension
  },
  orderPageType: OrderPageType,
  waybillNumber?: string,
) => {
  const { serviceMode, serviceModuleDimension } = data

  if (orderPageType === OrderPageType.批量寄) {
    let moduleDimension = piniaStore.schema.getSchemaByType(orderPageType).schema.data

    // 批量改单条场景,需要用当前运单的服务方式组件数据而不是公共的
    const waybillModuleDimension = piniaStore.order.orderWaybillInfo(waybillNumber).moduleDimension
    if (waybillNumber && waybillModuleDimension) {
      moduleDimension = waybillModuleDimension
    }

    // saveModuleDimension(waybillNumber as string, { ...moduleDimension, serviceMode: serviceModuleDimension })
  } else {
    piniaStore.schema.updateModuleDimensionByType({
      data: serviceModuleDimension,
      type: ModuleType.服务方式,
    })
  }
  if (serviceMode) {
    piniaStore.order.updateOrderByType({
      type: ModuleType.服务方式,
      data: serviceMode,
      orderPageType,
      waybillNumber,
    })
  }
}

const getCurrentOrderInfo = (orderInfo: OrderInfo | BatchOrderInfo) => {
  if ((orderInfo as BatchOrderInfo)?.waybillInfoList) {
    return (orderInfo as BatchOrderInfo).waybillInfoList?.[0]?.waybillInfo || {}
  } else {
    return orderInfo as OrderInfo
  }
}

const clearServiceMode = (orderPageType?: OrderPageType, waybillNumber?: string) => {
  if (orderPageType === OrderPageType.批量寄) {
    const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList

    piniaStore.order.setBatchWaybillInfoList({
      waybillInfoList: batchWaybillInfoList.map((waybill) => {
        if (waybill.waybillNumber === waybillNumber) {
          waybill.waybillInfo.serviceMode = {
            ...waybill.waybillInfo.serviceMode,
            serviceMode: '',
            estimateArriveTime: undefined,
          }
          return waybill
        } else {
          return waybill
        }
      }),
    })
  } else {
    const { updateServiceMode } = useServiceMode()
    updateServiceMode('')
  }
}

/**
 * @description 处理服务方式接口主函数
 * @param orderPageType
 */
export const handleServiceMode = async (
  initFlag = YesOrNoString.NO,
  orderInfo = piniaStore.order.orderState,
  orderPageType = piniaStore.root.getOrderPageType,
) => {
  let callFlag = false // 继续调用process标识
  piniaStore.globalData.serServiceModeLoading({ loading: true })
  try {
    // 错开原本的发送process，否则有一定概率撞车取消正常process请求
    const processPromise = piniaStore.globalData.processPromise
    if (processPromise) {
      await processPromise
    }
  } catch (error) {
    console.log(error, '正常通过')
    piniaStore.globalData.serServiceModeLoading({ loading: false })
  }

  const getServiceModesMap = {
    [OrderPageType.单票]: getServiceModes,
    [OrderPageType.返程单]: getServiceModes,
    [OrderPageType.预览]: undefined,
    [OrderPageType.批量寄]: undefined,
    [OrderPageType.批量寄单票]: getBatchServiceModes,
  }

  const currentOrderInfo = getCurrentOrderInfo(orderInfo)

  // 保存数据时，仅在抽屉打开的场景下使用批量修改单条
  const globalOrderPageType = piniaStore.root.getOrderPageType

  try {
    await nextTick()

    const getServiceModeFunc = getServiceModesMap[orderPageType]
    if (!getServiceModeFunc) {
      return
    }
    const _currentOrderInfo = cloneDeep(currentOrderInfo)
    const { data: serviceModeItem } = await getServiceModeFunc({ orderInfo: currentOrderInfo, initFlag })
    callFlag = serviceModeItem.callFlag
    const { serviceMode, ...serviceModuleDimension } = omit(serviceModeItem, ['callFlag'])

    if (serviceMode) {
      currentOrderInfo.serviceMode = serviceMode
    }

    saveServiceModeResponse(
      {
        serviceMode: serviceMode || _currentOrderInfo?.serviceMode,
        serviceModuleDimension,
      },
      globalOrderPageType,
      currentOrderInfo.waybillNumber,
    )
    piniaStore.globalData.setServiceModeError({ error: false })
  } catch (error) {
    if (!(error instanceof CanceledError)) {
      // 如果保存了需要设置服务方式缺省页
      apm.reportError(new Error('获取服务方式失败'))
      piniaStore.globalData.setServiceModeError({ error: true })
      clearServiceMode(globalOrderPageType, currentOrderInfo.waybillNumber)
      throw error
    }
  } finally {
    piniaStore.globalData.serServiceModeLoading({ loading: false })
  }

  // callFlag为true说明服务方式被默认选中了，需要再次触发process
  // 如果下单接口正在执行中，不要再调用process
  if (callFlag && !saveOrderPromise.value) {
    if (isBatchOrderPageType(orderPageType)) {
      remoteBatchSingleCheck({ key: 'serviceMode.serviceMode', temporaryData: currentOrderInfo })
    } else {
      remoteCheck('serviceMode.serviceMode', undefined, undefined, null, { callFlag })
    }
  }
  piniaStore.globalData.serServiceModeLoading({ loading: false })
}

const getOrderInfo = (orderPageType: OrderPageType, tempOrderInfo?: Partial<OrderInfo>) => {
  if (orderPageType === OrderPageType.批量寄单票) {
    return tempOrderInfo as OrderInfo
  } else {
    const orderInfo = cloneDeep(piniaStore.order.orderStateByType(orderPageType)) as OrderInfo
    return tempOrderInfo ? Object.assign({}, orderInfo, tempOrderInfo) : undefined
  }
}

/**
 * @description 往数据里填充服务方式，仅单票使用
 * @param data
 */
export const fillServiceModeInData = async (
  data?: ServiceModeDimension & { serviceModeFlag: boolean; initFlag?: YesOrNoString },
  tempOrderInfo?: Partial<OrderInfo>,
  orderPageType = piniaStore.root.getOrderPageType,
) => {
  // serviceModeFlag为true才需要调取服务方式接口
  if (data?.serviceModeFlag) {
    await nextTick()
    await handleServiceMode(
      data?.initFlag ?? YesOrNoString.NO,
      getOrderInfo(orderPageType, tempOrderInfo),
      orderPageType,
    )
  }
}

/**
 * @description 处理服务方式异常
 * @param query
 */
export const handleServiceModeError = (elementsChange: ChangeKeys[], params: RemoteCheckParams) => {
  if (checkServiceModeError(elementsChange as ChangeKeys[])) {
    piniaStore.globalData.setServiceModeError({ error: true, remoteCheckParams: params })
    clearServiceMode()
  }
}

/**
 * @description 检查elementsChange判断是否需要调用服务方式
 * @param elementsChange
 * @param orderPageType
 */
export const checkAndGetServiceMode = (params: { elementsChange: ChangeKeys[]; orderInfo: OrderInfo }) => {
  const { elementsChange, orderInfo } = params
  if (checkDirectlyCallServiceModeKey(elementsChange)) {
    handleServiceMode(YesOrNoString.NO, orderInfo)
  }
}
