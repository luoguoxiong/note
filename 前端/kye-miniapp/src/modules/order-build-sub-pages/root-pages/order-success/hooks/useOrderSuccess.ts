import { getOrderSuccessBaseData, getOrderSuccessWaybillData } from '@order-public-sub-public/apis/waybill/orderSuccess'
import { OrderSuccessPageConfig, SuccessOrderInfo, SuccessWaybill } from '@order-public-sub-public/types'
import { ref, computed } from 'vue'
import { OrderSuccessType } from '@order-public-sub-public/constants'
import { Banner, Popup } from '@order-public-sub-public/apis/waybill/types'
import { downloadImage } from '@order-public-sub-public/utils/file'
import { localStorage } from '@order-public-sub-public/utils/storage'

const successOrderInfo = ref<SuccessOrderInfo>()
const successWaybillList = ref<SuccessWaybill[]>()

const successLoading = ref(false)

const initEndFlag = ref(false)

const netWorkError = ref(false)

// 广告数据
const adList = ref<Banner[]>([])

const popupList = ref<Popup[]>([])

// 是否是戈壁场景
const isGobi = computed(() => successOrderInfo.value?.orderCompletedPageType === OrderSuccessType.戈壁)

const gobiSrc = computed(() => successWaybillList.value?.[0].waybillCodeUrl ?? '')

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

// 实名认证标识 初始化为空解决换成问题
const realAuthFlag = ref<boolean | string>('')

const realAuthTipsText = ref('')

const tipText = computed(() => orderSuccessPageConfig.value.tipText)

// 有提示
const hasTips = computed(() => !realAuthFlag.value || tipText.value)

// 如果有实名认证且提示条内容不为空
const noticeBarVisible = computed(() => {
  return realAuthFlag.value && orderSuccessPageConfig.value.tipText
})

// 单票的场景，取出第一个运单号
const waybillNumber = computed(() => {
  return (successWaybillList.value && successWaybillList.value?.[0]?.waybillNumber) ?? ''
})

/**
 * @description 获取下单成功页数据
 */
const getSuccessData = async () => {
  try {
    const { data } = await getOrderSuccessBaseData()
    // const { orderInfo, waybillList, realAuth = true, realAuthTips = '' } = data
    const { orderInfo } = data
    successOrderInfo.value = orderInfo
    // successWaybillList.value = waybillList
    // realAuthFlag.value = realAuth
    // realAuthTipsText.value = realAuthTips
    netWorkError.value = false
  } catch (error) {
    console.log('获取下单成功页数据失败', error)
    netWorkError.value = true
  }
}

const getSuccessWaybillData = async () => {
  try {
    successLoading.value = true
    const { data } = await getOrderSuccessWaybillData()
    const { waybillList, realAuth = true, realAuthTips = '' } = data
    successWaybillList.value = waybillList
    realAuthFlag.value = realAuth
    realAuthTipsText.value = realAuthTips
    successLoading.value = false
    initEndFlag.value = true
  } catch (error) {
    console.log('获取下单成功页运单列表数据失败', error)
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

const resetInitData = () => {
  initEndFlag.value = false
  successOrderInfo.value = undefined
  successWaybillList.value = []
  realAuthFlag.value = ''
  realAuthTipsText.value = ''
  netWorkError.value = false
  adList.value = []
  popupList.value = []
}

export const useOrderSuccess = () => {
  return {
    isGobi,
    gobiSrc,
    netWorkError,
    adList,
    popupList,
    realAuthFlag,
    realAuthTipsText,
    noticeBarVisible,
    tipText,
    hasTips,
    waybillNumber,
    successOrderInfo,
    successWaybillList,
    orderSuccessPageConfig,
    getSuccessData,
    getSuccessWaybillData,
    download,
    successLoading,
    initEndFlag,
    resetInitData,
  }
}
