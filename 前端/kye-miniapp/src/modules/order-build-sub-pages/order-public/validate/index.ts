import Taro from '@tarojs/taro'
import { filterFiledSpace } from '@order-public-sub-public/utils'

// 跨子包桥接：取货/派货等页面在 order-build-sub-pages 子包，defer 校验数据经 storage 传递给下单页所在副本
// 与 order-build 副本 validate/index.ts 保持同一份 key 与读写逻辑
const DEFER_EFFECT_STORAGE_KEY = 'order_defer_effect_data'
const DEFER_EFFECT_TTL = 30 * 60 * 1000

export const setDeferEffectStorage = (data: unknown) => {
  try {
    Taro.setStorageSync(DEFER_EFFECT_STORAGE_KEY, JSON.stringify({ time: Date.now(), data }))
  } catch (e) {
    console.warn(e)
  }
}

export const takeDeferEffectStorage = () => {
  try {
    const cached = Taro.getStorageSync(DEFER_EFFECT_STORAGE_KEY)
    Taro.removeStorageSync(DEFER_EFFECT_STORAGE_KEY)
    if (!cached) return undefined
    const { time, data } = JSON.parse(cached)
    if (Date.now() - time > DEFER_EFFECT_TTL) return undefined
    return data
  } catch (e) {
    console.warn(e)
    return undefined
  }
}
import {
  AddressRestrict,
  AdjustPrice,
  ChangeKeys,
  CheckDetail,
  CheckResponse,
  ClearanceWarehouse,
  CutoffCar,
  GoodsRestrict,
  hasOrderInOrderPageDataLimitType,
  hasOrderInOrderPageDataType,
  InsuranceRestrict,
  limitType,
  localCheckResult,
  OrderResponse,
  batchAllCheckParams,
  ExtraRemoteCheckParams,
  processQuery,
  ModuleDimension,
  OrderInfo,
  GoodsDangerRestrict,
  AddedServiceFee,
} from '@order-public-sub-public/types'

import { effectBubble, resetErrorClassByDom } from '@order-public-sub-public/validate/effect/effectBubble'
import { dialogHandOut } from '@order-public-sub-public/validate/effect/effectDialog'
import { effectToast } from '@order-public-sub-public/validate/effect/effectToast'
import {
  filterAccessDefer,
  filterLimitDefer,
  getBubbleTypeList,
  getCheckByComponentList,
  getCurrentPageName,
  getModuleStyle,
  isOrderPage,
  initBatchExistValidationMap,
  sortComponentList,
  awaitInitDone,
} from '@order-public-sub-public/validate/utils'
import {
  CheckAfterSubmitType,
  CheckShowType,
  ModuleStyle,
  ModuleType,
  OrderPageType,
  validateType,
} from '@order-public-sub-public/constants'
import { checkInProcess, addedServiceFeeProcess } from '@order-public-sub-public/apis'
import { useStaticAndDynamicData } from '@order-public-sub-public/hooks/useStaticAndDynamicData'
import {
  adjustPriceLimit,
  clearLimit,
  cutoffCarLLimit,
  filterCheckResultList,
  goodsDangerLimit,
  goodsRestrictLimit,
  insuranceRestrictLimit,
  orderWarehouseLimit,
  pickerLimit,
} from '@order-public-sub-public/validate/limit/index'
import { clearValue } from '@order-public-sub-public/validate/clearValue'
import { cloneDeep, concat } from 'lodash-es'
import { capitalLize } from '@order-public-sub-public/utils/string'
import { remoteBatchCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcess'
import { BaseCheckResponse, BatchOrderInfo } from '@order-public-sub-public/apis/types'
import { useElementsChange } from '@order-public-sub-public/utils/cancel'
import { CanceledError } from 'axios'
import { handleServiceModeError } from '@order-public-sub-public/components/business/service-model/hooks/useServiceModeTypes'
import { callBusinessLogic } from '@order-public-sub-public/hooks/handleBusinessLogic'
import { remoteBatchSingleCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchSingleProcess'
import { singleFeeData } from '@order-public-sub-public/components/business/estimated-cost/hooks/singleFeePolling'
import { performanceMark } from '@order-public-sub-public/utils/reportConfig'
import { setPayModeDisabled } from '@order-public-sub-public/components/business/pay-mode/hooks/useState'
import { setDefaultScrollTop } from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { singleFeePolling } = singleFeeData()
//首页管控校验数据
let hasOrderInOrderPageData: hasOrderInOrderPageDataType | hasOrderInOrderPageDataLimitType | undefined

const { handleElementsChange, beforeProcess, afterProcess, onProcessError } = useElementsChange()

// 处理过程中数据
const { handleProcessData } = useStaticAndDynamicData()

let priceCheckTimeId: number

/* eslint-disable */
export default function useEffect() {
  /**
   * @description 校验结果分发，checkResultList数组
   * @param results 校验的数据
   * @return Promise
   */
  const limitHooksHandOut = async (results: CheckDetail[], elementsChange?: string) => {
    if (!results) {
      // await Promise.reject()
      return
    }
    let bubbleTypeList = await getBubbleTypeList(results)
    const resultItem = results[0]
    if (resultItem?.preLimitType === 'payModeLimit') {
      setPayModeDisabled(false)
    }
    // if (!resultItem?.showType) {
    //   await Promise.reject()
    //   return
    // }
    switch (Number(resultItem?.showType)) {
      case CheckShowType.DIALOG:
        const mask = await dialogHandOut(resultItem)
        if (mask) {
          piniaStore.globalData.setMaskInstance({ data: mask.unmount })
        }
        break
      case CheckShowType.TOAST:
        await effectToast(resultItem)
    }
    if (bubbleTypeList.length > 0) {
      const productInfoPage = elementsChange === 'productInfo' && getCurrentPageName() === 'product-info'
      const needFirstToast = elementsChange === 'waybill' || productInfoPage
      await effectBubble(bubbleTypeList, {
        needFirstToast: needFirstToast ? true : false,
      })
    }
  }

  /**
   * @description 管控分发，restrictData字段
   * @param type 管控的类型
   * @param results 管控的数据
   * @return Promise
   */
  const limitSpecialHandOut = async (type: CheckAfterSubmitType, results?: limitType) => {
    if (!results) {
      return
    }
    setDefaultScrollTop()
    switch (type) {
      case CheckAfterSubmitType.取派管控:
        return await pickerLimit(<AddressRestrict>results)
      case CheckAfterSubmitType.调价:
        return await adjustPriceLimit(<AdjustPrice>results, type)
      case CheckAfterSubmitType.截单专车:
        await cutoffCarLLimit(<CutoffCar>results, type)
        break
      case CheckAfterSubmitType.报关入仓:
      case CheckAfterSubmitType.报关出仓:
        await orderWarehouseLimit(<ClearanceWarehouse>results)
        break
      case CheckAfterSubmitType.托寄物:
        await goodsRestrictLimit(<GoodsRestrict>results)
        break
      case CheckAfterSubmitType.投保管控:
        await insuranceRestrictLimit(<InsuranceRestrict>results)
        break
      case CheckAfterSubmitType.危险品管控:
        await goodsDangerLimit(<GoodsDangerRestrict>results)
        break
      default:
        console.log('other limit', type)
    }
  }

  /**
   * @description 全局校验
   * @param needRemote boolean 是否需要远程校验
   * @param onlyClear boolean 是否只清空副作用
   * @return Promise
   */
  const allCheck = async (needRemote: boolean, onlyClear?: boolean, filterList?: string[]) => {
    return new Promise((resolve) => {
      //注册组件的校验函数数组，剔除需要忽略的模块
      let componentList = piniaStore.globalData.componentList || []
      componentList = sortComponentList(componentList)
      if (Array.isArray(filterList)) {
        componentList = componentList.filter((i) => !filterList.map((f) => capitalLize(f)).includes(i))
      }
      const checkMapList: Array<() => Promise<localCheckResult>> = getCheckByComponentList(componentList)
      //本地校验结果
      Promise.all(checkMapList.map((i) => i())).then((res) => {
        res = res.flat().map((i) => {
          return {
            blockedFlag: true,
            ...i,
          }
        })
        console.log('res', res)
        try {
          resetErrorClassByDom(res)
        } catch (e) {
          console.warn(e)
        }
        if (onlyClear) {
          return resolve(res)
        }
        const noPassFilter = res.filter((i) => !i.passed)
        const localCheckFail = noPassFilter.length > 0
        if (localCheckFail) {
          return resolve(
            effectBubble(noPassFilter, {
              needCompatible: true,
            }),
          )
        }
        if (needRemote) {
          return resolve(remoteCheck())
        }
        resolve(res)
      })
    })
  }

  /**
   * @description 批量全局校验
   * @param needRemote boolean 是否需要远程校验
   * @param onlyClear boolean 是否只清空副作用
   * @return Promise
   */
  const batchAllCheck = async (params: batchAllCheckParams) => {
    const { needRemote, onlyClear, filterList, waybillNumber } = params
    // const orderPageType = piniaStore.root.getOrderPageType
    //注册组件的校验函数数组，剔除需要忽略的模块
    let componentList = piniaStore.globalData.componentList || []
    if (!componentList) {
      componentList = []
    }
    initBatchExistValidationMap()
    // const waybillBatchData = cloneDeep(
    //     (piniaStore.order.orderState as unknown as BatchOrderInfo).waybillInfoList
    // ).filter((item) => !item.isTemporaryData)

    // let waybillNumberList = waybillBatchData.map((i) => i.waybillNumber)
    let waybillNumberList: string[] = []
    if (waybillNumber) {
      waybillNumberList = [waybillNumber]
    }
    if (Array.isArray(filterList)) {
      componentList = componentList.filter((i) => !filterList.map((f) => capitalLize(f)).includes(i))
    }
    //批量填写去除Sender
    componentList = componentList.filter((c) => c !== ModuleType.寄方信息)

    const checkMapList: Array<() => Promise<localCheckResult>> = getCheckByComponentList(componentList)
    let batchCheckMapList: Array<() => Promise<localCheckResult>> = waybillNumberList.reduce(
      (acc: Array<() => Promise<localCheckResult>>, val) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const newCheckMapList = checkMapList.map((f) => () => f(val))
        return acc.concat(newCheckMapList)
      },
      [],
    )
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const validateCollectionSender: any = getCheckByComponentList([ModuleType.寄方信息]).map((f) => () => f())
    batchCheckMapList = concat(validateCollectionSender, batchCheckMapList)

    await locationCheckFunHandle(batchCheckMapList, needRemote, onlyClear)
  }
  /**
   * @description 本地校验函数执行并触发副作用
   * @param needRemote boolean 是否需要远程校验
   * @param onlyClear boolean 是否只清空副作用
   * @return Promise
   */

  const locationCheckFunHandle = async (
    list: (() => Promise<localCheckResult>)[],
    needRemote?: boolean,
    onlyClear?: boolean,
  ) => {
    let res = await Promise.all(list.map((i) => i()))
    res = res.flat().map((i) => {
      return {
        blockedFlag: true,
        ...i,
      }
    })
    console.log('res', res)
    return new Promise((resolve) => {
      try {
        resetErrorClassByDom(res)
      } catch (e) {
        console.warn(e)
      }
      if (onlyClear) {
        return resolve(res)
      }
      const noPassFilter = res.filter((i) => !i.passed)
      const localCheckFail = noPassFilter.length > 0
      if (localCheckFail) {
        return resolve(effectBubble(noPassFilter))
      }
      if (needRemote) {
        return resolve(remoteCheck())
      }
      resolve(res)
    })
  }

  /**
   * @description 保费，代收货款，得到的数据会更新到ModuleDimension
   * @param temporaryData 临时值，会合并到store一起校验，只支持一级属性合并，比如{receive：''}
   * @param moduleStyle 前端展示方式，兼容增值服务平铺中还有弹窗的场景
   * @param extraRemoteCheckParams 更多场景传值入口, 用于特殊场景处理
   */
  const priceCheck = async (params: {
    temporaryData?: object
    premiumType?: number | string
    extraRemoteCheckParams?: any
    moduleStyle?: ModuleStyle
  }) => {
    const { temporaryData, extraRemoteCheckParams, moduleStyle, premiumType } = params
    console.log(moduleStyle)
    //等待初始化接口完成
    await awaitInitDone()
    let processQuery: processQuery = {} as processQuery

    // 处理运单数据orderInfo
    const storeFormData = piniaStore.order.orderState
    const formData = Object.assign({}, storeFormData, temporaryData)
    const filterFormData = filterFiledSpace(formData) // 处理手机号空格
    processQuery.orderInfo = filterFormData
    processQuery.premiumType = premiumType

    processQuery.typeList = [1, 2]

    // 合并其他参数
    processQuery = Object.assign(processQuery, extraRemoteCheckParams)
    clearTimeout(priceCheckTimeId)
    priceCheckTimeId = setTimeout(async () => {
      // 费用计算接口调用
      try {
        const { data } = await addedServiceFeeProcess(processQuery)
        updateModuleDimensionByType(data)
      } catch (error) {
        console.log(error)
      }
    }, 300)
  }

  /**
   * 更新数据
   * @param data
   */
  const updateModuleDimensionByType = (data: AddedServiceFee) => {
    const updataObj: ModuleDimension = {
      addedService: {
        collectionAmount: data.collectionAmount,
      },
      protectPrice: data.protectPrice,
      receiptFee: data.receiptFee,
    } as ModuleDimension
    if (data.collectionAmount) {
      piniaStore.schema.updateModuleDimensionByType({
        type: ModuleType['增值服务'],
        data: updataObj.addedService,
      })
    }
    if (data.protectPrice) {
      piniaStore.schema.updateModuleDimensionByType({
        type: ModuleType['物品保价'],
        data: updataObj.protectPrice,
      })
    }
    if (data.receiptFee) {
      piniaStore.schema.updateModuleDimensionByType({
        type: ModuleType['回单费'],
        data: updataObj.receiptFee,
      })
    }
  }

  /**
   * @description 远程校验 TODO 修改temporaryData的类型，不能是object
   * @param key 需要校验的ChangeKeys
   * @param temporaryData 临时值，会合并到store一起校验，只支持一级属性合并，比如{receive：''}
   * @param moduleStyle 前端展示方式，兼容增值服务平铺中还有弹窗的场景
   * @param cacheStrategy 缓存策略,仅特殊场景需要传入20，让页面不缓存
   */
  const remoteCheck = async (
    key?: ChangeKeys,
    temporaryData?: object,
    moduleStyle?: ModuleStyle | undefined,
    cacheStrategy?: number | null,
    extraRemoteCheckParams?: ExtraRemoteCheckParams,
    pageSource?: string,
    waybillNumber?: string,
  ) => {
    const currentPageName = getCurrentPageName() //当前页面路由名字

    // 搜索ignoreIsSamePage 可以看到使用地方
    // 相同地址弹框的时候 检验是否是同个页面则不会走过程和服务方式
    let ignoreIsSamePage = false
    if ((temporaryData as { ignoreIsSamePage: boolean })?.ignoreIsSamePage) {
      ignoreIsSamePage = (temporaryData as { ignoreIsSamePage: boolean })?.ignoreIsSamePage
      delete (temporaryData as any).ignoreIsSamePage
    }

    //等待初始化接口完成
    await awaitInitDone()

    // 更新遮罩层hotZoneStore
    const hotZoneStoreKyes: string[] = [
      'Sender',
      'Receive',
      'PickupMode',
      'GoodsTime',
      'PayMode',
      'ProductInfo',
      'OverAreaDelivery',
      'ServiceMode',
      'ProtectPrice',
    ]
    if (hotZoneStoreKyes.includes(key as string)) {
      piniaStore.extend.updateHotZoneStore({
        data: { [key as ModuleType]: true },
      })
    }
    const orderPageType = piniaStore.root.getOrderPageType
    const isBatch = orderPageType === OrderPageType.批量寄

    // 收件地址切换需要特殊处理
    const isBatchReceivePage = pageSource === 'page' && isBatch

    let storeFormData = isBatch
      ? (piniaStore.order.orderState as unknown as BatchOrderInfo).commonWaybillInfo?.waybillInfo || {}
      : piniaStore.order.orderState

    if (isBatchReceivePage) {
      storeFormData = piniaStore.order.orderWaybillInfo(waybillNumber)?.waybillInfo || {}
    }

    performanceMark('remoteCheckStart5')

    const formData = Object.assign({}, storeFormData, temporaryData)

    // console.log('formData', storeFormData, temporaryData)

    performanceMark('remoteCheckStartFormData6')
    // 处理手机号空格
    const filterFormData = filterFiledSpace(formData as OrderInfo)

    // 标识过程中接口开始执行
    piniaStore.globalData.setProcessLoading({ loading: true })

    const cacheStrategyParams = cacheStrategy
      ? {
          cacheStrategy: cacheStrategy || undefined,
        }
      : undefined
    // 批量寄子运单过程中处理
    const needBatchSingleCheck =
      orderPageType === OrderPageType.批量寄单票 ||
      isBatchReceivePage ||
      getCurrentPageName() === OrderPageType.批量寄单票
    if (needBatchSingleCheck) {
      // return remoteBatchSingleCheck(key, filterFormData, moduleStyle, undefined, cacheStrategyParams)
      return remoteBatchSingleCheck({
        key,
        temporaryData: filterFormData,
        moduleStyle,
        extraParams: cacheStrategyParams,
      })
    }

    // 批量寄过程中处理
    if (orderPageType === OrderPageType.批量寄) {
      performanceMark('remoteCheckProcessStart7')
      // 批量寄逻辑处理
      return remoteBatchCheck(key, filterFormData, moduleStyle, undefined, cacheStrategyParams)
    }

    const processPromise = new Promise(async (resolve, reject) => {
      const keyList: ChangeKeys[] = [key] as ChangeKeys[]

      // 获取本次要发送的changeKeys
      const keys = handleElementsChange(keyList, beforeProcess) as ChangeKeys[]
      const { callFlag = false } = extraRemoteCheckParams || {}
      try {
        const processQuery = {
          orderInfo: filterFormData,
          elementsChange: keys,
          moduleStyle: moduleStyle || getModuleStyle(key),
          pageName: getCurrentPageName(),
          cacheStrategy,
          callFlag,
        }

        performanceMark('remoteCheckProcessRequestStart8')
        const { data } = await checkInProcess(processQuery)

        performanceMark('remoteCheckProcessRequestEnd9')

        handleProcessData(data)

        performanceMark('remoteCheckProcessRequestEndData10')

        handleElementsChange(keys || [], afterProcess)
        if (data?.moduleDimension?.estimateFeeTaskId) {
          singleFeePolling(data?.moduleDimension?.estimateFeeTaskId)
        }

        performanceMark('remoteCheckProcessElementChange11')

        //如果发起远程的页面已经发生变化，则不触发副作用
        if (currentPageName !== getCurrentPageName() && !ignoreIsSamePage) {
          return reject(false)
        }

        const resolveData = {
          data,
          businessLogic: {
            data,
            options: { tempOrderInfo: filterFiledSpace(temporaryData as OrderInfo), processQuery },
          },
          status: true,
        }

        performanceMark('remoteCheckProcessDataHandOutStart12')

        remoteCheckDataHandOut(data, key)
          .then(() => {
            resolve({ ...resolveData, status: true })
          })
          .catch((err) => {
            resolveData.data = err
            reject({ ...resolveData, status: false })
          })
      } catch (error) {
        handleElementsChange(keys || [], onProcessError)
        reject({ data: error, status: false })
        if (!(error instanceof CanceledError)) {
          const keyParams = key || []
          handleServiceModeError(keys, {
            key: keyParams,
            temporaryData,
            moduleStyle,
            cacheStrategy: cacheStrategy || undefined,
            extraRemoteCheckParams,
          })
        }
        console.log('过程中接口调用失败')
      } finally {
        piniaStore.globalData.setProcessLoading({ loading: false })
      }
    })
    piniaStore.globalData.setProcessPromise({ processPromise: processPromise })
    // 走统一process处理逻辑，并保存serviceModePromise
    const serviceModePromise = callBusinessLogic(processPromise)

    piniaStore.globalData.setServiceModePromise({ serviceModePromise, orderPageType })
    return processPromise
  }

  /**
   * @description 远程校验数据处理
   * @param data 校验结果数据
   * @return promise 通过resolve，未通过reject
   */
  const remoteCheckDataHandOut = async (
    data: CheckResponse | OrderResponse | BaseCheckResponse,
    elementsChange?: string,
  ) => {
    let { checkResultList = [], restrictData } = data || {}
    //checkResultList过滤，特殊处理粘贴板，如果内容不满足，直接剔除
    // 销毁遮罩
    const unmount = piniaStore.globalData.getMaskInstance
    if (unmount) {
      unmount()
    }
    try {
      checkResultList = await filterCheckResultList(checkResultList)
    } catch (e) {
      console.warn(e)
    }
    //校验有弹框
    const hasDialog = Array.isArray(checkResultList) && checkResultList.find((i) => i.showType == CheckShowType.DIALOG)
    //校验中有中断流程
    const hasBlockedFlag = Array.isArray(checkResultList) && checkResultList.find((i) => i.blockedFlag)

    let { restrictFlagList = [], cleanElements } = restrictData || {}
    try {
      //过滤处理延迟校验结果的
      hasOrderInOrderPageData = filterAccessDefer(checkResultList) || filterLimitDefer(restrictFlagList, restrictData)
      console.log('hasOrderInOrderPageData1', hasOrderInOrderPageData)
      //跨子包桥接：defer 数据写入 storage，供下单页（order-build 副本）effectInOrderPage 消费
      if (hasOrderInOrderPageData) {
        setDeferEffectStorage(hasOrderInOrderPageData)
      }
      //执行清空
      clearValue(cleanElements)
      //清空对应副作用
      clearLimit(cloneDeep(restrictData))
    } catch (e) {
      console.warn(e)
    }
    return new Promise((resolve) => {
      //命中管控
      const hasLimit = Array.isArray(restrictFlagList) && restrictFlagList.length
      //如果有首页要触发的副作用，并在当前在首页则中断
      if (hasOrderInOrderPageData && isOrderPage()) {
        return resolve(checkResultList)
      }
      //如果有校验弹框，就只展示校验
      if (hasDialog || hasBlockedFlag) {
        return resolve(limitHooksHandOut(checkResultList, elementsChange))
      }
      if (hasLimit && elementsChange !== 'init') {
        let { flag } = restrictFlagList[0]
        let key: CheckAfterSubmitType = flag
        //报关出入仓取同一个值
        if ([CheckAfterSubmitType.报关入仓, CheckAfterSubmitType.报关出仓].includes(flag)) {
          key = CheckAfterSubmitType.报关出入仓
        }
        const limitData = restrictData?.[key]
        return resolve(limitSpecialHandOut(flag, limitData))
      }
      resolve(limitHooksHandOut(checkResultList, elementsChange))
    })
  }

  //处理只在首页需要的校验数据或者管控数据
  const effectInOrderPage = () => {
    setTimeout(async () => {
      //本副本无 defer 数据时，尝试从 storage 读取其他子包副本桥接过来的数据
      let deferData = hasOrderInOrderPageData
      if (!deferData) {
        deferData = takeDeferEffectStorage()
      } else {
        //本副本已有 defer 数据，storage 桥接值作废，清除避免重复弹框
        try {
          Taro.removeStorageSync(DEFER_EFFECT_STORAGE_KEY)
        } catch (e) {
          console.warn(e)
        }
      }
      if (!deferData) {
        return
      }
      const { type } = deferData
      try {
        if (type === validateType.校验 && 'accessData' in deferData) {
          const { accessData } = deferData
          await limitHooksHandOut(accessData)
        } else if (type === validateType.管控 && 'limitData' in deferData) {
          const { flag, limitResult } = deferData.limitData
          await limitSpecialHandOut(flag, limitResult)
        }
      } finally {
        hasOrderInOrderPageData = undefined
      }
    })
  }

  return {
    effectBubble,
    allCheck,
    batchAllCheck,
    priceCheck,
    remoteCheck,
    limitHooksHandOut,
    limitSpecialHandOut,
    remoteCheckDataHandOut,
    effectInOrderPage,
  }
}
/* eslint-disable */
