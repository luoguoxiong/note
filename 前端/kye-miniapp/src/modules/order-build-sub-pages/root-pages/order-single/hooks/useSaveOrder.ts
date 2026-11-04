import { filterFiledSpace, getQueryObject, getWaybillSource, $native as native } from '@order-public-sub-public/utils'
import { computed, ref } from 'vue'
import {
  ChangeKeys,
  CheckResponse,
  OrderInfo,
  OrderResponse,
  OrderSuccessPageConfig,
  QueryObject,
} from '@order-public-sub-public/types'
import { OrderStatus } from '../constants'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { checkInProcess, modifyOrder, submitAdjustOrder, submitOrder } from '@order-public-sub-public/apis'

import useEffect from '@order-public-sub-public/validate'
import { useStaticAndDynamicData } from '@order-public-sub-public/hooks/useStaticAndDynamicData'
import { ErrorMsg } from '@order-public-sub-public/constants/error'
import { isEqual, isNull, isObject } from 'lodash-es'
import { Channel, ModuleStyle, ModuleType, OrderPageType, YesOrNoString } from '@order-public-sub-public/constants'
import { getBatchId, getChannel } from '@order-public-sub-public/configs'
import { hiddenEstimatedCostModal } from '@order-public-sub-public/components/business/estimated-cost/hooks/data'
import { resetWaybillInfo } from '@order-public-sub-public/utils/waybillInfo'
import { effectMasker } from '@order-public-sub-public/validate/effect/effectPopup'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { handleAssembleData } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcessUtils'
import { remoteBatchSingleCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchSingleProcess'
import { batchWaybillPrompt } from './useBatchWaybillPrompt'
// import { getOnlineH5Url } from '@order-public-sub-public/utils/env'
import { useLinkContentVisible } from '@order-public-sub-public/components/business/product-info/hooks/useState'
import {
  reportSaveFailResult,
  reportSuccess,
  submitProcessReport,
} from '@order-public-sub-root-pages/order-single/report'
import { SubmitReport } from '@order-public-sub-public/reportUmp/constants/renderTime'
import { saveOrderPromise } from '@order-public-sub-public/components/business/service-model/hooks/useServiceModeTypes'
import { confirmRestrict, needReCalculateCost } from '@order-public-sub-public/validate/limit'
import { BatchSingleProcessResponse } from '@order-public-sub-public/apis/types'
import { SubmitOptions } from '@order-public-sub-public/apis/waybill/types'
import { isCCmsUpdateWaybill } from '@order-public-sub-public/configs/waybillMerge'
import { sleep } from '@order-public-sub-public/utils/sleep'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { useInit } from './useInit'
import { isBackFromOrderBackPage } from './routerStatus'
import { localStorage } from '@order-public-sub-public/utils/storage'
import { triggerWaybillSearch } from '@/public/storage'
import { orderPageScrollTop } from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
import Taro from '@tarojs/taro'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { initWithoutFetch } = useInit()

const router = useRouter()
const { allCheck, remoteCheckDataHandOut } = useEffect()

const { handleSaveData, handleProcessData } = useStaticAndDynamicData()
const { submitConfig } = useInitMulitFielConfigChild()

const loading = ref(false)

const isOrderBack = computed(() => {
  const orderPAgeType = piniaStore.root.getOrderPageType
  return orderPAgeType === OrderPageType.返程单 || orderPAgeType === OrderPageType.批量寄单票
})

const { setLinkContentVisible } = useLinkContentVisible()

// 遮罩组件卸载函数
let unmountMasker: (() => void) | null = null

// 记录上次的下单接口返回对象，避免循环调接口
const lastOrderResponseData = ref<OrderResponse | CheckResponse | null>()

/**
 * @description 提交文案，修改运单的不同
 */
const submitMessage = computed(() => {
  const channel = getChannel()
  const query = getQueryObject() as QueryObject
  if (query?.isAppointmentPickup) {
    return '保存成功'
  } else if (channel === Channel.修改运单) {
    return '修改成功'
  } else {
    return '提交成功'
  }
})

const goDriverPickUp = () => {
  Taro.navigateBack()
}

/**
 * @description 去查件页
 */
const goWaybillRoute = (channel: Channel) => {
  const query = getQueryObject() as QueryObject
  triggerWaybillSearch()
  if (channel === Channel.修改运单) {
    if (isCCmsUpdateWaybill(query)) {
      // 返回代码一致，但是区分场景会比较好
      Taro.navigateBack()
    } else {
      Taro.navigateBack()
    }
  } else {
    native?.navigateTo({
      page: 'waybillRoute',
      type: 'redirectTo',
      params: {
        waybillNo: query?.waybillNo || '',
      },
    })
  }
}

export const resetOrderDataWhenFromBack = () => {
  try {
    if (isBackFromOrderBackPage.value) {
      isBackFromOrderBackPage.value = false
      const initPromise = initWithoutFetch()
      // 将promise保存到store，用于防止提前提交下单
      piniaStore.globalData.setInitDataPromise({ initDataPromise: initPromise })
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 * @description 返回去程单下单页
 */
export const goOrderPageFromBack = () => {
  resetOrderDataWhenFromBack()
  router.back()
}

/**
 * 保存成功后将返程单数据保存到globle
 */

const setReturnWaybillInfo = () => {
  const returnWaybillInfo = piniaStore.order.orderStateByType(OrderPageType.返程单)
  piniaStore.globalData.setReturnWaybillInfo({
    data: { ...returnWaybillInfo },
    orderPageType: OrderPageType.单票,
  })
}

const afterToastSuccess = () => {
  const channel = getChannel()
  const query = getQueryObject() as QueryObject
  // if (query?.isAppointmentPickup) {
  //   goDriverPickUp()
  //   return
  // }
  console.log('afterToastSuccess', 0)

  switch (channel) {
    case Channel.修改运单:
      // 通知原生端刷新页面（微信小程序）
      goWaybillRoute(Channel.修改运单)
      // 重置运单数据
      resetWaybillInfo()
      break
    default:
      goSuccessPage()
      // 重置运单数据
      resetWaybillInfo()
      // 通知原生端刷新页面（微信小程序）
      triggerWaybillSearch()
      break
  }
}

/**
 * @description toast下单成功
 */
const toastSuccess = () => {
  const channel = getChannel()

  // 返程单不需要弹窗
  if (channel === Channel.返程单) {
    setReturnWaybillInfo()
    goOrderPageFromBack()
    saveOrderPromise.value = null
    loading.value = false
    removeMasker()
    return
  }

  showToast({
    message: submitMessage.value,
    duration: 500,
  })

  setTimeout(() => {
    loading.value = false
    afterToastSuccess()
    removeMasker()
  }, 500)

  // 下单成功后重置saveOrderPromise
  saveOrderPromise.value = null
  confirmRestrict.value = false
  reportSuccess()
}

const orderSuccessPageConfig = computed(() => {
  const obj = piniaStore.schema.moduleConfigData(ModuleType['下单成功页']) || {
    needShare: false,
    showBarcode: false,
    tipText: '',
  }
  // 解决跳转到下单成功页 openWebview，导致store数据丢失没有手机号的场景, 存localStorage
  obj.phone = piniaStore.root.getUserInfo?.phone
  return obj
})

const setConfigOrderSuccessPageConfig = () => {
  // 获取下单成功页的配置
  localStorage?.setItem('configOrderSuccessPageConfig', JSON.stringify(orderSuccessPageConfig.value))
}

/**
 * @description 去下单成功页
 * @param waybillNumber
 */
const goSuccessPage = async () => {
  console.log('afterToastSuccess', 1)
  orderPageScrollTop.value = 0
  setConfigOrderSuccessPageConfig()
  router.replace({
    path: '/order-success',
    query: { batchId: getBatchId(), channel: getChannel() },
  })
}

/**
 * @description 确认保存下单的校验和管控结果
 */
const saveCheckResultMaskTofalse = (data: OrderResponse | CheckResponse) => {
  let checkResultList = data.checkResultList || []
  try {
    checkResultList = checkResultList.map((i) => {
      return {
        ...i,
        mask: false,
      }
    })
    data.checkResultList = checkResultList || []
  } catch (e) {
    console.log(e)
  }
  return data
}

/**
 * @description 确认保存下单的校验和管控结果
 */
const checkSubmitResponse = async (data: OrderResponse | CheckResponse) => {
  // 保存接口返回数据
  if (isOrderBack.value) {
    handleProcessData(data as CheckResponse)
  } else {
    handleSaveData(data as OrderResponse)
  }
  try {
    // TODO 修改动态配置
    // 走校验中心逻辑，处理后端返回的管控数据和表单校验数据
    const result = await remoteCheckDataHandOut(saveCheckResultMaskTofalse(data), 'waybill')

    // #451445 批量单条命中取派限制或资源调价限制需要返回批量寄首页并打标
    const isBatchWaybillAndRestrictStatus = isObject(result) && Reflect.get(result, 'status') === true
    if (isBatchWaybillAndRestrictStatus) {
      return OrderStatus.批量管控打标
    }
    // 如果status为true，直接下单
    if (data.status === true) {
      return OrderStatus.直接下单
    } else if (data.status === null) {
      // 接口报错了，提示兜底错误，不能继续下单
      showToast(ErrorMsg.SUBMIT)
      console.log('save接口status返回为null')
      return OrderStatus.不通过管控
    } else {
      if (!lastOrderResponseData.value) {
        lastOrderResponseData.value = data
      } else {
        if (isEqual(lastOrderResponseData.value, data)) {
          throw new Error('存在循环调用，中断提交')
        } else {
          lastOrderResponseData.value = data
        }
      }
      console.log('通过管控')
      return OrderStatus.通过管控
    }
  } catch (error) {
    //不通过管控
    lastOrderResponseData.value = null
    reportSaveFailResult(error)
    throw new Error('status返回为null、不通过管控或表单校验不通过')
  }
}

/**
 * @description 返程单保存函数,调用过程中接口
 * @param orderInfo
 */
const orderBackSave = async (orderInfo: OrderInfo) => {
  try {
    const { data } = await checkInProcess({
      elementsChange: ['returnWaybillInfo'],
      orderInfo,
      moduleStyle: ModuleStyle.跳转,
    })
    return data
  } catch (error) {
    console.log('返程单保存接口调用失败', error)
    throw new Error('返程单保存接口调用失败')
  }
}

/**
 * @description 调取保存接口
 */
const save = async (options?: SubmitOptions) => {
  try {
    // 平铺场景下需要关闭托寄物联想下拉框
    setLinkContentVisible(false)
    // 全部校验
    // 先排除预估运费模块的校验，因为有副作用需要后面再执行，最后再重新检验全部
    await allCheck(false, false, ['estimatedCost'])

    await allCheck(false)

    const orderInfo = piniaStore.order.orderState

    // 返程单保存
    if (isOrderBack.value) {
      return await orderBackSave(orderInfo)
    } else {
      // 单票下单
      // 过滤手机号、固定电话空格
      const filterOrderInfo = filterFiledSpace(orderInfo)
      const submitFuncMap = {
        [Channel.修改运单]: modifyOrder,
        [Channel.调价审核]: submitAdjustOrder,
      }
      const channel = getChannel()
      const submitFunc = submitFuncMap[channel as keyof typeof submitFuncMap] || submitOrder
      const { data } = await submitFunc(filterOrderInfo, options)

      return data
    }
  } catch (error) {
    console.log('校验不通过或者保存接口调用失败', error)
    reportSaveFailResult(error)
    throw new Error('校验不通过或者保存接口调用失败')
  }
}

/**
 * @description 点击下单时增加遮罩
 */
const addMasker = async () => {
  if (!unmountMasker) {
    unmountMasker = await effectMasker({
      blockedFlag: true,
      callback: () => {
        console.log('提交下单中，不可点击填单区域')
        showToast('运单正在提交中')
      },
      topSelector: [],
    })
    unmountMasker = unmountMasker?.unmount
  }
}

/**
 * @description 移除遮罩
 */
const removeMasker = () => {
  // 移除遮罩
  console.log('测试数据', unmountMasker)
  unmountMasker?.()
  unmountMasker = null
}

/**
 * @description 等待过程、服务方式等中间触发的接口，三次是因为目前过程=》服务方式=》过程
 */
const awaitOtherPromise = async () => {
  const maxTimes = 3
  try {
    for (let i = 0; i < maxTimes; i++) {
      await sleep(10)
      const initDataPromise = piniaStore.globalData.initDataPromise
      const processPromise = piniaStore.globalData.processPromise
      const serviceMode = piniaStore.globalData.serviceModePromise
      const hasPromise = initDataPromise || processPromise || serviceMode
      if (!hasPromise) {
        break
      }
      await Promise.all([initDataPromise, processPromise, serviceMode].filter((promise) => !isNull(promise)))
    }
  } catch (e) {
    console.log(e)
  }
  return Promise.resolve(true)
}

/**
 * @description 首次点提交下单才会执行的逻辑
 */
const actionsInFirstSubmit = async () => {
  try {
    // 因为会有层级问题,隐藏预估运费弹窗
    hiddenEstimatedCostModal()
    // 添加遮罩
    addMasker()
    loading.value = true
    // 等待initCheck执行完成才能下单

    submitProcessReport(SubmitReport.开始等待接口)
    await awaitOtherPromise()
    submitProcessReport(SubmitReport.等待接口完成)
  } catch (error) {
    submitProcessReport(SubmitReport.等待接口报错)
    // captureException(new Error('接口被Cancel，正常通过'))
    console.log('接口被Cancel，正常通过', error)
  } finally {
    piniaStore.globalData.setInitDataPromise({ initDataPromise: null })
    piniaStore.globalData.setProcessPromise({ processPromise: null })
    piniaStore.globalData.setServiceModePromise({ serviceModePromise: null })
    submitProcessReport(SubmitReport.开始进入下单接口)
  }
}

/**
 * @description 提交下单
 */
const submit = async (_mouseEvent: MouseEvent, count = 0) => {
  try {
    // 只有第一次提交才需要做这些操作
    const submitOptions = { confirmRestrictOpt: YesOrNoString.YES }
    if (count === 0) {
      await actionsInFirstSubmit()
    } else {
      if (confirmRestrict.value) {
        submitOptions.confirmRestrictOpt = YesOrNoString.NO
      }
    }

    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType === OrderPageType.批量寄) {
      loading.value = false
      removeMasker()
    } else {
      // 单票下单
      // 新增下单接口调用process标记
      const promise = save(submitOptions)

      saveOrderPromise.value = promise

      const data = await promise

      const result = await checkSubmitResponse(data)
      if (result === OrderStatus.直接下单) {
        console.log('提交下单')
        toastSuccess()
        submitConfig()
      } else if (result === OrderStatus.通过管控) {
        console.log('通过了管控，再次尝试提交')
        await submit(_mouseEvent, count + 1)
      }
    }
  } catch (error) {
    console.log('提交下单失败', error)
    removeMasker()
    loading.value = false
    saveOrderPromise.value = null
    confirmRestrict.value = false
  }
}

/**
 * @description 计算费用
 * @param orderInfo
 */
export const getEstimateCost = async (orderInfo: OrderInfo) => {
  // await remoteBatchSingleCheck('onlyEstimateFee', orderInfo, undefined, [], {
  //   cacheStrategy: '10',
  // })
  await remoteBatchSingleCheck({
    key: 'onlyEstimateFee',
    temporaryData: orderInfo,
    extraParams: { cacheStrategy: '10' },
  })

  needReCalculateCost.value = false
}

/**
 * @description 批量寄单条点击确定按钮
 */
const batchConfirm = async (_mouseEvent: MouseEvent, count = 0) => {
  try {
    let changeKey: ChangeKeys = 'waybill'
    // 只有第一次提交才需要做这些操作
    if (count === 0) {
      await actionsInFirstSubmit()
    } else {
      // 调用过程中接口保存下单，如果需要上报管控，则更换elementsChange
      // 首次下单无论如何都是waybill
      changeKey = confirmRestrict.value ? 'waybill.confirm.restrict' : 'waybill'
    }

    // 全部校验
    // 先排除预估运费模块的校验，因为有副作用需要后面再执行，最后再重新检验全部
    await allCheck(false, false, ['estimatedCost'])

    const orderInfo = piniaStore.order.orderState

    // const checkData = await remoteBatchSingleCheck(changeKey, orderInfo, undefined, [], {
    //   cacheStrategy: '10',
    //   noHandout: true,
    // })
    const checkData = await remoteBatchSingleCheck({
      key: changeKey,
      temporaryData: orderInfo,
      extraParams: {
        cacheStrategy: '10',
        noHandout: true,
      },
    })

    const { resultData } = handleAssembleData((checkData as BatchSingleProcessResponse)?.batchProcessResponse)

    const result = await checkSubmitResponse(resultData as CheckResponse)

    // 批量单条只有通过管控需要再次调用过程中，其他直接失败或者通过
    if (result === OrderStatus.直接下单 || result === OrderStatus.批量管控打标) {
    } else if (result === OrderStatus.通过管控) {
      console.log('通过了管控，再次尝试提交')
      await batchConfirm(_mouseEvent, count + 1)
    }

    // 延迟关闭loading和遮罩，避免loading结束太早页面跳转到批量寄之后仍然触发了点击
    setTimeout(() => {
      removeMasker()
      loading.value = false
    }, 500)

    batchWaybillPrompt.value = false
  } catch (error) {
    console.log('批量单票提交失败', error)
    removeMasker()
    loading.value = false
    confirmRestrict.value = false
  }
}

export const useSaveOrder = () => {
  return {
    loading,
    submit,
    batchConfirm,
    saveOrderPromise,
  }
}
