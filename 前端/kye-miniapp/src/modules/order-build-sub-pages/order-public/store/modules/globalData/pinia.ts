import { defineStore } from 'pinia'
import {
  CheckDetail,
  OrderInfo,
  PlainObject,
  RelationMap,
  RemoteCheckParams,
  RestrictData,
  pageDefaultInfoType,
} from '@order-public-sub-public/types'
import {
  CommonDynamicItem,
  DynamicConfig,
  InitResponse,
  preConfigInitResponse,
  StaticConfig,
} from '@order-public-sub-public/apis/types'
import {
  EstimateFeeByTaskIdResponseResultItem,
  EstimateFeeMap,
  GetEstimateFeeByTaskIdResponse,
} from '@order-public-sub-public/apis/waybill/estimated-cost'
import { OrderPageType, ReturnWaybillBackType } from '@order-public-sub-public/constants'
import { ExtendOrderCustomer, GlobalState } from '../../types'
import { useOrderRootStore } from '../../pinia'
import { cloneDeep, isEmpty } from 'lodash-es'
import { AddressLabel, AddressReminderItem } from '@order-public-sub-public/apis/address/types'

export const useGlobalDataStore = defineStore('globalData', {
  state: () => ({
    [OrderPageType.单票]: {
      eventsMap: {} as RelationMap,
      componentList: [],
      existComponentMap: {},
      userInfo: {
        phone: '',
        nickName: '',
        name: '',
      },
      processLoading: false,
      initDataPromise: null,
      processPromise: null,
      serviceModePromise: null,
      restrictData: {} as RestrictData,
      dynamicConfig: {} as DynamicConfig,
      checkResultList: [],
      preConfig: {
        preConfigId: '',
        preVersionId: '',
        preThemeName: '',
      },
      currentConfig: {
        configId: '',
        versionId: '',
        themeName: '',
        currentThemeName: '',
      },
      initConfig: {} as InitResponse,
      estimatedCost: {} as GetEstimateFeeByTaskIdResponse,
      orderPageType: OrderPageType.单票,
      currentWaybillNumber: '',
      returnWaybillNumber: '',
      returnWaybillInfo: {},
      restrictWaybillNumber: '',
      goWaybillNumber: '',
      staticConfigAndWaybillInfo: {},
      isEditAndReturnWaybill: false,
      returnWaybillBackType: ReturnWaybillBackType.返回,
      tempWaybillInfo: {} as Pick<OrderInfo, 'addedService'>,
      maskInstance: null,
      batchId: '',
      scrollTop: 0,
      userDefaultSettingInfo: {} as pageDefaultInfoType,
      preConfigProcess: {} as preConfigInitResponse,
      serviceModeLoading: false,
      serviceModeError: {
        error: false,
        remoteCheckParams: undefined,
      },
      recommendAddressTime: 0,
      addressLabelList: [] as AddressLabel[], // 自定义标签
      addressReminders: [] as AddressReminderItem[], // 地址提醒数据
      addressReminderPromise: null as Promise<unknown> | null, // 地址提醒接口Promise缓存
    },
    [OrderPageType.返程单]: {} as GlobalState,
    [OrderPageType.预览]: {} as GlobalState,
  }),
  getters: {
    componentList: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].componentList
    },
    processLoading: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].processLoading
    },
    restrictData: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].restrictData
    },
    dynamicConfig: (state) => (type: keyof DynamicConfig) => {
      const rootState = useOrderRootStore()
      return (state[rootState.getOrderPageType] as GlobalState)?.dynamicConfig[type]
    },
    allDynamicConfig: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].dynamicConfig
    },
    checkResultList: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].checkResultList
    },
    addressReminders: (state) => {
      const rootState = useOrderRootStore()
      return (state[rootState.getOrderPageType] as GlobalState)?.addressReminders || []
    },
    addressReminderPromise: (state) => {
      const rootState = useOrderRootStore()
      return (state[rootState.getOrderPageType] as GlobalState)?.addressReminderPromise ?? null
    },
    initConfig: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].initConfig || ({} as InitResponse)
    },
    estimatedCost: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].estimatedCost
    },
    restrictWaybillNumber: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].restrictWaybillNumber
    },
    returnWaybillNumber: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].returnWaybillNumber
    },
    goWaybillNumber: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].goWaybillNumber
    },
    staticConfigAndWaybillInfo: (state) => {
      const rootState = useOrderRootStore()
      return (waybillNumber: string) => state[rootState.getOrderPageType].staticConfigAndWaybillInfo?.[waybillNumber]
    },
    returnWaybillBackType: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].returnWaybillBackType
    },
    returnEditDisableInfo: (state) => (type: keyof DynamicConfig, key: string) => {
      const rootState = useOrderRootStore()
      const extraInfo = state[rootState.getOrderPageType].dynamicConfig[type]
      if (extraInfo?.disabledInfos?.length) {
        return extraInfo.disabledInfos.filter((item) => item.key === key)[0] || {}
      } else {
        return {}
      }
    },
    returnRequiredInfosInfo: (state) => (type: keyof DynamicConfig, key: string) => {
      const rootState = useOrderRootStore()
      const extraInfo = state[rootState.getOrderPageType].dynamicConfig[type]
      if (extraInfo?.requiredInfos?.length) {
        return extraInfo.requiredInfos.filter((item) => item.key === key)[0] || {}
      } else {
        return {}
      }
    },
    preConfigProcess: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].preConfigProcess
    },
    serviceModeError: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].serviceModeError
    },
    serviceModeLoading: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].serviceModeLoading
    },
    serviceModePromise: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].serviceModePromise
    },
    recommendAddressTime: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].recommendAddressTime
    },
    tempWaybillInfo: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].tempWaybillInfo
    },
    initDataPromise: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].initDataPromise
    },
    processPromise: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].processPromise
    },
    preConfig: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].preConfig
    },
    currentConfig: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].currentConfig
    },
    getGlobalData: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType]
    },
    getGlobalDataByType: (state) => {
      return (type: OrderPageType) => state[type]
    },
    getMaskInstance: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].maskInstance
    },
    getBatchId: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].batchId
    },
    getScrollTop: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].scrollTop
    },
    userDefaultSettingInfo: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].userDefaultSettingInfo
    },
    getReturnWaybillInfo: (state) => (orderPageType) => {
      const rootState = useOrderRootStore()
      return state[orderPageType || rootState.getOrderPageType].returnWaybillInfo || {}
    },
    addressLabelList: (state) => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType].addressLabelList || []
    },
  },
  actions: {
    setGlobalData(payload: { data: GlobalState; orderPageType?: OrderPageType; reset?: boolean }) {
      const rootState = useOrderRootStore()
      const { orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType] = payload.data
    },
    setEventsMap(payload: { map: RelationMap; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { map, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].eventsMap = { ...this[orderPageType].eventsMap, ...map }
    },
    resetEventsMap(orderPageType) {
      const rootState = useOrderRootStore()
      orderPageType = orderPageType || rootState.getOrderPageType
      if (this[orderPageType]?.eventsMap) {
        this[orderPageType].eventsMap = {}
      }
    },
    setComponentsMap(payload: { map: RelationMap; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { map, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].existComponentMap = { ...this[orderPageType].existComponentMap, ...map }
    },
    resetComponentsMap(orderPageType) {
      const rootState = useOrderRootStore()
      orderPageType = orderPageType || rootState.getOrderPageType
      if (this[orderPageType]?.existComponentMap) {
        this[orderPageType].existComponentMap = {}
      }
    },
    setComponentList(payload: { key: string | string[]; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { key, orderPageType = rootState.getOrderPageType } = payload
      const preItem = 'EstimatedCost'
      const newComponentList = Array.isArray(key) ? key : [key] || []
      const tempArray = newComponentList.concat(this[orderPageType]?.componentList)
      this[orderPageType].componentList = Array.from(new Set([...tempArray, preItem]))
    },
    resetComponentList(orderPageType) {
      const rootState = useOrderRootStore()
      orderPageType = orderPageType || rootState.getOrderPageType
      if (this[orderPageType]?.componentList) {
        this[orderPageType].componentList = []
      }
    },
    setRestrictData(payload: { restrictData: RestrictData; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { restrictData, orderPageType = rootState.getOrderPageType } = payload
      if (!this[orderPageType]?.restrictData) {
        this[orderPageType].restrictData = restrictData
      } else {
        for (const key in restrictData) {
          if (
            (key === 'insuranceRestrict' && restrictData[key as keyof RestrictData] !== null) ||
            key !== 'insuranceRestrict'
          ) {
            Reflect.set(this[orderPageType].restrictData, key, restrictData[key as keyof RestrictData])
          }
        }
      }
    },
    setProcessLoading(payload: { loading: boolean; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { loading, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType] && (this[orderPageType].processLoading = loading)
    },
    setDynamicConfig(payload: { dynamicConfig: DynamicConfig; isClear?: boolean; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { dynamicConfig, orderPageType = rootState.getOrderPageType, isClear } = payload
      if (isClear) {
        this[orderPageType].dynamicConfig = {} as DynamicConfig
        return
      }
      if (!dynamicConfig) {
        return
      }
      for (const key in dynamicConfig) {
        if (dynamicConfig?.[key as keyof DynamicConfig]) {
          Reflect.set(this[orderPageType].dynamicConfig, key, dynamicConfig[key as keyof DynamicConfig])
        }
      }
    },
    setDynamicConfigItem(payload: {
      configItem: {
        key: string
        value: CommonDynamicItem
      }
      orderPageType?: OrderPageType
    }) {
      const rootState = useOrderRootStore()
      const { configItem, orderPageType = rootState.getOrderPageType } = payload
      if (!configItem) {
        return
      }
      Reflect.set(this[orderPageType].dynamicConfig, configItem.key, configItem.value)
    },
    setCheckResultList(payload: { checkResultList: CheckDetail[]; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { checkResultList, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].checkResultList = checkResultList
    },
    setAddressReminders(payload: { addressReminders: AddressReminderItem[]; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { addressReminders, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].addressReminders = addressReminders
    },
    setAddressReminderPromise(payload: {
      addressReminderPromise: Promise<unknown> | null
      orderPageType?: OrderPageType
    }) {
      const rootState = useOrderRootStore()
      const { addressReminderPromise, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].addressReminderPromise = addressReminderPromise
    },
    setPreConfig(payload: { orderPageType?: OrderPageType; preConfig: GlobalState['preConfig'] }) {
      const rootState = useOrderRootStore()
      const { orderPageType = rootState.getOrderPageType, preConfig } = payload
      this[orderPageType].preConfig = { ...this[orderPageType].preConfig, ...preConfig }
    },
    setCurrentConfig(payload: { orderPageType?: OrderPageType; currentConfig: GlobalState['currentConfig'] }) {
      const rootState = useOrderRootStore()
      const { orderPageType = rootState.getOrderPageType, currentConfig } = payload
      this[orderPageType].currentConfig = { ...this[orderPageType].currentConfig, ...currentConfig }
    },
    setInitDataPromise(payload: { initDataPromise: Promise<unknown> | null; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { initDataPromise, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].initDataPromise = initDataPromise
    },
    setProcessPromise(payload: { processPromise: Promise<unknown> | null; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { processPromise, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].processPromise = processPromise
    },
    setServiceModePromise(payload: { serviceModePromise: Promise<unknown> | null; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { serviceModePromise, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].serviceModePromise = serviceModePromise
    },
    deleteEstimateResponses(payload: { waybillNumber: string; orderPageType: OrderPageType }) {
      const { waybillNumber } = payload
      const rootState = useOrderRootStore()
      const orderPageType = payload.orderPageType || rootState.getOrderPageType
      let estimatedCost = this[orderPageType].estimatedCost as GetEstimateFeeByTaskIdResponse
      if (waybillNumber === 'all') {
        estimatedCost = {} as GetEstimateFeeByTaskIdResponse
      } else {
        const hash = estimatedCost?.responsesMap
        if (hash && hash[waybillNumber]) {
          // 删除运单时 清除费用缓存
          delete hash[waybillNumber]
          estimatedCost.responsesMap = hash
          const list = estimatedCost.responses.filter((x) => x.waybillNumber !== waybillNumber)
          estimatedCost.responses = list
        }
      }
      this[orderPageType].estimatedCost = estimatedCost
    },
    setInitConfig(payload: { initConfig: InitResponse; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { initConfig, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].initConfig = initConfig
    },
    setWaybillEstimatedCost(payload: {
      data: GetEstimateFeeByTaskIdResponse
      cacheStrategy?: number
      orderPageType: OrderPageType
    }) {
      const rootState = useOrderRootStore()
      const { data, orderPageType = rootState.getOrderPageType } = payload
      const estimatedCost = this[orderPageType].estimatedCost
      const responses = data?.responses
      let hash = {} as EstimateFeeMap
      if (responses?.length) {
        const responsesList = [] as EstimateFeeByTaskIdResponseResultItem[]
        // 每次后端只会返回当前修改的单个运单 所以需要和历史的数据做合并
        if (estimatedCost?.responsesMap) {
          hash = estimatedCost.responsesMap
        }
        responses.forEach((x) => {
          if (x.waybillNumber) {
            hash[x.waybillNumber] = x
          }
        })
        Object.keys(hash).forEach((x) => {
          responsesList.push(hash[x])
        })
        responsesList.sort((first, last) => Number(first?.onlyOne) - Number(last.onlyOne))
        data.responses = responsesList
        data.responsesMap = hash
        this[orderPageType].estimatedCost = data
      } else {
        if (isEmpty(this[orderPageType].estimatedCost)) {
          // 没有state.estimatedCost时 从
          const dynamicConfig = this[orderPageType]?.initConfig?.configDimension?.dynamicConfig?.estimatedCost
          this[orderPageType].estimatedCost = {
            estimateFeeTip: dynamicConfig?.estimateFeeTip || '',
            noEstimateFeeText: dynamicConfig?.noEstimateFeeText || '',
            visible: dynamicConfig?.visible,
          } as GetEstimateFeeByTaskIdResponse
        } else {
          const dynamicConfig = this[orderPageType]?.initConfig?.configDimension?.dynamicConfig?.estimatedCost
          this[orderPageType].estimatedCost = Object.assign({}, this[orderPageType].estimatedCost, {
            estimateFeeTip: data?.estimateFeeTip || dynamicConfig?.estimateFeeTip || '',
            noEstimateFeeText: data?.noEstimateFeeText || dynamicConfig?.noEstimateFeeText || '',
            batchTips: data?.batchTips || '',
            visible: data.visible,
            batchAmount: data.batchAmount,
          })
        }
      }
      ;(this[orderPageType].estimatedCost as GetEstimateFeeByTaskIdResponse).cacheResponseResult = null
    },
    setCurrentWaybillNumber(payload: { waybillNumber: string; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { waybillNumber, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].currentWaybillNumber = waybillNumber
    },
    setReturnWaybillNumber(payload: { waybillNumber: string; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { waybillNumber, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].returnWaybillNumber = waybillNumber
    },
    setRestrictWaybillNumber(payload: { waybillNumber: string; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { waybillNumber, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].restrictWaybillNumber = waybillNumber
    },
    setGoWaybillNumber(payload: { waybillNumber: string; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { waybillNumber, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].goWaybillNumber = waybillNumber
    },
    setStaticConfigAndWaybillInfo(payload: {
      staticConfig: StaticConfig
      waybillInfo: OrderInfo
      dynamicConfig: DynamicConfig
      batchId: string
      orderCustomer: Partial<ExtendOrderCustomer>
      orderPageType?: OrderPageType
    }) {
      const rootState = useOrderRootStore()
      const {
        staticConfig,
        waybillInfo,
        dynamicConfig,
        batchId,
        orderCustomer,
        orderPageType = rootState.getOrderPageType,
      } = payload
      this[orderPageType].staticConfigAndWaybillInfo = {
        ...this[orderPageType].staticConfigAndWaybillInfo,
        [waybillInfo.waybillNumber]: {
          staticConfig: cloneDeep(staticConfig),
          waybillInfo: cloneDeep(waybillInfo),
          dynamicConfig: cloneDeep(dynamicConfig),
          orderCustomer: cloneDeep(orderCustomer),
          batchId,
        },
      }
    },
    clearStaticConfigAndWaybillInfo(payload: { orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].staticConfigAndWaybillInfo = {}
      this[orderPageType].currentWaybillNumber = ''
      this[orderPageType].returnWaybillNumber = ''
      this[orderPageType].returnWaybillInfo = {}
    },
    setIsEditAndReturnWaybill(payload: { flag: boolean; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { flag, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].isEditAndReturnWaybill = flag
    },
    setReturnWaybillBackType(payload: { type: ReturnWaybillBackType; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { type, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].returnWaybillBackType = type
    },
    setTempWaybillInfo(payload: { data: Pick<OrderInfo, 'addedService'>; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { data, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].tempWaybillInfo = data
    },
    setMaskInstance(payload: { data: any; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { data, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].maskInstance = data
    },
    setBatchId(payload: { batchId: string; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { batchId, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].batchId = batchId
    },
    setScrollTop(payload: { scrollTop: number; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { scrollTop, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].scrollTop = scrollTop
    },
    setServiceModeError(payload: {
      error: boolean
      remoteCheckParams?: RemoteCheckParams
      orderPageType?: OrderPageType
    }) {
      const rootState = useOrderRootStore()
      const { error, remoteCheckParams, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].serviceModeError = { error, remoteCheckParams }
    },
    serServiceModeLoading(payload: { loading: boolean; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { loading, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].serviceModeLoading = loading
    },
    serServiceModePromise(payload: { serviceModePromise: Promise<unknown> | null; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { serviceModePromise, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].serviceModePromise = serviceModePromise
    },
    serRecommendAddressTime(payload: { time: number; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { time, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].recommendAddressTime = time
    },
    serPreConfigProcess(payload: { data?: preConfigInitResponse; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { data = {}, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].preConfigProcess = data
    },
    serUserDefaultSettingInfo(payload: { data: pageDefaultInfoType; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { data, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].userDefaultSettingInfo = data
    },
    setReturnWaybillInfo(payload: { data: OrderInfo | PlainObject; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { data, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].returnWaybillInfo = data
    },
    setAddressLabelList(payload: { list: AddressLabel[]; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { list, orderPageType = rootState.getOrderPageType } = payload
      this[orderPageType].addressLabelList = list
    },
  },
})
