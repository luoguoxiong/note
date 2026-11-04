// import { getPreInit } from '@order-public-sub-public/apis'
import { getChannel, getOrderConfigUrl, setChannel, saveBatchId } from '@order-public-sub-public/configs'
import { SuccessOrderInfo, OrderSuccessPageConfig, SuccessWaybill } from '@order-public-sub-public/types'
import { Ref, computed, ref } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { Channel, OrderSuccessType } from '@order-public-sub-public/constants'
import { SourcePage } from '@order-global-package-order-sub/constants'
import { getBaseUrl, getOnlineH5Url } from '@order-public-sub-public/utils/env'
import { ParserResult, parser } from '@order-public-sub-public/utils/qrcode-waybill'
import { showToast, closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import {
  $native,
  callThePhone,
  getH5OrderUrl,
  getQueryObject,
  isDesktopWechatMiniprogram,
  overVersionCheck,
} from '@order-public-sub-public/utils'
import { FooterConfigItem } from '../types'
// import { printCheckBluetooth } from '@order-public-sub-public/utils/print'
import { getPrintTraceToken } from '@order-public-sub-public/apis/print/index'
import { isAliPayClient, aliPayOrAMapApp, isWechat } from '@order-public-sub-public/utils/device'
import { getContacts } from '@order-public-sub-public/apis/contasts'
import { removeUrlParameter } from '@order-public-sub-public/utils/native'
import { virtualPhoneRealName } from '@order-public-sub-public/components/business/contact-business/utils'
import { scanQrcode } from '@public/utils/scan'

import { useRouter, useRoute } from '@order-public-sub-public/vue-router'
import Taro from '@tarojs/taro'
import { contactBusinessPhone, contactBusinessPopupVisible } from './state'
import { openURL } from '@/modules/webview/utils'
import { getNotifyReceiveShare } from '@public/hooks/useNotifyReceiveShare'
import {
  clk_express_print_v1,
  clk_express_result_continue_placing_order_v1,
  clk_express_result_notify_recipient_v1,
  clk_express_result_view_waybill_v1,
  exp_express_print_v1,
  to_template_report,
  clickresultFeeConfirmDisagreeReport,
} from '../report'
import { isH5FSEnv, getApplicationByApplicationCode } from '@/public/utils'
import { getToken } from '@public/storage/user'
import { getEnvConfig } from '@/public/config'
import { extInfo } from './useOrderSuccess'

const piniaStore = useStore()
const router = useRouter()
const route = useRoute()
const CONTINUE = '继续下单'
const VIEW = '查看运单'
const APPROVAL = '查看审核列表'
const TEMPLATE = '保存模板'

const data = ref<SuccessOrderInfo>()

const native = $native

const contact = computed(() => {
  return `联系${data?.value?.reviewer || '商务'}`
})

const waybillNumber = ref('')

/**
 * @description 继续下单
 */
const goOrderAgain = async () => {
  // 触发预加载
  // getPreInit()
  // const channel = getChannel()
  const { sourcePage, channel } = getQueryObject()
  clk_express_result_continue_placing_order_v1({ sourcePage, channel })
  try {
    // 离开页面，重置batchId
    saveBatchId('', true, {
      allowEmpty: true,
      fromType: 'goOrderAgain',
    })
    if (channel === Channel.扫二维码下单 || sourcePage === SourcePage.展会扫码) {
      // 扫码进入的单，继续下单唤起扫一扫
      scanQrcode({ navigateType: 'redirectTo' })
      // await orderAgainByScanCode(channel)
    } else if (channel === Channel.撤展下单 || channel === Channel.来展下单) {
      // 展会渠道：redirect 回原生填单页并保持渠道；必须携带 channel query，
      // 否则填单页 setInitChannel 空查询会兜底重置为快速寄件
      router.replace({ path: '/order', query: { channel } })
    } else if (channel === Channel.扫活动码下单 && sourcePage === 'gjh') {
      // 广交会跳进来的不重置 channel 以及其他参数
      orderAgainByOrderPageKeepChannel()
    } else {
      // 如果不是扫二维码，离开页面重置channel
      orderAgainByOrderPage()
      setChannel(Channel.快速寄件)
    }
  } catch (error) {
    console.log(error)
  }
}

// 设置模板
export const toSaveTemplate = async (banner = false) => {
  to_template_report(banner)
  const res = getApplicationByApplicationCode('H5_ORDER_DEFAULT_MINI_V1')
  console.log('kkkkkkkk', res)
  const baseUrl = res?.loadAddress
  const xForm = getEnvConfig().xForm
  const h5Link = `${baseUrl}#/detail?pageFrom=100`
  // router.push({
  //   path: '/template-view',
  //   query: {
  //     templateUrl: url,
  //   },
  // })
  openURL(h5Link, { needLogin: true })
}

/**
 * @description 跳转寄件页，保持URL入参
 * @param channel
 */
const orderAgainByOrderPageKeepChannel = () => {
  const url = removeUrlParameter(location.href, 'batchId')
  openURL(url.replace('-success', ''), {
    type: 'redirectTo',
    needLogin: true,
  })
}

/**
 * @description 跳转寄件页，需要重置URL入参
 * @param channel
 */
const orderAgainByOrderPage = () => {
  router.replace({
    path: '/order',
  })
  // location.reload()
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
    if ((error as Error).message) {
      showToast((error as Error).message)
    }
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
      const targetUrl = `${getBaseUrl(false)}#/?type=scan&waybillNo=${waybillNo}&channel=${channel}`
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
      if (!isDesktopWechatMiniprogram()) {
        showLoadingToast({ message: '加载中', forbidClick: true })
      }
      const res = await getContacts({ scene: data.value.contactScene })
      if (res?.data?.isNeedAuthenticate) {
        virtualPhoneRealName()
        return
      }
      callThePhone(res.data.virtualMobile)
    } catch (error) {
      console.log(error)
    } finally {
      if (!isDesktopWechatMiniprogram()) {
        closeToast()
      }
    }
  } else {
    // contactPopup({ scene: data.value?.contactScene })
    const phone = piniaStore?.root?.getUserInfo?.phone ?? route.query?.phone
    contactBusinessPhone.value = phone || ''
    contactBusinessPopupVisible.value = true
  }
}

/**
 * @description 跳转查件页
 */
export const goWaybillRoute = (_waybillNumber?: string, auth?: boolean) => {
  // 如果运单还是审核中跳转到调价审核页面
  clk_express_result_view_waybill_v1()
  if (auth) {
    return goApprovalList()
  }

  // native?.navigateTo({
  //   page: 'waybillRoute',
  //   type: 'redirectTo',
  //   params: {
  //     waybillNo: _waybillNumber || waybillNumber.value,
  //   },
  // })
  Taro.redirectTo({
    url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${_waybillNumber || waybillNumber.value}&fromExternal=0`,
  })
}

/**
 * @description 跳转审核列表
 */
const goApprovalList = async () => {
  const h5OrderUrl = await getH5OrderUrl()
  const baseUrl = h5OrderUrl ? `${h5OrderUrl}#` : getOnlineH5Url()
  let isAdjustPriceStr = '&tab=1'
  if (orderCompletedPageType.value === OrderSuccessType.调价审核) {
    isAdjustPriceStr = '&tab=2'
  } else if (orderCompletedPageType.value === OrderSuccessType.托寄物审核) {
    isAdjustPriceStr = '&tab=3'
  }
  const url = `${baseUrl}/price-adjustment-approval-list?isMiniApp=1${isAdjustPriceStr}`
  console.log()
  openURL(url, { needLogin: false })
}
/**
 * @description 跳转打印面单
 */
const goPintFaceSheet = async () => {
  showLoadingToast({ message: '加载中', forbidClick: true })
  clk_express_print_v1()
  try {
    // const isOpen = await printCheckBluetooth()
    // if (!isOpen) {
    //   return
    // }
    const res = await getPrintTraceToken({
      clientType: '20',
      waybillNumberList: [waybillNumber.value],
    })
    if (!res || !res.data) {
      return
    }
    router.push({
      path: '/print',
      query: {
        printTraceId: res.data,
        waybillNumber: waybillNumber.value,
        printSource: 'order',
      },
    })
    // app 从成功页跳转到打印面单 点返回需回到下单成功页，需要使用router.push, 小程序直接跳转openWebview
    // if (isWechat) {
    //   const url = `${getBaseUrl(false)}#/print?printTraceId=${res.data}&waybillNumber=${
    //     waybillNumber.value
    //   }&printSource=order`
    //   openURL(url, { needLogin: true, blueMethod: 'getBluetoothDevice' })
    // } else {
    //
    // }
  } catch (e) {
    console.log('aaaa', e)
  } finally {
    closeToast()
  }
}

const orderCompletedPageType = ref<OrderSuccessType>()

const shareWaybill = () => {
  clk_express_result_notify_recipient_v1()
  if (isWechat) {
    // 微信小程序 走useShareAppMessage方法
    return
  }
  getNotifyReceiveShare({
    waybillNumber: waybillNumber.value,
    onlineH5Url: getOnlineH5Url(),
  })
}

// 继续下单 按钮
const orderAgainBtn = {
  text: CONTINUE,
  type: 'default',
  iconName: 'success-order-again',
  key: 'order',
  action: goOrderAgain,
}

// 保存模板 按钮
const saveTemplateBtn = {
  text: TEMPLATE,
  type: 'default',
  key: 'template',
  imgUrl: 'https://ic-img.ky-express.com/netc/20260326_90611_!!1774507818019_44_44.svg+xml',
  action: toSaveTemplate,
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

const notifyRecipientBtn = {
  text: '通知收件人',
  type: 'default',
  iconName: 'success-notify-recipient',
  openType: 'share',
  openTypeId: 'notify_recipient',
  action: shareWaybill,
}

// 当前底部按钮配置
const currentConfig = computed(() => {
  const channel = getChannel()
  if (orderCompletedPageType?.value) {
    if (
      [
        OrderSuccessType.费用审核,
        OrderSuccessType.产生运单和订单,
        OrderSuccessType.只产生运单,
        OrderSuccessType.截单专车,
        OrderSuccessType.戈壁,
        OrderSuccessType.服务点自寄,
        OrderSuccessType.保存草稿,
      ].includes(orderCompletedPageType.value)
    ) {
      if (extInfo.value?.showSaveTemplate) {
        if (channel !== Channel.修改运单) {
          return [waybillRouteBtn, saveTemplateBtn, orderAgainBtn]
        } else {
          return [waybillRouteBtn, saveTemplateBtn]
        }
      }
      if (channel !== Channel.修改运单) {
        // 支付宝小程序:继续下单在左、查看运单在右;其他端保持查看运单在左
        return aliPayOrAMapApp
          ? [
              { ...waybillRouteBtn, type: 'default' },
              { ...orderAgainBtn, type: 'primary' },
            ]
          : [waybillRouteBtn, orderAgainBtn]
      } else {
        return [waybillRouteBtn]
      }
    } else if (
      [OrderSuccessType.运单审核, OrderSuccessType.调价审核, OrderSuccessType.托寄物审核].includes(
        orderCompletedPageType.value,
      )
    ) {
      return [contactSaleBtn(), approvalListBtn]
    } else if (orderCompletedPageType.value === OrderSuccessType.下单失败) {
      // 下单失败:联系商务 + 继续下单
      return [contactSaleBtn(), { ...orderAgainBtn, type: 'primary' }]
    }
  }
  return []
})

const isPintAuth = ref(false)
// 获取权限
export const getPintAuth = async () => {
  isPintAuth.value = false
  // 小程序小程序版本检测，存在miniprogramVersion 则可以使用打印
  if (isWechat || isAliPayClient || true) {
    isPintAuth.value = true
  } else {
    // try {
    //   isPintAuth.value = await overVersionCheck('7.60.0')
    // } catch (err) {
    //   console.error(err)
    // }
  }
}

export const currentConfigList = ref<FooterConfigItem[]>([])

export const useFooter = (
  successOrderInfo?: Ref<SuccessOrderInfo | undefined>,
  queryWaybillNumber?: string,
  orderSuccessPageConfig?: OrderSuccessPageConfig,
  waybillList?: SuccessWaybill[],
  // eslint-disable-next-line max-params
) => {
  data.value = successOrderInfo?.value
  orderCompletedPageType.value = data?.value?.orderCompletedPageType
  waybillNumber.value = queryWaybillNumber || ''

  // 判断是否是审核中状态
  const authVisible = computed(() =>
    orderCompletedPageType.value
      ? [OrderSuccessType['调价审核'], OrderSuccessType['运单审核'], OrderSuccessType['托寄物审核']].includes(
          orderCompletedPageType.value,
        )
      : false,
  )
  // 下单失败:不展示打印面单/通知收件人
  const isFailed = computed(() => orderCompletedPageType.value === OrderSuccessType.下单失败)
  // 是否显示通知收件人，当运单需要审核时不显示(支付宝小程序不要该功能)
  const needShare = computed(() => {
    const needShare = orderSuccessPageConfig?.needShare
    const flag = needShare?.toString() === 'true' ? true : false
    return flag && !authVisible.value && !isFailed.value && !aliPayOrAMapApp
  })
  const list = []

  // 支付宝小程序不要该功能
  if (!authVisible.value && !isFailed.value && !aliPayOrAMapApp && !isH5FSEnv) {
    list.push(isPintBtn)
    exp_express_print_v1()
    console.log('isPintBtn', isPintBtn)
  }
  // 单票才展示通知收件人，（返程单不展示）
  if (needShare.value && waybillList && waybillList.length === 1 && !isH5FSEnv) {
    list.push(notifyRecipientBtn)
  }
  console.log(list, 'dddddddddd', list.concat(currentConfig.value))
  if (data.value) {
    console.log(data.value, isPintAuth.value)
    return list.concat(currentConfig.value)
  }
}
