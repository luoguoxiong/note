/* eslint-disable max-lines */
import {
  getBaseCheck,
  getCacheConfig,
  getChannelScene,
  getConfig,
  getPageDefaultInfo,
  getTemplateList,
  initProcess,
} from '@order-public-sub-public/apis'
import {
  getBatchId,
  defaultInitConfig,
  getChannel,
  PAY_MODE,
  resetChannel,
  resetExistMap,
  saveBatchId,
  saveBindCustomerCodeBar,
  saveBindCustomerCodeFlag,
  setChannel,
} from '@order-public-sub-public/configs'
import {
  updateOrderWaybillNumber,
  useStaticAndDynamicData,
} from '@order-public-sub-public/hooks/useStaticAndDynamicData'
import {
  ErrorCodeType,
  InitDataResponse,
  ITemplateDimension,
  OrderInfo,
  pageDefaultInfoType,
  QueryObject,
  Schema,
} from '@order-public-sub-public/types'
import { getQueryObject, getWaybillSource } from '@order-public-sub-public/utils'
import { computed, nextTick, ref } from 'vue'
import { useClearNoticeAndCustomerStatus } from './useOrderCustomerAndWayBill'
import {
  BaseCheckResponse,
  DynamicConfig,
  InitResponse,
  preConfigInitResponse,
  StaticConfig,
} from '@order-public-sub-public/apis/types'
import { closeSkeleton, showSkeleton } from '@order-public-sub-public/utils/skeleton'
import {
  Channel,
  CoreApiType,
  InitOrderStatus,
  ModuleType,
  OrderPageType,
  YesOrNoString,
  BatchInitPollingStatus,
  HttpCode,
} from '@order-public-sub-public/constants'
import apm from '@order-public-sub-public/utils/apm-sdk'
import { refreshBusinessMounted, resetWaybillInfo } from '@order-public-sub-public/utils/waybillInfo'
import { useDoms } from '@order-public-sub-public/hooks/useDoms'
import { cloneDeep, merge } from 'lodash-es'
import { SchemaConfig } from '@order-public-sub-public/store/types'
import useEffect from '@order-public-sub-public/validate'
import { clearAllErrClass } from '@order-public-sub-public/validate/effect/effectBubble'
import {
  decryptModuleConfig,
  getCombinedOrderInfo,
  handleInitQuery,
  InitResponseDataMeragedType,
  needGetCatchApiChannel,
  // needLocalCacheChannel,
  needProcessApiChannel,
  setInitErrorCode,
} from './utils'
import {
  updateSchemaInOrderBatchWaybill,
  useBatchInitData,
  setBatchEstimatedCostConfig,
  useBatchPreInitData,
  handleBatchInitData,
} from './useBatchInit'
import { elementsChange } from '@order-public-sub-public/utils/cancel'
import { uncapitalLize } from '@order-public-sub-public/utils/string'
import {
  initConfigReport,
  renderFinishEndReport,
  reportActionsAfterInitConfig,
  reportConfigChange,
  reportConfigChannel,
  reportFail,
  setCommonVersion,
} from '@order-public-sub-root-pages/order-single/report'
import { unmountInstance } from '@order-public-sub-public/validate/effect/effectPopup'
import { initStore } from '@order-public-sub-public/utils/store'
import { singleFeeData } from '@order-public-sub-public/components/business/estimated-cost/hooks/singleFeePolling'
import { getCacheInitData, preLoadCouponStatic } from '@order-public-sub-root-pages/order-single/utils'
import { fillServiceModeInData } from '@order-public-sub-public/components/business/service-model/hooks/useServiceModeTypes'
import { getCurrentPageName } from '@order-public-sub-public/validate/utils'
import { addDetailPerformance, EReportRenderTime, performanceMark } from '@order-public-sub-public/utils/reportConfig'
import { getBatchFiledInit } from '@order-public-sub-public/apis/batch/index'
import {
  BatchFildInitResponse,
  BatchProcessResultResponse,
  WaybillInfoList,
} from '@order-public-sub-public/apis/batch/types'
import { useEstimateFeeResult } from '@order-public-sub-public/hooks/estimated-cost/useProcess'
import { commonStopPolling } from '@order-public-sub-public/hooks/usePolling'
import { getKeyByPersistedState } from '@order-public-sub-public/store/utils'
import { getTemplateId } from './template'
import { useRealAuth } from '@order-public-sub-root-pages/order-success/hooks/useRealAuth'
import { useToggleExpand } from '@order-public-sub-public/components/business/more-module/hooks/useState'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { sessionStorage, localStorage } from '@order-public-sub-public/utils/storage'

import { timeFlag } from '@order-public-sub-public/hooks/asynrender'
import { initFinished } from './routerStatus'
import { useStore } from '@order-public-sub-public/store'

const piniaStore = useStore()

const { startConfig } = useInitMulitFielConfigChild()
const { singleFeePolling, data: feeData } = singleFeeData()
const {
  handleBaseCheckData,
  handleSaveConfigDimension,
  saveNeedBindCustomerCode,
  handleMergeCheckData,
  handleInitData,
} = useStaticAndDynamicData()
const { estimateFeeProcessPolling } = useEstimateFeeResult()
const { clearSuccessPageRealAuthFlag } = useRealAuth()
const { toggleExpand } = useToggleExpand()

export const isShowOrderSkeleton = ref(true)
const schema = ref<Schema>()
export const initPageStatus = ref(InitOrderStatus.BEGIN)
export const initErrorCode = ref<null | ErrorCodeType>(null)
const orderKey = ref('')

const currentSchema = computed(() => piniaStore.schema.currentSchema)

// 主题名称
const themeName = computed(() => currentSchema.value.currentThemeName ?? '')

const initQuery = ref<QueryObject>({})

const currentRoute = ref<OrderPageType>(OrderPageType.单票)

let userDefaultInfoFun: ReturnType<typeof getUserDefaultInfo>

export const orderHomeRoute = ref()
export const templateList = ref<ITemplateDimension>([])
export const templateRecommendPop = ref(false)
// 判断退出活动显示状态的条件：1.在单票下单页面 2.下单配置显示且可以退出才为true
const exitVisible = computed(() => {
  const businessCheckConfig = piniaStore.schema.getSchemaBusinessCheckConfig()
  const exitEntry = businessCheckConfig?.exitEntry,
    outActivityFlag = currentSchema.value.outActivityFlag
  return (
    (currentRoute.value === OrderPageType.单票 || currentRoute.value === OrderPageType.批量寄) &&
    exitEntry === YesOrNoString.YES &&
    outActivityFlag &&
    initFinished.value
  )
})
/**
 * @description 退出活动，初始化之后再重设channel
 */
const exit = () => {
  // 单票批量区分退出活动
  const channel = currentRoute.value === OrderPageType.批量寄 ? Channel.批量退出活动 : Channel.退出活动
  const params = { channel: channel }
  if (getTemplateId()) {
    Object.assign(params, { templateId: getTemplateId() })
  }
  orderHomeRoute.value = null
  useRefresh(channel)
}

/**
 * 刷新下单主页面方法
 * @param channel
 * @returns
 */
export const useRefresh = (channel: Channel) => {
  setChannel(channel)
  const curOrderPageType = piniaStore.root.getOrderPageType
  const route = curOrderPageType === OrderPageType.批量寄 ? OrderPageType.批量寄 : ('' as OrderPageType)
  init(route, {
    noNeedCache: true,
    notFirstTimeEnter: curOrderPageType === OrderPageType.批量寄,
  })
  resetWaybillInfo()
  refreshBusinessMounted()
}

/**
 * @description 将初始化缓存的数据进行存储
 */
export const setCacheInitConfig = (data: preConfigInitResponse) => {
  piniaStore.globalData.serPreConfigProcess({ data })
}
/**
 * @description 获取初始化配置
 */
// eslint-disable-next-line
const getInitConfig = async () => {
  initQuery.value = handleInitQuery() || {}
  if (currentRoute.value === OrderPageType.批量寄) {
    initQuery.value = { ...initQuery.value, orderScene: 20 }
  }
  const templateId = getTemplateId()
  if (templateId) {
    initQuery.value = { ...initQuery.value, templateId: templateId }
  }
  try {
    const waybillSource = await getWaybillSource()
    initQuery.value.waybillSource = waybillSource
    //读取提前加载的缓存数据
    // 只取出需要传的入参
    // const { data } = await getConfig({ ...initQuery.value, orderScene: getOrderScene() })
    let result: InitResponse | BatchFildInitResponse | undefined
    //读取缓存接口配置的场景，返回结构不同
    if (needGetCatchApiChannel() || InitResponseDataMeragedType()) {
      const { cacheVersion, pageInitConfigResponse, processCheckResponse } =
        piniaStore.globalData.preConfigProcess || {}
      const { data } = await getCacheConfig({
        ...(initQuery.value || {}),
        cacheVersion,
        batchId: pageInitConfigResponse?.batchId,
      })
      // 绑码数据处理：1.以process数据为准，process没有才取config
      let bindCustomerConfig = {}
      if (data.processCheckResponse) {
        const processCustomValue = data.processCheckResponse.needBindCustomerCode
        bindCustomerConfig = {
          needBindCustomerCode:
            processCustomValue !== undefined ? processCustomValue : data.pageInitConfigResponse.needBindCustomerCode,
        }
      } else {
        const processCustomValue = processCheckResponse.needBindCustomerCode
        bindCustomerConfig = {
          needBindCustomerCode:
            processCustomValue !== undefined ? processCustomValue : processCheckResponse.needBindCustomerCode,
        }
      }

      result = data?.pageInitConfigResponse
        ? { ...data?.pageInitConfigResponse, ...bindCustomerConfig }
        : { ...pageInitConfigResponse, ...bindCustomerConfig }
      const { estimateFeeTaskId = '' } =
        data.processCheckResponse?.moduleDimension || processCheckResponse?.moduleDimension

      if (estimateFeeTaskId) {
        feeData.value = {}
        singleFeePolling(estimateFeeTaskId)
      }

      // 返程单合并的接口外层没有返回运单号,在后续校验过不去,这里取运单对象里的运单号
      if (!data.waybillNumber && currentRoute.value === OrderPageType.返程单) {
        data.waybillNumber = data.processCheckResponse?.waybillInfo?.waybillNumber || ''
      }
      setCacheInitConfig(data)
    } else {
      const channel = getChannel()
      // 批量预加载
      if (currentRoute.value === OrderPageType.批量寄 && [Channel.批量寄, Channel.批量扫二维码].includes(channel)) {
        saveBatchId('', true, {
          allowEmpty: true,
          fromType: 'getInitConfig',
        })
        const baseParams = {
          cacheVersion: '',
          machine: localStorage?.getItem('userUuid') || '',
          maxWaybillId: 0,
          taskId: '',
        }
        let extraPrams = {}
        if (channel === Channel.批量扫二维码) {
          extraPrams = initQuery.value
        }

        const { data } = await getBatchFiledInit({ ...baseParams, ...extraPrams })
        result = data
      } else {
        const { data } = await getConfig(initQuery.value)
        result = data
      }
    }
    return result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('initData获取初始化数据失败', error)
    // 缩小报错异常场景，
    reportFail({
      error: JSON.stringify(error),
    })
    setInitErrorCode(error)
    const allowCode = error.code && error.code !== HttpCode.EMPTY
    if (error && typeof error === 'object' && allowCode) {
      initPageStatus.value = InitOrderStatus.FAILED
      throw new Error('initData获取初始化数据失败')
    }
    throw defaultInitConfig as InitResponse

    // return defaultInitConfig as InitResponse
  }
}

const saveBindCustomerCode = (data: InitResponse) => {
  const { bindCustomerCodeBar, bindCustomerCodeFlag } = data
  // 显示下单公司显示
  saveBindCustomerCodeFlag(bindCustomerCodeFlag || false)
  // 提示条显示
  saveBindCustomerCodeBar(bindCustomerCodeBar || false)
  const curOrderPageType = piniaStore.root.getOrderPageType
  if (curOrderPageType !== OrderPageType.批量寄单票) {
    saveNeedBindCustomerCode(data)
  }
}

/**
 * @description 返程单手动修改schema
 */
export const updateSchemaInOrderback = (schema: Schema) => {
  piniaStore.schema.updateModuleConfigByType({
    type: ModuleType.需返程寄收地址,
    data: {
      visible: true,
      config: {
        visible: true,
      },
    },
    orderPageType: currentRoute.value,
  })
  schema.module[ModuleType.需返程寄收地址].visible = true
}

/**
 * @description initConfig接口请求完成后的操作
 */
export const actionsAfterInitConfig = (data: InitResponse) => {
  const { configDimension, userInfo, batchId } = data
  reportActionsAfterInitConfig({
    currentRoute: currentRoute.value,
    batchId,
  })
  if (currentRoute.value !== OrderPageType.批量寄单票 || getCurrentPageName() === OrderPageType.单票) {
    saveBatchId(batchId, true, {
      fromType: 'getInitConfig',
    })
  }
  saveBindCustomerCode(data)
  let staticConfig:
    | SchemaConfig
    | {
        schema: Schema
      }
  const version = configDimension?.staticConfig?.schema?.version
  // 有version字段不为空认为是新版本schema
  if (version) {
    // 解密
    const decryptedSchema = decryptModuleConfig(configDimension?.staticConfig?.schema)
    // console.log('解密后', decryptedSchema)

    // 付款方式兼容二期配置特殊处理
    decryptedSchema.module.PayMode = merge({}, PAY_MODE, decryptedSchema.module.PayMode)
    // 保存配置维度数据
    staticConfig = handleSaveConfigDimension(
      { ...configDimension, staticConfig: { ...configDimension.staticConfig, schema: decryptedSchema } },
      CoreApiType.INIT,
    )
  } else {
    // 保存配置维度数据
    staticConfig = handleSaveConfigDimension(configDimension, CoreApiType.INIT)
  }

  if (currentRoute.value === OrderPageType.返程单) {
    const waybillNumber =
      piniaStore.globalData.preConfigProcess?.waybillNumber || piniaStore.root.getCurrentWaybillNumber
    startConfig(tmpCacheKey.value || waybillNumber)
  }

  // 批量寄单票需要特写schema
  if (currentRoute.value === OrderPageType.批量寄单票) {
    updateSchemaInOrderBatchWaybill(staticConfig.schema)
  }

  // TODO Schema格式检查，格式错了报错，并使用兜底配置
  performanceMark('schemaStart')
  console.log('缓存赋值完成', Date.now() - timeFlag.value)
  schema.value = staticConfig.schema
  addDetailPerformance(EReportRenderTime.开始渲染配置)
  nextTick(() => {
    performanceMark('schemaNextTick')
  })
  // 保存userInfo用户数据
  piniaStore.root.setUserInfo(userInfo)

  // 实例化apm用户id
  apm.setUserId(userInfo.phone)

  //埋点更新全局属性
  setCommonVersion(configDimension?.staticConfig)

  // 等process数据加载完成再关闭骨架屏
  // if (currentRoute.value !== OrderPageType.返程单) {
  //   closeSkeleton()
  // }
  preLoadCouponStatic()
}

/**
 * @description 处理下单准入
 */
export const initBaseCheck = async () => {
  if (currentRoute.value !== OrderPageType.批量寄单票) {
    const { data } = await getBaseCheck()
    handleBaseCheckData(data)
    return data
  } else {
    return {} as BaseCheckResponse
  }
}

/**
 * @description 初始化配置，获取静态配置、动态配置和userInfo
 * @param params
 */
export const initConfig = async (data: InitResponse, orderPageType?: OrderPageType) => {
  return new Promise((resolve, reject) => {
    try {
      if (checkIsDiffPageByReturnWaybill(orderPageType)) return

      actionsAfterInitConfig(data)
      // 保存batchId之后再发出请求，避免后续使用的batchId不是最新的问题
      // 调用分支流程
      closeSkeleton()
      Promise.all([initBaseCheck(), initData(orderPageType)])
        .then((res) => {
          if (checkIsDiffPageByReturnWaybill(orderPageType)) return
          handleMergeCheckData(res, 'init')
          resolve(res)
        })
        .catch((err) => {
          console.warn(err)
          reject(err)
        })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

/**
 * @description 初始化配置，获取静态配置、动态配置和userInfo
 * @param params
 */
export const batchInitConfig = async (data: BatchFildInitResponse) => {
  return new Promise((resolve, reject) => {
    try {
      actionsAfterInitConfig(data?.pageInitConfigResponse)
      // 保存batchId之后再发出请求，避免后续使用的batchId不是最新的问题
      // 调用分支流程
      Promise.all([initBaseCheck(), batchInitData(data)])
        .then((res) => {
          handleMergeCheckData(res, 'init')
          resolve(res)
        })
        .catch((err) => {
          console.warn(err)
          reject(err)
        })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

export const batchInitData = async (res: BatchFildInitResponse) => {
  if (res?.batchInitProcessResponse?.status === BatchInitPollingStatus.完成) {
    if (res?.batchInitProcessResponse?.computeEstimateFee || res?.batchInitProcessResponse?.computeCoupon) {
      commonStopPolling()
      estimateFeeProcessPolling({
        taskId: res.taskId,
        batchProcessResponse: res?.batchInitProcessResponse as unknown as BatchProcessResultResponse,
        computeEstimateFee: res?.batchInitProcessResponse?.computeEstimateFee,
        computeCoupon: res?.batchInitProcessResponse?.computeCoupon,
        isInit: true,
        orderPageType: OrderPageType.批量寄,
      })
    }
    handleBatchInitData(res?.batchInitProcessResponse as unknown as BatchProcessResultResponse)

    return res?.batchInitProcessResponse as unknown as BatchProcessResultResponse
  } else {
    const data = await useBatchPreInitData(res?.taskId)
    handleBatchInitData(data as unknown as BatchProcessResultResponse)

    return data as unknown as BatchProcessResultResponse
  }
}

/**
 * @description 缓存配置channel下的配置初始化，获取静态配置、动态配置和userInfo
 * @param params
 */
export const initCacheConfig = async (data: InitResponse) => {
  const { dataChangeFlag, processCheckResponse, waybillNumber, batchId } = piniaStore.globalData.preConfigProcess || {}
  //如果发生变化则渲染新配置
  try {
    if (dataChangeFlag !== false) {
      addDetailPerformance(EReportRenderTime.配置发生变化重新开始渲染)
      performanceMark('dataChangeFlag')
      reportConfigChange()
      actionsAfterInitConfig(data)
      await nextTick()
      performanceMark('dataChangeFlagNextTick')
      addDetailPerformance(EReportRenderTime.配置发生变化Dom渲染完成)
    }
    saveBatchId(batchId, true, {
      fromType: 'initCacheConfig',
    })

    if (processCheckResponse) {
      await handleInitData(processCheckResponse)
      // 处理服务方式逻辑
      const { serviceMode, serviceModeFlag = false } = processCheckResponse?.moduleDimension
      fillServiceModeInData({ ...serviceMode, serviceModeFlag, initFlag: YesOrNoString.YES })
    }
    if (!waybillNumber) {
      initPageStatus.value = InitOrderStatus.FAILED
      reportFail({
        fail: 'noWaybillNumber',
        batchId: getBatchId(),
      })
    } else {
      updateOrderWaybillNumber(waybillNumber)
    }
    await nextTick()
    closeSkeleton()
    renderFinishEndReport()
  } catch (e) {
    console.error(e)
  }
  //校验结果的分发
  return new Promise((resolve, reject) => {
    try {
      Promise.all([initBaseCheck(), Promise.resolve(processCheckResponse)])
        .then((res) => {
          handleMergeCheckData(res)
          resolve(data)
        })
        .catch((err) => {
          reject(err)
          console.warn(err)
        })
    } catch (error) {
      closeSkeleton()
      console.log(error)
      reject(error)
    }
  })
}

/**
 * @description 初始化数据，将动态数据和表单写入到store
 * 2023-11-10 技术优化，初始化接口改为process，elementsChange固定传['init']，且存在textCode时要传入textCode
 */
const initData = async (orderPageType?: OrderPageType) => {
  try {
    // 批量寄处理
    if (currentRoute.value === OrderPageType.批量寄) {
      const data = await useBatchInitData()
      return data
    } else if (currentRoute.value === OrderPageType.批量寄单票) {
      const { waybillNumber = '' } = getQueryObject()
      const data = piniaStore.order.orderWaybillInfo(waybillNumber)
      // 运单加密处理
      if (!data.waybillInfo.waybillSpecialEncrypt) {
        data.waybillInfo.waybillSpecialEncrypt = {
          waybillSpecialEncryptType: false,
          waybillSpecialEncryptRules: [],
        }
      }
      const schemaData = piniaStore.schema.getSchemaByType(OrderPageType.批量寄)

      data.configDimension = { dynamicConfig: data.dynamicConfig as DynamicConfig, staticConfig: {} as StaticConfig }
      for (const key in schemaData.schema.data) {
        // 除下单公司之外，其他的以waybillInfoList运单信息优先
        if (!Reflect.has(data.moduleDimension, key) || key === uncapitalLize(ModuleType.下单公司)) {
          Reflect.set(data.moduleDimension, key, Reflect.get(schemaData.schema.data, key))
        }
      }

      data.checkResultList = []

      // 如果initData不为空，处理数据
      if (data) {
        await handleInitData(data as InitDataResponse)
      }
      return data
    } else {
      const waybillSource = await getWaybillSource()

      if (checkIsDiffPageByReturnWaybill(orderPageType)) return

      //读取提前加载的缓存数据
      const { data } = await initProcess({
        elementsChange: ['init'],
        orderInfo: {} as OrderInfo,
        moduleStyle: '',
        pageName: getCurrentPageName(),
        textCode: initQuery.value?.textCode || '',
        waybillSource,
      })

      if (checkIsDiffPageByReturnWaybill(orderPageType)) return

      // 如果initData不为空，处理数据
      if (data) {
        const { waybillInfo } = piniaStore.globalData.initConfig || {}
        if (needProcessApiChannel()) {
          // 此时需要和initConfig的运单数据合并，防止不一致
          data.waybillInfo = getCombinedOrderInfo(waybillInfo as OrderInfo, data.waybillInfo)
        }
        await handleInitData(data as InitDataResponse)

        // 处理服务方式逻辑
        const { serviceMode, serviceModeFlag = false } = data?.moduleDimension
        fillServiceModeInData({ ...serviceMode, serviceModeFlag, initFlag: YesOrNoString.YES })
      }
      if (data?.moduleDimension?.estimateFeeTaskId) {
        feeData.value = {}
        singleFeePolling(data?.moduleDimension?.estimateFeeTaskId)
      }

      return data
    }
  } catch (error) {
    console.error('获取初始化数据失败', error)
    reportFail({
      fail: 'initDataFail',
    })
    // throw new Error('initData获取初始化数据失败')
  }
}

/**
 * @description 在拉取数据前需要做的操作
 */
const beforeInitActions = (
  options: InitOptions = { showSkeleton: true, notFirstTimeEnter: false, updateDynamicConfig: true },
) => {
  // 重新加载清除绑码状态store缓存
  initConfigReport()
  useClearNoticeAndCustomerStatus()
  setOrderKey()
  // 清空dynamicConfig
  if (options?.updateDynamicConfig) {
    piniaStore.globalData.setDynamicConfig({
      dynamicConfig: {} as DynamicConfig,
      isClear: true,
    })
  }

  // 重置关系表
  resetExistMap()

  // 显示遮罩层
  options.showSkeleton && showSkeleton()

  if (!options?.notFirstTimeEnter) {
    // 设置默认schema
    setDefaultSchema()
  }

  // 销毁遮罩
  const unmount = piniaStore.globalData.getMaskInstance
  if (unmount) {
    unmount()
  }

  // 清除通用遮罩
  unmountInstance()

  //初始化预加载配置缓存
  initPreConfigProcess()

  initPageStatus.value = InitOrderStatus.BEGIN
  clearSuccessPageRealAuthFlag()

  setInitErrorCode(null)

  toggleExpand(false)
}
/**
 * @description 初始化预加载配置缓存
 */
const initPreConfigProcess = () => {
  piniaStore.globalData.serPreConfigProcess({})
}
/**
 * @description 单票和批量的唯一标识，为了解决单票批量共存数据存储上的影响
 */
const setOrderKey = () => {
  const key = getKeyByPersistedState()
  orderKey.value = key
  sessionStorage?.setItem('keyByPersistedState', key)
}

export const getOrderKey = () => {
  return orderKey.value || sessionStorage.getItem('keyByPersistedState')
}

/**
 * @description 设置默认schema
 */
const setDefaultSchema = () => {
  const schema = decryptModuleConfig()
  piniaStore.schema.updateOnlySchema({ schema })
}

// 初始化选项配置扩展
export type InitOptions = {
  showSkeleton?: boolean //是否需要显示骨架屏
  noNeedCache?: boolean //不需要读取本地缓存
  notFirstTimeEnter?: boolean //是否首次进入
  updateDynamicConfig?: boolean //是否需要更新dynamicConfig
}

/**
 * @description 初始化函数
 */
// eslint-disable-next-line max-lines-per-function,complexity
const init = async (
  route?: string,
  options: InitOptions = { showSkeleton: true, noNeedCache: false, notFirstTimeEnter: false },
) => {
  route && (currentRoute.value = route as OrderPageType)
  userDefaultInfoFun = getUserDefaultInfo()

  if (route) {
    piniaStore.root.setOrderPageType(route as OrderPageType)
  }
  const channel = getChannel()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // window.checkOrderConfigPreData = init
  try {
    isShowOrderSkeleton.value = true
    // 重设staticConfigAndWaybillInfo
    if (currentRoute.value === OrderPageType.单票) {
      piniaStore.globalData.clearStaticConfigAndWaybillInfo({ orderPageType: currentRoute.value })
      piniaStore.globalData.setReturnWaybillInfo({
        data: {},
        orderPageType: OrderPageType.单票,
      })
      initStore(OrderPageType.返程单)
    }

    let config = {} as InitResponse
    let batchConfig = {} as BatchFildInitResponse

    //快速寄件，需要缓存的channel，先取缓存进行渲染
    // if (needLocalCacheChannel() && !options?.noNeedCache) {
    //   addDetailPerformance(EReportRenderTime.开始获取本地缓存)
    //   performanceMark('getCacheConfigInitStart')
    //   console.log("开始获取缓存",Date.now()-timeFlag.value)
    //   getCacheConfigInit()
    //   console.log("开始获取缓存完成2",Date.now()-timeFlag.value)
    //   // performanceMark('getCacheConfigInitEnd')
    //   cacheConfigInit()
    // }
    performanceMark('beforeInitActionsStart')
    beforeInitActions({ updateDynamicConfig: true, ...options })
    performanceMark('beforeInitActionsEnd')
    // addDetailPerformance(EReportRenderTime.初始化请求开始)
    // 批量寄特殊处理
    if (currentRoute.value === OrderPageType.批量寄单票) {
      config = cloneDeep(piniaStore.globalData.initConfig)
    } else {
      performanceMark('getInitConfigStart')

      performanceMark('getInitConfigEnd')

      // 批量预加载
      if (currentRoute.value === OrderPageType.批量寄 && [Channel.批量寄, Channel.批量扫二维码].includes(channel)) {
        batchConfig = (await getInitConfig()) as BatchFildInitResponse
        piniaStore.globalData.setInitConfig({ initConfig: cloneDeep(batchConfig?.pageInitConfigResponse) })
        setBatchEstimatedCostConfig(batchConfig?.pageInitConfigResponse?.configDimension?.dynamicConfig?.estimatedCost)
      } else {
        config = (await getInitConfig()) as InitResponse
        piniaStore.globalData.setInitConfig({ initConfig: cloneDeep(config) })
        setBatchEstimatedCostConfig(config?.configDimension?.dynamicConfig?.estimatedCost)
      }
    }
    const orderPageType = piniaStore.root.getOrderPageType
    console.log('当前类型', route, orderPageType)
    if (route === OrderPageType.返程单 && orderPageType !== OrderPageType.返程单) {
      return
    }
    addDetailPerformance(EReportRenderTime.初始化请求结束)
    performanceMark('initConfigStart')
    // 如果initConfig数据不为空，处理配置
    if (currentRoute.value === OrderPageType.批量寄 && [Channel.批量寄, Channel.批量扫二维码].includes(channel)) {
      // 批量寄预加载
      if (batchConfig) {
        await batchInitConfig(batchConfig)
        initConfigReport()
        addDetailPerformance(EReportRenderTime.配置初始化完成)
      }
    } else {
      if (config) {
        needGetCatchApiChannel() || InitResponseDataMeragedType()
          ? await initCacheConfig(config)
          : await initConfig(config, route as OrderPageType)
        initConfigReport()
        addDetailPerformance(EReportRenderTime.配置初始化完成)
      }
    }

    performanceMark('initConfigEnd')
  } catch (error) {
    reportFail({
      error: JSON.stringify(error),
    })
    //临时改动，先在批量范围
    if (currentRoute.value === OrderPageType.批量寄) {
      initPageStatus.value = InitOrderStatus.FAILED
    }
    console.log('获取初始化数据失败', error)
    addDetailPerformance(EReportRenderTime.获取初始化数据失败)
    closeSkeleton()
    throw error
  } finally {
    nextTick(() => {
      // debugger
      isShowOrderSkeleton.value = false
    })
  }
  setTimeout(() => {
    console.log('获取初始化数据成功', piniaStore.root)
  }, 3000)
  // 无论接口成功失败一定需要执行的动作
  return finallyActions()
}

/**
 * 初始化:用来判断返程单逻辑是否在其他页面执行了
 * 场景描述: 点击进入返程单,接口没返回/数据没处理完就返回了主页面 ,导致数据污染
 * originOrderPageType: 初始化执行时的路由名称
 * */
export const checkIsDiffPageByReturnWaybill = (originOrderPageType?: OrderPageType) => {
  if (originOrderPageType === OrderPageType.返程单) {
    const curOrderPageType = piniaStore.root.getOrderPageType
    if (originOrderPageType !== curOrderPageType) {
      console.log('触发了返程单初始化被拦截')
    }
    return originOrderPageType !== curOrderPageType
  } else {
    return false
  }
}

//获取本地缓存数据
const getCacheConfigInit = () => {
  try {
    reportConfigChannel()
    const cacheConfig = getCacheInitData()
    if (cacheConfig) {
      setCacheInitConfig(cacheConfig)
      // 清除骨架屏
      setTimeout(() => {
        closeSkeleton()
      }, 20) //命中缓存后，延迟，为了页面渲染完成，和优化
      performanceMark('cacheConCloseSkeleton')
      renderFinishEndReport()
    }
  } catch (e) {
    console.error(e)
  }
}
/**
 * @description 缓存数据进行渲染
 */
export const cacheConfigInit = async () => {
  try {
    // performanceMark('cacheConfigInitStart')
    const cacheConfig = piniaStore.globalData.preConfigProcess
    if (cacheConfig?.pageInitConfigResponse) {
      addDetailPerformance(EReportRenderTime.已获取缓存配置)
      const { pageInitConfigResponse, processCheckResponse } = cacheConfig
      actionsAfterInitConfig(pageInitConfigResponse as InitResponse)
      performanceMark('cacheConfigInitNextTickStart')
      performanceMark('cacheConfigInitNextTickEnd')
      handleInitData(processCheckResponse)
      console.log('缓存整个完成', Date.now() - timeFlag.value)
      addDetailPerformance(EReportRenderTime.缓存配置Dom渲染完成)
    } else {
      addDetailPerformance(EReportRenderTime.未获取到缓存配置)
      initPreConfigProcess()
    }
    performanceMark('cacheConfigInitEnd')
  } catch (e) {
    console.error(e)
    addDetailPerformance(EReportRenderTime.缓存数据渲染失败)
  }
}
/**
 * @description 读取去程单的数据进行处理
 * @param staticConfigAndWaybillInfo
 */
export const handleStaticConfigAndWaybillInfo = () => {
  // TODO设置batchId
  const batchId = piniaStore.globalData.getBatchId
  saveBatchId(batchId, true, {
    fromType: 'handleStaticConfigAndWaybillInfo',
  })
  const schemaData = piniaStore.schema.currentSchema?.schema
  // 保存schema,触发页面刷新
  schema.value = { ...schemaData }
}
/**
 * @description 从返程单返回后无需调用接口
 */
const initWithoutFetch = () => {
  resetChannel(Channel.快速寄件)
  piniaStore.root.setOrderPageType(OrderPageType.单票)
  const { remoteCheck, allCheck } = useEffect()

  beforeInitActions({ showSkeleton: false, notFirstTimeEnter: true })
  // 重置数据-调整为根据orderPageType取值
  handleStaticConfigAndWaybillInfo()
  closeSkeleton()
  allCheck(false)
  // 清空elementChange
  elementsChange.value.clear()
  remoteCheck('returnWaybillEnd')
  return finallyActions()
}
/**
 * @description 无论接口成功失败一定需要执行的动作
 */
const finallyActions = () => {
  return new Promise((resolve) => {
    closeSkeleton()
    // 当退出活动动作结束后，重置channel为之前url携带的结果
    const channel = getChannel()
    if (channel === Channel.退出活动) {
      resetChannel()
    }
    nextTick(() => {
      //读取缓存的已经提前时间节点上报了
      if (!needGetCatchApiChannel()) {
        renderFinishEndReport()
      }
      // 渲染完成后对下单页容器进行dom元素特殊处理,例如最后一个cell的border-bottom，收集实际渲染的组件等
      useDoms('.order-content')
      resolve(true)
    })
  })
}
/**
 * @description 返回批量寄页面无需调用接口,重设schema即可
 */
const initBatchWithoutFetch = async (notFirstTimeEnter: boolean) => {
  try {
    beforeInitActions({ showSkeleton: false, notFirstTimeEnter, updateDynamicConfig: false })
    const config = cloneDeep(piniaStore.schema.currentSchema)

    // // 如果initConfig数据不为空，处理配置
    if (config) {
      try {
        currentRoute.value = OrderPageType.批量寄

        schema.value = config.schema
      } catch (error) {
        console.log(error)
        throw new Error('设置初始化配置失败')
      }
    }
  } catch (error) {
    console.log('获取初始化数据失败', error)
  }
  // 无论接口成功失败一定需要执行的动作
  return finallyActions()
}
/**
 * @description 返程单页面初始化
 */
const initOrderBackPage = () => {
  // 清理所有报错
  clearAllErrClass()
}
/**
 * @description 获取用户默认设置信息
 */
const getUserDefaultInfo = () => {
  let result: pageDefaultInfoType
  let promise: Promise<pageDefaultInfoType> | null
  async function asyncFunction(isBindCustomer = false) {
    if (promise) {
      await promise
      if (!isBindCustomer) {
        return result
      }
    }
    // 绑码切换不要拿缓存
    if (result && !isBindCustomer) {
      return result
    }
    promise = new Promise((resolve) => {
      const initDataPromise = piniaStore.globalData.initDataPromise
      const getInfo = async () => {
        const { data } = await getPageDefaultInfo()
        promise = null
        piniaStore.globalData.serUserDefaultSettingInfo({ data })
        result = data
        return data
      }
      if (initDataPromise) {
        initDataPromise.then(async () => {
          resolve(getInfo())
        })
      } else {
        return resolve(getInfo())
      }
    })
    return promise
  }
  return asyncFunction
}
//通过key获取具体的默认信息
export const getUserSettingInfoByKey = async (key: string, isBindCustomer = false) => {
  if (typeof userDefaultInfoFun !== 'function') {
    return
  }
  const getInfo = userDefaultInfoFun(isBindCustomer)
  const { addressSaveInfo, agreementInfo, encryptSettingInfo, goodsTypeTip, goodsTimeOptimizeInfo } = await getInfo
  const obj = { ...addressSaveInfo, ...agreementInfo, encryptSettingInfo, goodsTimeOptimizeInfo, ...goodsTypeTip }
  return obj[key as keyof typeof obj]
}
// 拉取模板列表
export const handleGetTemplateList = async () => {
  const channelScene = getChannelScene()?.channelScene
  const { code, data } = await getTemplateList({ templateId: getTemplateId(), channel: getChannel(), channelScene })
  if (code === 0) {
    templateList.value = data.list || []
    templateRecommendPop.value = data.templateRecommendPop || false
  } else {
    templateList.value = []
  }
}

export const useInit = (route = OrderPageType.单票) => {
  currentRoute.value = route
  return {
    init,
    initData,
    initWithoutFetch,
    exit,
    schema,
    themeName,
    exitVisible,
    initOrderBackPage,
    initBatchWithoutFetch,
    initPageStatus,
    templateList,
    handleGetTemplateList,
  }
}
