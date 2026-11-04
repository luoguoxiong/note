/**
 * @description 保存和处理initConfig、initData和process接口获取到的数据
 */
import {
  CheckResponse,
  InitDataResponse,
  Module,
  ModuleDimension,
  OrderInfo,
  OrderResponse,
  RestrictData,
} from '@order-public-sub-public/types'
import {
  BatchOrderInfo,
  BatchProcessResultResponse,
  CommonProcessWaybillInfo,
  WaybillInfoList,
} from '@order-public-sub-public/apis/batch/types'

import useEffect from '@order-public-sub-public/validate'
import {
  BaseCheckResponse,
  ConfigDimension,
  DynamicConfig,
  InitResponse,
  StaticConfig,
} from '@order-public-sub-public/apis/types'
import { uncapitalLize } from '@order-public-sub-public/utils/string'
import { cloneDeep, isNull, merge, pick } from 'lodash-es'
import { schema } from '@order-public-sub-public/configs/initData'
import { getWaybillSource } from '@order-public-sub-public/utils'
import { useOrderCustomerAndWayBillStatus } from '@order-public-sub-root-pages/order-single/hooks/useOrderCustomerAndWayBill'
import { getBatchId, getChannel, waybillInfo as originWaybillInfo } from '@order-public-sub-public/configs'
import { Channel, CoreApiType, ModuleType, OrderPageType, WaybillFlagType } from '@order-public-sub-public/constants'
import { nextTick } from 'vue'
import { useDoms } from './useDoms'
import { handleBusinessLogic } from './handleBusinessLogic'
import { getCurrentPageName, bathValidateToSingle, awaitPageShow } from '@order-public-sub-public/validate/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { remoteCheckDataHandOut, allCheck } = useEffect()

type ResponseData = InitResponse | InitDataResponse | CheckResponse | OrderResponse

enum IgnoreDynamicConfigModule {
  '本人签收' = 'SelfSign',
}

/**
 * @description 保存当前运单号的静态配置和运单数据
 */
const saveStaticAndWaybillInfo = () => {
  const staticConfig = piniaStore.schema.currentSchema
  const waybillInfo = piniaStore.order.orderState
  const dynamicConfig = piniaStore.globalData.currentDynamicConfig
  // 下单公司配置
  const orderCustomer = piniaStore.schema.orderCustomer

  const batchId = getBatchId()

  piniaStore.globalData.setStaticConfigAndWaybillInfo({
    staticConfig,
    waybillInfo,
    dynamicConfig,
    batchId,
    orderCustomer,
  })
}

/**
 * @description 保存管控数据
 */
const saveRestrictData = (restrictData?: RestrictData) => {
  if (restrictData) {
    piniaStore.globalData.setRestrictData({ restrictData: restrictData || ({} as RestrictData) })
    // const orderPageType = piniaStore.root.getOrderPageType
    // if (orderPageType === OrderPageType.批量寄单票) {
    //   piniaStore.order.updateOrderRestrictByNumber({
    //     data: restrictData,
    //     orderPageType: OrderPageType.批量寄,
    //   })
    // }
  }
}

/**
 * @description 保存上一次的配置数据
 */
const savePreConfig = (staticConfig: StaticConfig) => {
  const preConfig = pick(staticConfig, ['configId', 'versionId', 'themeName'])
  piniaStore.globalData.setPreConfig({
    preConfig: {
      preConfigId: preConfig.configId,
      preVersionId: preConfig.versionId,
      preThemeName: preConfig.themeName,
    },
  })
}

/**
 * @description 保存当前的配置数据
 */
const saveCurrentConfig = (staticConfig: StaticConfig) => {
  piniaStore.globalData.setCurrentConfig({
    currentConfig: pick(staticConfig, ['configId', 'versionId', 'themeName', 'currentThemeName']),
  })
}

/**
 * @description 将动态数据合并到静态数据中
 * @param dynamicConfig
 * @param module
 */
const handleDynamicConfig = (dynamicConfig: DynamicConfig, module: Record<string, Module>) => {
  let currentType = ''
  for (const key in module) {
    if (module[key].type === IgnoreDynamicConfigModule.本人签收) continue
    currentType = uncapitalLize(module[key].type as string)
    // 如果能匹配上，且逻辑重新执行了就合并到静态配置中
    if (dynamicConfig?.[currentType as keyof DynamicConfig]) {
      const targetDynamicConfig = dynamicConfig[currentType as keyof DynamicConfig]
      module[key] = {
        ...module[key],
        ...targetDynamicConfig,
        visible: module[key].visible && targetDynamicConfig.visible,
        config: {
          ...module[key].config,
          ...targetDynamicConfig,
          visible: module[key].visible && targetDynamicConfig.visible,
        },
      }
    }
  }
}

/**
 * @description 处理配置维度数据
 * @param configDimension
 */
const handleConfigDimension = (
  configDimension: ConfigDimension,
  coreApiType: CoreApiType,
  orderPageType?: OrderPageType,
) => {
  const { staticConfig, dynamicConfig } = configDimension
  let realStaticConfig: StaticConfig = {} as StaticConfig
  if (orderPageType === OrderPageType.批量寄 && coreApiType === CoreApiType.INIT) {
    realStaticConfig = staticConfig
      ? { ...piniaStore.schema.currentSchema, ...staticConfig }
      : piniaStore.schema.currentSchema
  } else {
    realStaticConfig = staticConfig ? staticConfig : piniaStore.schema.currentSchema
  }
  // 如果动态配置不为null，合并到静态配置中，并独立保存在globalData
  if (!isNull(dynamicConfig)) {
    piniaStore.globalData.setDynamicConfig({
      dynamicConfig: dynamicConfig,
    })
    // 如果静态数据为空，则合并到当前store保存的静态数据中
    handleDynamicConfig(dynamicConfig, realStaticConfig.schema?.module)
  }

  return realStaticConfig
}

/**
 * @description 处理保存静态数据，如果为空，说明后端数据异常，不处理，返回兜底数据
 */
const handleSaveConfigDimension = (
  configDimension: ConfigDimension,
  coreApiType: CoreApiType,
  orderPageType = piniaStore.root.getOrderPageType,
) => {
  // 接口返回数据为空处理逻辑
  if (isNull(configDimension)) {
    if (coreApiType === CoreApiType.INIT) {
      return { schema }
    } else {
      return piniaStore.schema.currentSchema
    }
  }

  /**
   * 初始化必然要使用接口返回的数据，无需处理
   * 过程中只需要保存configId、themeName,versionId
   */
  if (isNull(configDimension.staticConfig)) {
    configDimension.staticConfig = piniaStore.schema.currentSchema
  } else {
    if (coreApiType !== CoreApiType.INIT) {
      // 如果在过程中获取到的静态配置不为空，保存上一次的配置
      if (!isNull(configDimension.staticConfig)) {
        savePreConfig(piniaStore.schema.currentSchema)
        saveCurrentConfig(configDimension.staticConfig)
      }
      configDimension.staticConfig = piniaStore.schema.currentSchema
    } else {
      saveCurrentConfig(configDimension.staticConfig)
      savePreConfig({ ...piniaStore.schema.currentSchema, configId: '', versionId: '', themeName: '' })
    }
  }

  const staticConfig = handleConfigDimension(configDimension, coreApiType)
  // 将动态配置一起写入schema
  piniaStore.schema.updateSchema({
    staticConfig: { ...staticConfig, schema: { ...staticConfig.schema } },
    orderPageType,
  })

  return staticConfig
}

/**
 * @description 保存配置维度数据
 */
const saveConfigDimension = (configDimension: ConfigDimension, coreApiType: CoreApiType) => {
  // 如果存在配置维度数据，则保存
  if (configDimension && coreApiType !== CoreApiType.SAVE) {
    handleSaveConfigDimension(configDimension, coreApiType)
  }
}

/**
 * @description 保存模块数据
 */
const saveModuleDimension = (moduleDimension: ModuleDimension) => {
  // 如果存在moduleDimension，则保存
  if (moduleDimension) {
    // 写入业务组件动态数据
    piniaStore.schema.updateData({
      data: moduleDimension,
    })
  }
}

/**
 * @description 保存是否需要显示绑码弹窗
 */
const saveNeedBindCustomerCode = (responseData: ResponseData) => {
  piniaStore.extend.updateOrderCustomer({
    orderCustomer: {
      needBindCustomerCode: (responseData as CheckResponse)?.needBindCustomerCode || false,
    },
  })
}

/**
 * @description 保存waybillInfo运单数据
 */
export const saveWaybillInfo = (responseData: CheckResponse) => {
  if (responseData?.waybillInfo) {
    // 写入表单
    piniaStore.order.updateOrder({ data: responseData?.waybillInfo })
  }
}

/**
 * @description 更新运单号
 */
export const updateOrderWaybillNumber = (waybillNumber: string) => {
  piniaStore.order.updateOrder({
    data: {
      waybillNumber,
    } as OrderInfo,
  })
}

/**
 * @description 通用处理接口返回值函数
 * @param responseData
 */
const commonHandleData = (responseData: ResponseData, coreApiType: CoreApiType) => {
  // 保存配置数据
  saveConfigDimension(Reflect.get(responseData, 'configDimension'), coreApiType)

  // 保存管控数据
  if (responseData && 'restrictData' in responseData) {
    saveRestrictData(responseData?.restrictData)
  }

  // 保存模块数据
  saveModuleDimension(Reflect.get(responseData, 'moduleDimension'))

  // 保存checkResultList，增值服务回单使用
  if (responseData && 'checkResultList' in responseData) {
    piniaStore.globalData.setCheckResultList({
      checkResultList: responseData?.checkResultList,
    })
  }

  // 保存运单数据
  saveWaybillInfo(responseData as CheckResponse)
}

/**
 * @description 保存sender的推荐地址动态数据，处理下单准入
 * @param baseCheckData
 */
const handleBaseCheckData = (baseCheckData: BaseCheckResponse) => {
  try {
    const { sender } = baseCheckData
    piniaStore.schema.updateModuleDimensionByType({ type: ModuleType.寄方信息, data: sender })
  } catch (error) {
    console.log('处理下单准入时异常', error)
  }
}

/**
 * @description 在通用处理函数的基础上需要保存表单
 * @param responseData
 */
const handleInitData = async (responseData: InitDataResponse | (CheckResponse & BaseCheckResponse)) => {
  let { waybillInfo } = responseData

  // 如果接口没有返回waybillInfo,使用默认表单兜底
  if (!waybillInfo) {
    waybillInfo = cloneDeep(originWaybillInfo)
  }
  // 写入waybillSource
  const waybillSource = getWaybillSource()
  waybillInfo.waybillSource = waybillSource

  // 写入表单
  commonHandleData({ ...responseData, waybillInfo }, CoreApiType.INIT)
  // 更新：下单公司/运单号/通知栏 状态
  useOrderCustomerAndWayBillStatus()

  // 设置是否修改运单且返程单的状态
  piniaStore.globalData.setIsEditAndReturnWaybill({
    flag: getChannel() === Channel.修改运单 && waybillInfo?.waybillFlag === WaybillFlagType.返程单,
  })
}

/**
 * @description 处理过程中数据，传入类型为过程中
 * @param processdata
 */
const handleProcessData = (processdata: CheckResponse) => {
  commonHandleData(processdata, CoreApiType.PROCESS)

  // 保存是否显示绑码弹窗
  saveNeedBindCustomerCode(processdata)

  nextTick(() => useDoms('.order-content'))
}

/**
 * @description 处理保存下单数据
 */
const handleSaveData = (orderData: OrderResponse) => {
  commonHandleData(orderData, CoreApiType.SAVE)
}
/**
 * @description 合并baseCheck接口和process接口，并分发
 */
const handleMergeCheckData = async (
  data: Awaited<BaseCheckResponse | CheckResponse | undefined | BatchProcessResultResponse>[],
  elementsChange?: string,
) => {
  console.log(elementsChange)
  try {
    if (!Array.isArray(data)) {
      return
    }
    const baseCheck = data[0] as BaseCheckResponse
    let processCheck: any = data[1]
    if (!baseCheck && !processCheck) {
      return
    }
    const { checkResultList: baseCheckResultList = [] } = baseCheck || {}
    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType === OrderPageType.批量寄) {
      processCheck = bathValidateToSingle(processCheck as BatchProcessResultResponse)
    }
    const { checkResultList: processCheckResultList = [] } = processCheck || {}
    if (!Array.isArray(baseCheckResultList) || !Array.isArray(processCheckResultList)) {
      return
    }
    let checkData = baseCheck
    const mergeCheckResultList = baseCheckResultList.concat(processCheckResultList)
    if (processCheck) {
      processCheck.checkResultList = mergeCheckResultList
      checkData = processCheck
    }
    if (!checkData) {
      return
    }
    await nextTick()
    //清空之前的副作用
    allCheck(false, true, ['estimatedCost'])
    //等待页面显示，用于处理预加载的问题
    // await awaitPageShow()
    // #448327 临时代码，批量寄单条不要处理副作用
    if (orderPageType !== OrderPageType.批量寄单票) {
      setTimeout(() => {
        remoteCheckDataHandOut(cloneDeep(checkData))
      }, 150) //组件渲染完。依赖收集完，再触发
    }
  } catch (e) {
    console.warn(e)
  }
}

/**
 * @description 处理批量运单数据合并
 */
// const onWaybillInfoMerge = (originalWaybillInfo: OrderInfo, waybillInfo: OrderInfo) => {
//   for (const key in waybillInfo) {
//     if (Reflect.has(originalWaybillInfo, key)) {
//       const keyOriginalWaybillInfo = originalWaybillInfo[key as keyof OrderInfo]
//       const keyWaybillInfo = waybillInfo[key as keyof OrderInfo] as key

//       Reflect.set(originalWaybillInfo, key, { ...keyOriginalWaybillInfo, ...keyWaybillInfo })
//     }
//   }

//   // return { ...originalWaybillInfo, ...waybillInfo }
// }

/**
 * @description 保存过程中接口的数据
 */
const saveBatchOrderData = (params: {
  key?: string
  commonWaybillInfo?: CommonProcessWaybillInfo
  result?: WaybillInfoList[]
  isNotCacheStrategy?: boolean
}) => {
  const { key, commonWaybillInfo, result, isNotCacheStrategy } = params

  if (!isNotCacheStrategy) {
    const currentPageName = getCurrentPageName() //当前页面路由名字

    let targetOrderPageType = piniaStore.root.getOrderPageType
    if (key?.includes('waybill') && currentPageName === 'order-batch-waybill') {
      targetOrderPageType = OrderPageType.批量寄
    }

    const batchOrderInfo: Partial<BatchOrderInfo> = {
      waybillInfoList: result?.sort((first, last) => Number(first?.waybillId) - Number(last.waybillId)),
    }

    if (commonWaybillInfo?.waybillInfo) {
      const commonWaybillInfoData = piniaStore.order.batchCommonWaybillInfo
      // 合并了waybillInfo层级 但是外层也一起覆盖了
      const newWaybillInfo = Object.assign({}, commonWaybillInfoData, commonWaybillInfo?.waybillInfo)
      batchOrderInfo.commonWaybillInfo = Object.assign({}, commonWaybillInfo, { waybillInfo: newWaybillInfo })
    }

    piniaStore.order.updateOrder({
      orderPageType: targetOrderPageType,
      data: batchOrderInfo as BatchOrderInfo,
    })

    if (commonWaybillInfo?.moduleDimension) {
      piniaStore.schema.updateData({ data: commonWaybillInfo.moduleDimension })
    }
  }

  if (commonWaybillInfo?.restrictData) {
    piniaStore.globalData.setBatchRestrictData({ data: commonWaybillInfo.restrictData })
  }
}

/**
 * 解决运单批量只赋值了第一层级的问题
 */
const onGetMergeWaybillInfo = (waybillInfo: OrderInfo, processWaybillInfo: OrderInfo) => {
  const result = waybillInfo
  const mergeUpdateKey = ['receive', 'sender']
  for (const key in processWaybillInfo) {
    if (Reflect.has(waybillInfo, key)) {
      const target = Reflect.get(waybillInfo, key)
      const source = processWaybillInfo[key as keyof OrderInfo]
      // 如果取到的数据是对象且不为null且只合并收寄件地址，则合并，否则覆盖
      if (source && typeof source === 'object' && mergeUpdateKey.includes(key)) {
        if (Array.isArray(source)) {
          // 如果是数组 直接则合并
          Reflect.set(waybillInfo, key, source)
        } else {
          Reflect.set(waybillInfo, key, merge(target, source))
        }
      } else {
        Reflect.set(waybillInfo, key, source)
      }
    }
  }
  return result
}

/**
 * @description 处理批量过程中接口，更新batchWaybillInfoList
 * @param processdata
 */
const handleBatchProcessData = (params: {
  processdata: InitDataResponse[]
  key?: string
  commonWaybillInfo?: CommonProcessWaybillInfo
  isNotCacheStrategy?: boolean
}) => {
  const { processdata, key, commonWaybillInfo, isNotCacheStrategy } = params

  const waybillIdList = processdata

  let result: WaybillInfoList[] = []
  if (!isNotCacheStrategy) {
    const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList || []

    const batchWaybillInfoListId = batchWaybillInfoList?.map((item) => item.waybillId)

    result = [...batchWaybillInfoList] || []
    if (batchWaybillInfoList && batchWaybillInfoList.length > 0) {
      waybillIdList?.forEach((item) => {
        if (batchWaybillInfoListId.includes(item.waybillId as string)) {
          result = result.filter((secItem) => secItem.waybillId !== item.waybillId)
          const original = batchWaybillInfoList.filter((secItem) => secItem.waybillId === item.waybillId)?.[0]

          const checkResultList = item.checkResultList

          let addedServiceModuleDimension = original.moduleDimension?.addedService || {}

          if (item?.moduleDimension?.addedService) {
            addedServiceModuleDimension = { ...addedServiceModuleDimension, ...item.moduleDimension.addedService }
          }

          const newData = {
            ...original,
            checkResultList: checkResultList ? checkResultList : original.checkResultList,
            dynamicConfig: { ...original.dynamicConfig, ...item.dynamicConfig },
            moduleDimension: {
              ...original.moduleDimension,
              ...item.moduleDimension,
              addedService: addedServiceModuleDimension,
            },
            restrictData: item.restrictData ? item.restrictData : original.restrictData, // 此处应以store数据优先，因为携带了confirmResult的状态
            status: item.status,
            waybillInfo: onGetMergeWaybillInfo(original.waybillInfo, item.waybillInfo),
          } as WaybillInfoList
          result.push(newData)
        } else {
          result.push(item as WaybillInfoList)
        }
      })
    } else {
      waybillIdList?.forEach((item) => {
        result.push(item as WaybillInfoList)
      })
    }
  }

  // 将数据保存到store
  saveBatchOrderData({
    key,
    commonWaybillInfo,
    result,
    isNotCacheStrategy,
  })
}

export const useStaticAndDynamicData = () => {
  return {
    handleInitData,
    handleBaseCheckData,
    handleProcessData,
    handleBusinessLogic,
    handleSaveData,
    handleConfigDimension,
    handleSaveConfigDimension,
    saveNeedBindCustomerCode,
    saveStaticAndWaybillInfo,
    handleBatchProcessData,
    handleMergeCheckData,
  }
}
