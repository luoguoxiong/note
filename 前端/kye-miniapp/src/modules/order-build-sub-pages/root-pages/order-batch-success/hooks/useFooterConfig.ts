import { getChannel, getOrderConfigUrl, setChannel, saveBatchId } from '@order-public-sub-public/configs'
import { SuccessOrderInfo } from '@order-public-sub-public/types'
import { Ref, computed, ref } from 'vue'
import { Channel, OrderPageType, OrderSuccessType } from '@order-public-sub-public/constants'
import { getBaseUrl, getOnlineH5Url } from '@order-public-sub-public/utils/env'
import { ParserResult, parser } from '@order-public-sub-public/utils/qrcode-waybill'
import { closeToast, showLoadingToast, showToast } from '@order-public-sub-public/hooks/useShowToast'
import { $native, callThePhone, getH5OrderUrl, overVersionCheck } from '@order-public-sub-public/utils'
import { contactPopup } from '@order-public-sub-public/components/business/contact-business'
import { clearWaybill, clearBatchWaybill } from '@order-public-sub-public/apis/batch'
import { activeTab, waybillIds } from './useOrderSuccess'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import router from '@order-public-sub-public/router'
import { isWechat } from '@order-public-sub-public/utils/device'
// import { printCheckBluetooth } from '@order-public-sub-public/utils/print'
import { getContacts } from '@order-public-sub-public/apis/contasts'
import { virtualPhoneRealName } from '@order-public-sub-public/components/business/contact-business/utils'
import { openURL } from '@/modules/webview/utils'
const CONTINUE = '继续下单'
const VIEW = '查看运单'
const APPROVAL = '查看审核列表'

const data = ref<SuccessOrderInfo>()
export const loading = ref(false)

const native = $native

const contact = computed(() => {
  return `联系${data?.value?.reviewer || '商务'}`
})

const waybillNumber = ref('')

const cleanMethod = async () => {
  const { query } = useRoute()
  if (query?.orderPageType === OrderPageType.批量寄) {
    await clearBatchWaybill({ waybillIds: waybillIds.value })
  } else {
    await clearWaybill()
  }
  // 离开页面，重置batchId
  saveBatchId('', true, {
    allowEmpty: true,
    fromType: 'cleanMethod',
  })
}

/**
 * @description 继续下单
 */
const goOrderAgain = async () => {
  // 触发预加载
  setChannel(Channel.批量寄)
  // getPreInit()
  const channel = getChannel()
  try {
    if (channel === Channel.扫二维码下单) {
      await orderAgainByScanCode(channel)
    } else {
      orderAgainByOrderPage()
    }
    // 离开页面，重置batchId
    saveBatchId('', true, {
      allowEmpty: true,
      fromType: 'goOrderAgain',
    })
  } catch (error) {
    console.log(error)
    cleanMethod()
  }
}

/**
 * @description 跳转寄件页，需要重置URL入参
 * @param channel
 */
const orderAgainByOrderPage = async () => {
  const url = getOrderConfigUrl({ channel: Channel.批量寄 })
  try {
    cleanMethod()
  } finally {
    openURL(url.replace('-success', ''), {
      type: 'redirectTo',
      needLogin: true,
    })
  }
}

/**
 * @description 如果是扫码下单，再来一单还是调用扫码能力
 * @param channel
 */
const orderAgainByScanCode = async (channel: Channel) => {
  try {
    const result = await native?.scanQRCode({ needResult: 1 })
    if (result) {
      const res = await parser(result)
      handleQrCodeParserResult(res, channel)
    }
  } catch (error: unknown) {
    showToast((error as Error).message)
  }
}

/**
 * @description 处理扫码接口返回的结果
 * @param res
 * @param channel
 */
const handleQrCodeParserResult = (res: ParserResult, channel: Channel) => {
  const waybillNo = res.data?.waybillNo
  switch (res.page) {
    case 'order': {
      const targetUrl = `${getBaseUrl()}?type=scan&waybillNo=${waybillNo}&channel=${channel}`
      openURL(targetUrl, {
        type: 'redirectTo',
        needLogin: true,
      })
      break
    }
    case 'waybillDetail': {
      native?.navigateTo({
        page: 'waybillDetail',
        type: 'redirectTo',
        params: {
          waybillNo,
        },
      })
      break
    }
    case 'waybillRoute': {
      native?.navigateTo({
        page: 'waybillRoute',
        type: 'redirectTo',
        params: {
          waybillNo,
        },
      })
      break
    }
    default: {
      showToast('无法识别数据，请重新扫描')
      break
    }
  }
}

/**
 * @description 联系商务，如果有主授权人直接打电话，否则调取联系商务组件
 */
const contactSale = async () => {
  if (data.value?.reviewerPhone) {
    callThePhone(data.value.reviewerPhone)
  } else if (data.value?.contactScene) {
    // 下单审核接口不再返回手机号，改为前端调用接口获取
    try {
      showLoadingToast({ message: '加载中', forbidClick: true })
      const res = await getContacts({ scene: data.value.contactScene })
      if (res?.data?.isNeedAuthenticate) {
        virtualPhoneRealName()
      }
      callThePhone(res.data.virtualMobile)
    } catch (error) {
      console.log(error)
    } finally {
      closeToast()
    }
  } else {
    contactPopup({ scene: data.value?.contactScene })
  }
}

/**
 * @description 跳转查件页
 */
const goWaybillRoute = () => {
  cleanMethod()
  native?.refreshSearch()
  native?.navigateTo({
    page: 'search',
    type: 'redirectTo',
  })
}

/**
 * @description 跳转审核列表
 */
const goApprovalList = async () => {
  cleanMethod()
  const h5OrderUrl = await getH5OrderUrl()
  const baseUrl = h5OrderUrl ? `${h5OrderUrl}#` : getOnlineH5Url()
  const isAdjustPriceStr = activeTab.value === OrderSuccessType.调价审核 ? '&tab=2' : ''
  const url = `${baseUrl}/price-adjustment-approval-list?isMiniApp=1${isAdjustPriceStr}`

  openURL(url, { type: 'redirectTo', needLogin: true })
}

/**
 * @description 跳转打印面单
 */
const goPintFaceSheet = async () => {
  showLoadingToast({ message: '加载中', forbidClick: true })
  try {
    router.push({
      name: 'batch-print',
      query: {
        printSource: 'batch',
      },
    })
  } catch (e) {
    console.log('aaaa', e)
  } finally {
    closeToast()
  }
}

const orderCompletedPageType = ref<OrderSuccessType>()

// 继续下单 按钮
const orderAgainBtn = {
  text: CONTINUE,
  type: 'default',
  iconName: 'success-order-again',
  action: goOrderAgain,
}

// 查看运单 按钮
const waybillRouteBtn = {
  text: VIEW,
  type: 'primary',
  iconName: 'success-waybill-route',
  action: goWaybillRoute,
}

// 联系商务/主授权人 按钮
const contactSaleBtn = () => {
  return {
    text: contact.value,
    type: 'default',
    iconName: '',
    action: contactSale,
  }
}

// 查看审核列表 按钮
const approvalListBtn = {
  text: APPROVAL,
  type: 'primary',
  iconName: '',
  action: goApprovalList,
}

const isPintBtn = {
  text: '打印面单',
  type: 'default',
  iconName: 'success-pint',
  action: goPintFaceSheet,
}

// 当前底部按钮配置
const currentConfig = computed(() => {
  if (orderCompletedPageType?.value) {
    if (
      [
        OrderSuccessType.产生运单和订单,
        OrderSuccessType.只产生运单,
        OrderSuccessType.截单专车,
        OrderSuccessType.戈壁,
      ].includes(orderCompletedPageType.value)
    ) {
      return [orderAgainBtn, waybillRouteBtn]
    } else if ([OrderSuccessType.运单审核, OrderSuccessType.调价审核].includes(orderCompletedPageType.value)) {
      return [contactSaleBtn(), approvalListBtn]
    }
  }
  return []
})

const isPintAuth = ref(false)
// 获取权限
export const getPintAuth = async () => {
  isPintAuth.value = false
  // 小程序小程序版本检测，存在miniprogramVersion 则可以使用打印
  if (isWechat && router.currentRoute?.value?.query?.miniprogramVersion) {
    isPintAuth.value = true
  } else {
    try {
      isPintAuth.value = await overVersionCheck('7.59.0')
    } catch (err) {
      console.error(err)
    }
  }
}

export const useFooter = (successOrderInfo?: Ref<SuccessOrderInfo | undefined>, queryWaybillNumber?: string) => {
  data.value = successOrderInfo?.value
  orderCompletedPageType.value = data?.value?.orderCompletedPageType
  waybillNumber.value = queryWaybillNumber || ''
  if (
    isPintAuth.value &&
    orderCompletedPageType.value &&
    ![OrderSuccessType.运单审核, OrderSuccessType.调价审核].includes(orderCompletedPageType.value)
  ) {
    return [isPintBtn, ...currentConfig.value]
  }
  return currentConfig.value
}

export const failReorder = async () => {
  orderAgainByOrderPage()
}
