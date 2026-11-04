import { OrderSuccessPageConfig, SuccessOrderInfo } from '@order-public-sub-public/types'
import { ref, computed, watch } from 'vue'
import { OrderSuccessType } from '@order-public-sub-public/constants'
import { Banner, Popup } from '@order-public-sub-public/apis/waybill/types'
import { downloadImage } from '@order-public-sub-public/utils/file'
import { getBatchOrderSuccessData } from '@order-public-sub-public/apis/batch'
import { BatchSuccessOrderInfo } from '@order-public-sub-public/apis/batch/types'
import { commonSetPolling } from '@order-public-sub-public/hooks/usePolling'
import { localStorage } from '@order-public-sub-public/utils/storage'

const successOrderInfo = ref<SuccessOrderInfo>()
const orderInfoList = ref<BatchSuccessOrderInfo[]>()

const netWorkError = ref(false)

// 广告数据
const adList = ref<Banner[]>([])

const popupList = ref<Popup[]>([])

// 获取下单成功页的配置
const orderSuccessPageConfig = computed(() => {
  const configJson = localStorage?.getItem('configOrderSuccessPageConfig')

  if (!configJson) {
    return {
      needShare: false,
      showBarcode: false,
      tipText: '',
    }
  } else {
    return JSON.parse(configJson) as OrderSuccessPageConfig
  }
})

// 实名认证标识
const realAuthFlag = ref(true)

const realAuthTipsText = ref('')

export const activeTab = ref(OrderSuccessType.调价审核)

const tipText = computed(() => orderSuccessPageConfig.value.tipText)

// 有提示
const hasTips = computed(() => !realAuthFlag.value || tipText.value)

// 如果有实名认证且提示条内容不为空
const noticeBarVisible = computed(() => {
  return realAuthFlag.value && orderSuccessPageConfig.value.tipText
})

// 单票的场景，取出第一个运单号
const waybillNumber = computed(() => {
  return (successWaybillList.value && successWaybillList.value?.[0]?.waybillNumber) as string
})

export const waybillIds = ref<string[]>([])

/**
 * @description 获取下单成功页数据
 */
export const getSuccessData = async () => {
  waybillIds.value = []
  try {
    const { data } = await commonSetPolling({
      delay: 500,
      count: 120,
      polling: getBatchOrderSuccessData,
      timerName: 'orderSuccess',
      finishStatus: (res) => {
        console.log('res: ', res)
        // 返回true 终止轮询 10:下单成功  30: 全部下单失败
        return res?.data.status === 10 || res?.data.status === 30
      },
      args: undefined,
    })
    if (data.status === 10 && !data.orderInfos) {
      netWorkError.value = true
      console.log('轮询超时---->', data)
      return
    }
    console.log('data:---->', data)
    if (data.status === 30 || !data.orderInfos) {
      // 全部下单失败 只有失败次数
      return data
    }
    data.orderInfos.forEach((x) => {
      if (x.resultType) {
        x.orderCompletedPageType = x.resultType
      }
      if (x.waybillList) {
        x.waybillList.forEach((x) => {
          if (x?.waybillId) {
            waybillIds.value.push(x.waybillId)
          }
        })
      }
    })
    const { orderInfos, realAuth = true, realAuthTips = '' } = data
    orderInfoList.value = orderInfos
    if (orderInfoList.value.length === 1) {
      successOrderInfo.value = orderInfos[0]
      activeTab.value = successOrderInfo.value.orderCompletedPageType
    } else {
      // 同时命中 截单专车 和 成功运单 特写，两种运单合并到截单专车里面
      if (
        orderInfos.length === 2 &&
        orderInfos.some(
          (x) =>
            x.orderCompletedPageType === OrderSuccessType.截单专车 &&
            orderInfos.some((y) => y.orderCompletedPageType === OrderSuccessType.产生运单和订单),
        )
      ) {
        const specialVehicle = orderInfos.find(
          (x) => x.orderCompletedPageType === OrderSuccessType.截单专车,
        ) as BatchSuccessOrderInfo
        const successList =
          orderInfos?.find((x) => x.orderCompletedPageType === OrderSuccessType.产生运单和订单)?.waybillList || []
        specialVehicle.waybillList = [...specialVehicle.waybillList, ...successList]
        orderInfoList.value = [specialVehicle]
        successOrderInfo.value = specialVehicle
        activeTab.value = OrderSuccessType.截单专车
      } else {
        activeTab.value = OrderSuccessType.调价审核
        successOrderInfo.value = orderInfos.filter((x) => x.orderCompletedPageType === OrderSuccessType.调价审核)[0]
      }
    }
    realAuthFlag.value = realAuth
    realAuthTipsText.value = realAuthTips
    netWorkError.value = false
    return data
  } catch (error) {
    console.log('获取下单成功页数据失败', error)
    netWorkError.value = true
  }
}

/**
 * @description 下载图片
 * @param src
 */
const download = async (src: string) => {
  downloadImage(src)
}

/**
 * @description: 单状态模式
 * 指全部命中 下单成功 || 运单审核 || 调价审核 || 截单专车
 * @return {*}
 */
const singleState = computed(() => {
  return orderInfoList.value?.length === 1
})
// 运单审核 列表
const waybillReview = computed(() => {
  return (
    orderInfoList.value && orderInfoList.value.filter((x) => x.orderCompletedPageType === OrderSuccessType.运单审核)
  )
})
// 调价审核 列表
const priceAdjustmentReview = computed(() => {
  return (
    orderInfoList.value && orderInfoList.value.filter((x) => x.orderCompletedPageType === OrderSuccessType.调价审核)
  )
})

// 下单成功 列表
const checkoutSuccess = computed(() => {
  return (
    orderInfoList.value &&
    orderInfoList.value.filter((x) => x.orderCompletedPageType === OrderSuccessType.产生运单和订单)
  )
})

// 截单专车 成功列表
const specialVehicleSuccess = computed(() => {
  return (
    orderInfoList.value && orderInfoList.value.filter((x) => x.orderCompletedPageType === OrderSuccessType.截单专车)
  )
})

const successWaybillList = computed(() => {
  if (waybillReview.value?.length && priceAdjustmentReview.value?.length) {
    if (activeTab.value === OrderSuccessType.调价审核) {
      return priceAdjustmentReview.value[0].waybillList
    } else {
      return waybillReview.value[0]?.waybillList
    }
  } else if (priceAdjustmentReview.value?.length && checkoutSuccess.value?.length) {
    if (activeTab.value === OrderSuccessType.调价审核) {
      return priceAdjustmentReview.value[0]?.waybillList
    } else {
      return checkoutSuccess.value.length && checkoutSuccess.value[0]?.waybillList
    }
  }
  return orderInfoList.value?.length && orderInfoList.value[0]?.waybillList
})

const renderTabList = computed(() => {
  return [
    {
      label: `调价审核(${priceAdjustmentReview.value && priceAdjustmentReview.value[0]?.waybillList.length})`,
      name: OrderSuccessType.调价审核,
      list: priceAdjustmentReview.value?.length ? priceAdjustmentReview.value[0]?.waybillList : [],
      promptInfo: priceAdjustmentReview.value?.[0]?.promptInfo,
    },
    {
      label: renderTableObj()?.label,
      name: renderTableObj()?.name,
      list: renderTableObj()?.waybillList,
      promptInfo: renderTableObj()?.promptInfo,
    },
  ]
})

const renderTableObj = () => {
  if (waybillReview.value?.length) {
    return {
      label: `运单审核(${waybillReview.value[0]?.waybillList.length})`,
      name: OrderSuccessType.运单审核,
      waybillList: waybillReview.value[0]?.waybillList,
      promptInfo: waybillReview.value[0].promptInfo,
    }
  } else if (checkoutSuccess.value?.length) {
    return {
      label: `下单成功(${checkoutSuccess.value[0]?.waybillList.length})`,
      name: OrderSuccessType.产生运单和订单,
      waybillList: checkoutSuccess.value[0]?.waybillList,
      promptInfo: checkoutSuccess.value[0].promptInfo,
    }
  } else if (specialVehicleSuccess.value?.length) {
    return {
      label: `下单成功(${specialVehicleSuccess.value[0]?.waybillList.length})`,
      name: OrderSuccessType.截单专车,
      waybillList: specialVehicleSuccess.value[0]?.waybillList,
      promptInfo: specialVehicleSuccess.value[0].promptInfo,
    }
  }
}

watch(activeTab, () => {
  successOrderInfo.value = orderInfoList.value?.find((x) => x.orderCompletedPageType === activeTab.value)
})

export const useOrderSuccess = () => {
  return {
    adList,
    popupList,
    netWorkError,
    realAuthFlag,
    realAuthTipsText,
    noticeBarVisible,
    tipText,
    hasTips,
    waybillNumber,
    successOrderInfo,
    successWaybillList,
    orderSuccessPageConfig,
    singleState,
    renderTabList,
    activeTab,
    orderInfoList,
    download,
  }
}
