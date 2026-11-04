import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import TellClipBoardComponent from '@order-public-sub-public/components/business/limit-custom/tellClipBoard/index.vue'
import { h, ref, render } from 'vue'
import {
  CheckDetail,
  Delivery,
  Module,
  QueryObject,
  ReceiveAiInfo,
  SenderDimension,
  PureBatteryLimitTypeEnum,
} from '@order-public-sub-public/types'
import {
  Address,
  AgreementSignFlagText,
  BATCH_MAX_LENGTH,
  CanAutoAddOrder,
  Channel,
  CheckAfterSubmitType,
  CheckBeforeEnterType,
  DialogResultStatusType,
  fallbackInvoiceUrl,
  LimitResult,
  ModuleType,
  OrderPageType,
  PayMode,
  YesOrNoString,
} from '@order-public-sub-public/constants'

import { getBaseUrl, getEnv } from '@order-public-sub-public/utils/env'
import { $native, filterAllSpace, getQueryObject, getWaybillSource } from '@order-public-sub-public/utils/index'
import {
  applyOrderAuth,
  getAiAddrAnalysis,
  goRealNameHome,
  isOrderPage,
  skipVehicleOrder,
  tellClipBoardHasChange,
  updateHashQueryParams,
  updateSelect,
} from '@order-public-sub-public/validate/utils'
import { callThePhone, uuid } from '@order-public-sub-public/utils'
import useEffect from '@order-public-sub-public/validate'
import { closeToast, showToast, closeDialog } from '@order-public-sub-public/hooks/useShowToast'
import { useUpdateData as receiveUpdateData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import {
  getData as getSenderData,
  useUpdateData as senderUpdateData,
} from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { getChannel, getOrderConfigUrl, setChannel } from '@order-public-sub-public/configs'
import { getLastWaybillDetail, putUserSetting } from '@order-public-sub-public/apis'
import { noop, pick } from 'lodash-es'
import { resetWaybillInfo } from '@order-public-sub-public/utils/waybillInfo'
import { contactPopup } from '@order-public-sub-public/components/business/contact-business'
import { updateLimitResult } from '@order-public-sub-public/validate/limit'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { submit as payModeSubmit } from '@order-public-sub-public/components/business/pay-mode/hooks/useConfirm'
import { orderHomeRoute, useInit, useRefresh } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { getTemplateId } from '@order-public-sub-root-pages/order-single/hooks/template'
import { useUpdateStore } from '@order-public-sub-public/components/business/pickup-information/hooks/useModuleStore'
import { localStorage } from '@order-public-sub-public/utils/storage'
import {
  clkRiskOneSelfReport,
  expRiskOneSelfReport,
  reportAddressRecommend,
  reportEvent,
  reportNoPayResult,
  reportTellClipBoardResult,
  reportClickEvent,
  expAgreementSignFlag,
  clkAgreementSignFlag,
  submitAgreementSignFlag,
  expRealName,
  clkExpRealNameDialog,
  showBatteryLimitReport,
  clickBatteryLimitReport,
} from './../report/index'
import EventManager from '@order-public-sub-public/hooks/useEventSubscription'
import { isSingleOrderPage } from '@order-public-sub-public/store/utils'
import { testClipBoardTexrt } from '@order-public-sub-root-pages/order-batch/hooks/useTestClipBoard'
import { getContacts } from '@order-public-sub-public/apis/contasts'
import { showRealNameGuide } from '@order-public-sub-public/components/ui/person-name-guide/hooks/useState'
import { reportDialogResultHandle } from '@order-public-sub-public/validate/asynUtils'
import { virtualPhoneRealName } from '@order-public-sub-public/components/business/contact-business/utils'
import Taro from '@tarojs/taro'
import { getDialogRootClass } from '@order-public-sub-public/validate/pageConfig'
import { openURL } from '@/modules/webview/utils'
import { uploadGoodsTypePromise } from '@public/hooks/usePureBattery'

import { useStore } from '@order-public-sub-public/store'
import { downLoadFile } from '@order-public-sub-public/utils/downLoadFile'

const piniaStore = useStore()
const { remoteCheck } = useEffect()
const router = useRouter()
//打开联系商务组组件
export const openContactBusiness = (scene: string) => {
  contactPopup({
    scene,
  })
}

//手机号准入及需要联系商务的
export const mobileScrap = async (data: CheckDetail) => {
  const { content, preLimitType, extraData } = data
  reportEvent(preLimitType, {
    content,
    button_name: '下单准入校验',
  })
  const isContactOfficial = extraData?.mobileScrap?.isContactOfficial
  const cancelButtonText = '我知道了'
  const confirmButtonText = isContactOfficial ? '联系95324' : '联系商务'
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      showCancelButton: true,
      cancelButtonText,
      confirmButtonText,
      allowHtml: false,
    })
      .then(() => {
        reportClickEvent(preLimitType, {
          button_name: confirmButtonText,
        })
        if (isContactOfficial) {
          callThePhone('95324')
        } else {
          openContactBusiness('60')
        }
        if (!content) {
          resolve(data)
        }
        reject(data)
      })
      .catch(() => {
        reportClickEvent(preLimitType, {
          button_name: cancelButtonText,
        })
        reject(data)
      })
  })
}

const applied = ref(false) // 是否点击过立即申请

//下单权限审核
export const approval = async (data: CheckDetail) => {
  const { extraData } = data
  let content = data.content
  const { authPersonName, contactScene } = extraData?.haveApply || {}
  reportEvent('mobileScrap', {
    content,
  })
  let haveApply = extraData?.haveApply?.haveApply
  // 如果已点击过申请，需要更改内容和按钮的文案
  if (applied.value === true) {
    haveApply = CanAutoAddOrder.NO
    // const orderCustomer = piniaStore.schema.orderCustomer
  }
  const confirmButtonText = haveApply === CanAutoAddOrder.YES ? '立即申请' : `联系${authPersonName}`
  const cancelButtonText = '取消'
  const callPhone = async () => {
    try {
      const { data } = await getContacts({ scene: contactScene })
      if (data?.isNeedAuthenticate) {
        virtualPhoneRealName()
        return Promise.reject(false)
      }
      // closeDialog()
      if (!data.virtualMobile) {
        return showToast('电话为空')
      }
      callThePhone(data.virtualMobile)
    } catch (error) {
      console.log(error)
    } finally {
      closeToast()
    }
  }
  return new Promise((resolve, reject) => {
    let nextFlag = true
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      showCancelButton: true,
      cancelButtonText,
      confirmButtonText,
      allowHtml: true,
      showCustomConcat: haveApply === CanAutoAddOrder.YES,
      showCustomConcatCallBack: () => callPhone(),
      className: 'ky-normal-dialog',
      beforeClose: async (action) => {
        nextFlag = true
        if (action === 'confirm') {
          if (haveApply === CanAutoAddOrder.YES) {
            try {
              await applyOrderAuth()
              applied.value = true
              //sender.mobile只是为了刷新状态，为了不让changkey为空
              await remoteCheck('sender.mobile')
              showToast('申请成功')
            } catch (e) {
              console.warn(e)
            }
          } else {
            try {
              await callPhone()
            } catch (e) {
              nextFlag = false
            }
          }
        }
        return nextFlag
      },
    })
      .then(() => {
        reportClickEvent('mobileScrap', {
          button_name: confirmButtonText,
        })
        if (!content) {
          resolve(data)
        }
        reject(data)
      })
      .catch(() => {
        reportClickEvent('mobileScrap', {
          button_name: cancelButtonText,
        })
        if (haveApply === CanAutoAddOrder.YES && haveApply !== CanAutoAddOrder.YES) {
          callPhone()
        }
        reject(data)
      })
  })
}

// 封装一个安全的 btoa 函数
export const safeBtoa = (str) => {
  // 如果原生 btoa 可用，优先使用
  if (typeof btoa !== 'undefined') {
    return btoa(str)
  }

  // 否则使用 polyfill 逻辑
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let output = ''
  let chr1, chr2, chr3
  let enc1, enc2, enc3, enc4
  let i = 0

  while (i < str.length) {
    chr1 = str.charCodeAt(i++)
    chr2 = i < str.length ? str.charCodeAt(i++) : NaN
    chr3 = i < str.length ? str.charCodeAt(i++) : NaN

    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63

    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }

    output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4)
  }
  return output
}

/**
 * @description 实名认证
 * @param data - CheckDetail
 * @returns void
 */
export const realName = (data: CheckDetail) => {
  const { content, extraData, blockedFlag } = data
  const { showGoRealName } = extraData?.realNmeRsp || {}
  let confirmButtonText = '去认证'
  const cancelButtonText = '继续下单'

  const showCancelButton = !blockedFlag && showGoRealName
  if (!showGoRealName) {
    confirmButtonText = '继续下单'
  }
  if (blockedFlag) {
    confirmButtonText = '去认证'
  }

  const orderPageType = piniaStore.root.getOrderPageType
  const orderPageSource = isSingleOrderPage(orderPageType) ? 'single' : 'batch'
  const openRealName = () => {
    if (!blockedFlag) {
      goRealNameHome()
    } else {
      const syncId = uuid()
      const isSenderPage = window.location.href.includes('sender-page')
      // 通知相应的组件位置，提前拿到同步实名信息的id
      EventManager.publish('senderFormDataSyncIdChange', {
        syncId: syncId,
        orderPageType: orderPageType,
      })

      const senderFormData = isSenderPage
        ? getSenderData() || {}
        : piniaStore.order.moduleFormData(ModuleType['寄方信息']) || {}
      console.log('senderFormData--------------', senderFormData)
      const { person, mobile } = senderFormData
      const otherPhone = safeBtoa(filterAllSpace(mobile || ''))
      const idName = encodeURIComponent(person)
      const forceFlag = blockedFlag ? '20' : '10'
      // const url = `${getBaseUrl()}/real-name-auth.html#/personal?idName=${idName}&otherPhone=${otherPhone}&orderPageSource=${orderPageSource}&forceFlag=${forceFlag}&uniqueId=${syncId}`
      // openURL(url, {
      //   needLogin: true,
      // })
      Taro.navigateTo({
        url: `/modules/user/pages/realname/personal/index?idName=${idName}&otherPhone=${otherPhone}&orderPageSource=${orderPageSource}&forceFlag=${forceFlag}&uniqueId=${syncId}`,
      })
    }
  }
  expRealName(extraData?.realNmeRsp)
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '实名认证',
      message: content,
      cancelButtonText,
      confirmButtonText,
      showCancelButton,
      closeable: false,
      allowHtml: false,
      closeOnPopstate: false,
    })
      .then(() => {
        clkExpRealNameDialog(extraData?.realNmeRsp, confirmButtonText)
        if (confirmButtonText === '去认证') {
          reject(openRealName())
        } else {
          resolve(data)
        }
      })
      .catch(() => {
        clkExpRealNameDialog(extraData?.realNmeRsp, cancelButtonText)
        if (showCancelButton) {
          resolve(data)
        } else {
          reject(data)
        }
      })
  })
}

//地址推荐
export const addressSuggest = (data: CheckDetail) => {
  return new Promise((resolve) => {
    const { senderInfoVoList = [] } = piniaStore.schema.moduleDimensionData(ModuleType['寄方信息']) || {}
    const noReceiveAiInfoVoList = !senderInfoVoList || senderInfoVoList.length === 0
    const recommendAddressTime = piniaStore.globalData.recommendAddressTime
    if (noReceiveAiInfoVoList || recommendAddressTime > 0) {
      return resolve(data)
    }
    piniaStore.globalData.serRecommendAddressTime({ time: 1 })
    reportAddressRecommend('show', { button_content: data })
    showKyDialog({
      zIndex: 1000,
      title: '寄件信息推荐',
      showConfirmButton: false,
      showCancelButton: false,
      allowHtml: true,
      className: 'ky-suggest-dialog',
      closeable: true,
      senderInfoVoList,
      beforeClose: () => {
        updateSelect().catch((e) => {
          console.error(e)
        })
        resolve(data)
        reportAddressRecommend('close', { button_name: '关闭地址推荐' })
        return true
      },
      onSelectAddress: async (value: ReceiveAiInfo) => {
        const { setEditValue } = senderUpdateData({ moduleStyle: Address.SENDER })
        try {
          await setEditValue({ item: value, needMerge: true })
          await updateSelect()
          const parentClassName = getDialogRootClass() || 'dialog_root_order'
          const page = document.getElementsByClassName(parentClassName)?.[0] || document.body
          render(null, page)
          resolve(true)
          // await remoteCheck('sender')
        } catch (e) {
          console.warn(e)
        } finally {
          reportAddressRecommend('click', { button_content: value })
        }
      },
    }).catch((e) => {
      console.warn('addressSuggest', e)
    })
  })
}

//去支付
export const noPay = (data: CheckDetail) => {
  const { content, preLimitType } = data
  const url = getEnv() === 'PROD' ? fallbackInvoiceUrl.PROD : fallbackInvoiceUrl.DEV
  reportEvent(preLimitType, {
    content,
  })
  const cancelButtonText = '暂不处理'
  const confirmButtonText = '去支付'
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      showCancelButton: true,
      cancelButtonText,
      confirmButtonText,
    })
      .then(() => {
        reportClickEvent(preLimitType, {
          button_name: confirmButtonText,
        })
        reportNoPayResult()
        resolve(
          openURL(url, {
            needLogin: true,
            unDecodeUrl: true,
          }),
        )
      })
      .catch(() => {
        reportClickEvent(preLimitType, {
          button_name: cancelButtonText,
        })
        reject(data)
      })
  })
}

/**
 * @description 设置收件信息
 */
const setReceive = (
  data: CheckDetail,
  resolve: (data: CheckDetail) => void,
  res: NonNullable<Awaited<ReturnType<typeof getAiAddrAnalysis>>>,
) => {
  const moduleConfig: any = piniaStore.schema.moduleConfigData(ModuleType['收方信息'])
  const moduleStyle = moduleConfig.container === 'page' ? Address.RECEIVE_PAGE : Address.RECEIVE
  const { setEditValue } = receiveUpdateData({ moduleStyle: moduleStyle })
  resolve(data)
  const orderPageType = piniaStore.root.getOrderPageType
  if (orderPageType !== OrderPageType.批量寄) {
    if (moduleConfig.container === 'page') {
      router.push({
        path: '/receive-page',
        query: {
          addressType: Address.RECEIVE_ADDRESS_TYPE,
          pageSource: 'page',
        },
      })
    }
    setEditValue({ item: res, needMerge: true })
    if (moduleStyle === Address.RECEIVE) {
      setTimeout(() => {
        remoteCheck('receive')
      }, 1000)
    }
  } else {
    const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList
    if (batchWaybillInfoList.length >= BATCH_MAX_LENGTH) {
      showToast(`最多添加${BATCH_MAX_LENGTH}个收件人`)
      return
    }

    router.push({
      name: 'receive-page',
      query: {
        addressType: Address.RECEIVE_ADDRESS_TYPE,
        pageSource: 'page',
        from: CheckBeforeEnterType.识别粘贴板,
      },
    })
    setEditValue({ item: res, needMerge: true })
  }
}

//使用粘贴板内容
export const tellClipBoard = async (data: CheckDetail) => {
  const word = (await tellClipBoardHasChange()) || testClipBoardTexrt
  if (!word) {
    return Promise.resolve(word)
  }
  if (typeof word === 'string') {
    localStorage?.setItem('clipboardData', word)
  }
  const res = await getAiAddrAnalysis(word)
  if (!res) {
    return Promise.resolve(res)
  }
  return new Promise((resolve, reject) => {
    const { person = '', mobile = '', detailAddress = '', telephone = '', province, city, county } = res
    if (!person && !mobile && !detailAddress && !telephone) {
      resolve(data)
    }
    reportEvent(data.preLimitType)
    showKyDialog({
      zIndex: 1000,
      title: '是否使用粘贴板中的地址',
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: '设为寄件信息',
      confirmButtonText: '设为收件信息',
      allowHtml: true,
      closeable: true,
      className: 'ky-clipboard-dialog',
      extraDataValue: {
        person,
        mobile,
        detailAddress: `${province}${city}${county}${detailAddress}`,
        telephone,
      },
    })
      .then(() => {
        reportTellClipBoardResult('设为收件地址')
        setReceive(data, resolve, res)
      })
      .catch(() => {
        reportTellClipBoardResult('设为寄件地址')
        const moduleConfig: any = piniaStore.schema.moduleConfigData(ModuleType['寄方信息'])
        const moduleStyle = moduleConfig.container === 'page' ? Address.SENDER_PAGE : Address.SENDER
        const { setEditValue } = senderUpdateData({ moduleStyle: moduleStyle })
        reject(data)
        if (moduleConfig.container === 'page') {
          router.push({
            path: '/sender-page',
            query: {
              addressType: Address.SENDER_ADDRESS_TYPE,
              pageSource: 'page',
            },
          })
        }
        setEditValue({ item: res, needMerge: true })
        if (moduleStyle === Address.SENDER && !isOrderPage()) {
          setTimeout(() => {
            remoteCheck('sender')
          }, 1000)
        }
      })
  })
}

//复用上次的信息
export const lastInfo = (data: CheckDetail) => {
  const { content } = data
  const updateOrderInfo = async () => {
    const { data } = await getLastWaybillDetail()
    showRealNameGuide.value = false
    const waybillInfo = data?.waybillInfo
    if (!waybillInfo) {
      return
    }
    // 复用上次寄件信息是 需要使用当前环境的waybillSource
    waybillInfo.waybillSource = getWaybillSource()
    piniaStore.order.updateOrder({ data: waybillInfo })
    // 上次寄件信息process接口没有执行完毕不能下单
    const lastInfoPromise = remoteCheck('waybill.lastInfo')
    piniaStore.globalData.setInitDataPromise({ initDataPromise: lastInfoPromise })
  }
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      cancelButtonText: '否',
      confirmButtonText: '是',
      showCancelButton: true,
    })
      .then(() => {
        resolve(updateOrderInfo())
      })
      .catch(() => {
        reject(data)
      })
  })
}

/**
 * @description 货好时间温馨提示
 */
export const goodsTime = (data: CheckDetail) => {
  const { content } = data
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      message: content,
      titleIcon: 'https://ic-img.ky-express.com/netc/20250619_24836_!!1750314243650_341_308.png',
      allowHtml: true,
      title: '温馨提示',
      confirmButtonText: '我知道了',
      beforeClose: async (action) => {
        try {
          await updateLimitResult({
            type: CheckAfterSubmitType.货好时间,
            flag: action === 'confirm' ? LimitResult.确认 : LimitResult.取消,
          })
        } catch (e) {
          console.warn(e)
        }
        return true
      },
    })
      .then(() => {
        resolve(data)
      })
      .catch(() => {
        reject(data)
      })
  })
}

/**
 * @description 切换下单配置刷新之前使用process接口返回最新的configId和configVersion
 */
export const goActivity = () => {
  const query = getQueryObject() as QueryObject
  const { configId = '', versionId = '' } = piniaStore.globalData.currentConfig
  const waybillNumber = piniaStore.order.waybillNumber
  query.configId = configId
  query.configVersion = versionId
  query.textCode = waybillNumber
  // 区分单票批量场景
  const orderPageType = piniaStore.root.getOrderPageType
  const channel = isSingleOrderPage(orderPageType) ? Channel.立即前往 : Channel.批量立即前往

  query.channel = channel
  if (getTemplateId()) {
    query.templateId = getTemplateId()
  }

  setChannel(channel)

  // const newUrl = getOrderConfigUrl(query, 'pages/order/index')
  orderHomeRoute.value = query
  // 替换当前页面，不保留历史栈（类似 location.replace）
  // router.replace('/order', query)
  useRefresh(channel)
}

//切换下单配置
export const switchConfig = (data: CheckDetail) => {
  const { content } = data
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      cancelButtonText: '取消',
      confirmButtonText: '现在前往',
      showCancelButton: true,
      allowHtml: false,
    })
      .then(() => {
        goActivity()
        resolve('')
      })
      .catch(() => {
        const currentConfig = piniaStore.globalData.currentConfig
        const preConfig = piniaStore.globalData.preConfig
        // 如果不前往活动，需要上报
        putUserSetting(CheckBeforeEnterType.切换配置, {
          ...pick(currentConfig, ['configId', 'versionId', 'themeName']),
          ...preConfig,
        }).catch((e) => {
          console.warn('switchConfig', e)
        })
        reject(data)
      })
  })
}

//整车下单提示
export const overWeight = (data: CheckDetail) => {
  const { content, blockedFlag } = data
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      cancelButtonText: '继续下单',
      confirmButtonText: '去整车',
      showCancelButton: !blockedFlag,
      allowHtml: false,
    })
      .then(() => {
        if (blockedFlag) {
          return reject(data)
        }
        resolve(skipVehicleOrder())
      })
      .catch(() => {
        resolve(data)
      })
  })
}

//付款授权弹框
export const payAuthorizeConfirm = (data: CheckDetail) => {
  const { content, blockedFlag, preLimitType } = data
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      cancelButtonText: '返回',
      confirmButtonText: '继续',
      showCancelButton: !blockedFlag,
      allowHtml: false,
      closeable: false,
      beforeClose: async (action) => {
        try {
          await updateLimitResult({
            type: preLimitType,
            flag: action === 'confirm' ? LimitResult.确认 : LimitResult.取消,
          })
        } catch (e) {
          console.warn(e)
        }
        return true
      },
    })
      .then(() => {
        if (blockedFlag) {
          return reject(data)
        }
        resolve(data)
      })
      .catch(async () => {
        await payModeSubmit({ payMode: PayMode['寄方付'] }, noop, 'payMode|payMode.cancelAuth')
        reject(data)
      })
  })
}

// 寄收地址一致弹框
export const receiveSendAddressSame = (data: CheckDetail) => {
  const { content, blockedFlag } = data
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      message: content,
      allowHtml: true,
      title: '温馨提示',
      confirmButtonText: '我知道了',
      beforeClose: async () => {
        return true
      },
    })
      .then(() => {
        if (blockedFlag) {
          return reject(data)
        }
        resolve(data)
      })
      .catch(() => {
        reject(data)
      })
  })
}

// 大票货提醒
export const bulkCargoConfirm = (data: CheckDetail) => {
  const { content } = data

  const orderPageType = piniaStore.root.getOrderPageType

  const updateStore = (bulkCargoFlag: string) => {
    if (orderPageType !== OrderPageType.批量寄) {
      useUpdateStore({ bulkCargoFlag })
    } else {
      piniaStore.order.updateBatchBulkCargoInfo({ flag: bulkCargoFlag })
    }
  }

  return new Promise((resolve) => {
    showKyDialog({
      zIndex: 1000,
      message: content,
      titleIcon: 'https://ic-img.ky-express.com/netc/20250619_12234_!!1750302484464_340_338.png',
      allowHtml: true,
      title: '大票货提醒',
      cancelButtonText: '否',
      confirmButtonText: '是',
      showCancelButton: true,
      beforeClose: async () => {
        return true
      },
    })
      .then(() => {
        //大票货标识，10：支持出入挂车，20：不支持出入挂车
        // useUpdateStore({ bulkCargoFlag: '10' })
        updateStore('10')
        resolve(data)
      })
      .catch(() => {
        // useUpdateStore({ bulkCargoFlag: '20' })
        updateStore('20')
        resolve(data)
      })
  })
}

//下单失败
export const failRetryOrder = (data: CheckDetail) => {
  const isEdit = getChannel() === Channel.修改运单
  const waybillNumber = piniaStore.order.waybillNumber
  const confirmButtonText = isEdit ? '我知道了' : '查看运单'
  const { content, preLimitType } = data
  reportEvent(preLimitType)
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      message: content,
      allowHtml: true,
      title: '温馨提示',
      showCancelButton: !isEdit,
      confirmButtonText: confirmButtonText,
      cancelButtonText: '继续下单',
      beforeClose: async () => {
        return true
      },
    })
      .then(() => {
        if (isEdit) {
          Taro.navigateBack()
          $native?.refreshSearch()
          return reject(false)
        }
        console.log(resolve)
        Taro.redirectTo({
          url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${waybillNumber}`,
        })
        useRefresh(getChannel())
        // failOrderReport('clk_express_repeatsub_waybill_v1')
        reject(false)
      })
      .catch(() => {
        // failOrderReport('clk_express_repeatsub_continue_v1')
        useRefresh(getChannel())
        reject(data)
      })
  })
}

//收件地址已下单确认弹框
export const repeatWaybillConfirm = (data: CheckDetail) => {
  const { content, blockedFlag, preLimitType } = data
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      message: content,
      allowHtml: true,
      title: '温馨提示',
      showCancelButton: true,
      cancelButtonText: '稍后下单',
      confirmButtonText: '继续下单',
      beforeClose: async (action) => {
        try {
          await reportDialogResultHandle({
            preLimitType,
            result: action === 'confirm' ? YesOrNoString.YES : YesOrNoString.NO,
          })
        } catch (e) {
          console.warn(e)
        }
        return true
      },
    })
      .then(() => {
        if (blockedFlag) {
          return reject(data)
        }
        resolve(data)
      })
      .catch(() => {
        reject(data)
      })
  })
}

//托寄物首次填写告知书
export const goodsTypeInform = (data: CheckDetail) => {
  const normalContent =
    '<div class="section">尊敬的客户：</div><div  class="section two-indent">如您的<text class="red_color">托寄物涉及锂电池等危险类物品或禁运物品的，请提前向本公司说明。</text> 如您未提前说明，给本公司或其他托寄人造成损失的，应当承担相应的责任。</div><div  class="section two-indent"><text class="red_color">请您如实申报托寄物名称、数量、重量、声明价值等资料</text>， 因申报信息不实导致无法获得理赔、对其他客户或本公司造成损害的，您应当承担责任。 </div><div  class="section two-indent mt-30">感谢您的理解和配合，顺祝商祺！</div><div class="text-right"><strong>跨越速运</strong></div>'
  const { content, blockedFlag, preLimitType } = data
  const confirmButtonText = '我知道了'
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '重要事项告知书',
      message: content || normalContent,
      showCancelButton: false,
      confirmButtonText,
      allowHtml: true,
      closeable: false,
      className: 'ky-bulletin-dialog',
    }).finally(() => {
      reportDialogResultHandle({
        preLimitType,
        result: YesOrNoString.YES,
        params: {
          buttonName: confirmButtonText,
        },
      })
      return blockedFlag ? reject(false) : resolve(true)
    })
  })
}

//如实申报弹框
export const truthfullyDeclareConfirm = (data: CheckDetail) => {
  const { content, blockedFlag, preLimitType } = data
  const confirmButtonText = '继续修改'
  reportDialogResultHandle({ preLimitType, result: DialogResultStatusType.展示 })
  expRiskOneSelfReport()
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '托寄物修改提醒',
      message: content,
      showCancelButton: false,
      confirmButtonText,
      allowHtml: true,
      closeable: false,
    }).then(() => {
      reportDialogResultHandle({
        preLimitType,
        result: DialogResultStatusType.确定,
        params: {
          buttonName: confirmButtonText,
        },
      })
      clkRiskOneSelfReport(confirmButtonText)
      return blockedFlag ? reject(false) : resolve(true)
    })
  })
}

// 收件超区
export const overArea = (data: CheckDetail) => {
  const { content } = data
  return new Promise((reslove, reject) => {
    console.log(reslove)
    showKyDialog({
      zIndex: 1000,
      message: content,
      allowHtml: true,
      title: '温馨提示',
      cancelButtonText: '我知道了',
      confirmButtonText: '联系商务',
      showCancelButton: true,
    })
      .then(() => {
        openContactBusiness()
        reject({ ...data, diyBlockedFlag: true })
      })
      .catch(() => {
        reject({ ...data, diyBlockedFlag: true })
      })
  })
}

//兜底的dialog
export const normalDialog = (data: CheckDetail) => {
  const { content, blockedFlag, preLimitType } = data
  const confirmButtonText = blockedFlag ? '我知道了' : '继续下单'
  reportEvent(preLimitType)
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      cancelButtonText: '取消',
      confirmButtonText,
      showCancelButton: !blockedFlag,
      allowHtml: true,
      beforeClose: async (action) => {
        if (preLimitType === CheckBeforeEnterType.当天达延误) {
          try {
            await updateLimitResult({
              type: preLimitType,
              flag: action === 'confirm' ? LimitResult.确认 : LimitResult.取消,
              data,
            })
          } catch (e) {
            console.warn(e)
          }
        }
        return true
      },
    })
      .then(() => {
        if (blockedFlag) {
          return reject(data)
        }
        resolve(data)
      })
      .catch(() => {
        reject(data)
      })
  })
}

// 命中切换配置不跳转
export const switchingConfig = async () => {
  // 刷新页面
  console.log('命中切换配置刷新页面')

  const orderPageType = piniaStore.root.getOrderPageType
  const newConfigId = piniaStore.globalData.currentConfig.configId
  const newConfigVersion = piniaStore.globalData.currentConfig.versionId
  console.log('newConfigId', newConfigId, 'newConfigVersion', newConfigVersion)
  if (newConfigId && newConfigVersion) {
    updateHashQueryParams(newConfigId, newConfigVersion)
  }

  const route = orderPageType === OrderPageType.批量寄 ? OrderPageType.批量寄 : ('' as OrderPageType)

  const { init } = useInit(route)
  const initPromise = init(route, { showSkeleton: false })

  await piniaStore.globalData.setInitDataPromise({ initDataPromise: initPromise })
}

// 禁止代客下单提示
export const internalEmployeeConfirm = (data: CheckDetail) => {
  const { blockedFlag, preLimitType, extraData, content } = data
  const { agreementSignFlag } = extraData?.replaceOrder || {}
  if (agreementSignFlag) {
    const confirmButtonText = '发送协议给客户'
    const cancelButtonText = '我知道了'
    expAgreementSignFlag(agreementSignFlag)
    return new Promise((resolve, reject) => {
      showKyDialog({
        zIndex: 1000,
        title: '代客下单提示',
        message: AgreementSignFlagText[agreementSignFlag],
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        allowHtml: true,
        closeable: false,
      })
        .then(async () => {
          clkAgreementSignFlag(agreementSignFlag, confirmButtonText)
          await reportDialogResultHandle({
            preLimitType,
            result: DialogResultStatusType.确定,
            addWaybillNumber: true,
            addWaybillInfos: false,
            params: {
              buttonName: confirmButtonText,
              agreementSignFlag,
            },
          })
            .then(() => {
              showToast('短信已发送，请联系主授权人确认')
              submitAgreementSignFlag(agreementSignFlag)
              return blockedFlag ? reject(false) : resolve(true)
            })
            .catch((err) => {
              showToast(err?.msg)
              reject(data)
              submitAgreementSignFlag(agreementSignFlag, err?.msg)
            })
        })
        .catch(() => {
          clkAgreementSignFlag(agreementSignFlag, cancelButtonText)
          reject(data)
        })
    })
  } else {
    return new Promise((resolve, reject) => {
      showKyDialog({
        zIndex: 1000,
        title: '温馨提示',
        message: content,
        showCancelButton: false,
        confirmButtonText: '我知道了',
        allowHtml: true,
        closeable: false,
      }).then(() => {
        return blockedFlag ? reject(false) : resolve(true)
      })
    })
  }
}
//付款方式校验弹框
export const paymentAccountConfirm = (data: CheckDetail) => {
  const { content, blockedFlag } = data
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      confirmButtonText: '我知道了',
      showCancelButton: !blockedFlag,
      allowHtml: true,
    })
      .then(() => {
        if (blockedFlag) {
          return reject(data)
        }
        resolve(data)
      })
      .catch(() => {
        reject(data)
      })
  })
}

// 电池货
export const pureBatteryLimit = (data: CheckDetail) => {
  const { content, extraData } = data
  const { type, goodsTypeApprovalStatus, downloadLink } = extraData?.pureBatteryResp ?? {}
  const buttonTextMap: {
    [key: string]: any
  } = {
    pureBatteryCannotPlaceOrder: {
      cancel: '我知道了',
      confirm: '联系商务',
    },
    pureBatteryLetterOfCommitment: {
      cancel: '下载承诺书模板',
      confirm: '联系商务',
    },
    pureBatteryUploadFiles: {
      cancel: '稍后下单',
      confirm: '去上传',
    },
  }
  console.log(downloadLink, 'downloadLinkdownloadLink', data)
  showBatteryLimitReport(content)
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: content,
      confirmButtonText: buttonTextMap[type as string].confirm,
      cancelButtonText: buttonTextMap[type as string].cancel,
      showCancelButton: true,
      allowHtml: true,
    })
      .then(async () => {
        if (
          [PureBatteryLimitTypeEnum.承诺书, PureBatteryLimitTypeEnum.含电池].includes(type as PureBatteryLimitTypeEnum)
        ) {
          clickBatteryLimitReport('联系商务')
          contactPopup()
          return reject(data)
        } else {
          console.log('跳转到上传文件的页面')
          clickBatteryLimitReport('去上传')
          Taro.navigateTo({
            url: `/modules/order-build-sub-pages/order-public/components/business/product-info/components/goods-type-files/index?goodsTypeApprovalStatus=${goodsTypeApprovalStatus}`,
          })
          await uploadGoodsTypePromise()
          return resolve(data)
        }
      })
      .catch(() => {
        // 稍后下单 或者 含电池 关闭弹窗中断下单
        if (
          [PureBatteryLimitTypeEnum.上传文件, PureBatteryLimitTypeEnum.含电池].includes(
            type as PureBatteryLimitTypeEnum,
          )
        ) {
          clickBatteryLimitReport('稍后下单')
          reject(data)
        } else {
          clickBatteryLimitReport('下载承诺书模板')
          downLoadFile(downloadLink as string, 'docx', '非全新电池类货物安全承诺书.docx')
          reject(data)
        }
      })
  })
}

//保费校验弹框
export const insuranceLimitConfirm = (data: CheckDetail) => {
  const { content, blockedFlag } = data
  return new Promise((resolve, reject) => {
    showKyDialog({
      title: '温馨提示',
      message: content,
      confirmButtonText: '联系商务',
      cancelButtonText: '取消',
      showCancelButton: true,
      allowHtml: true,
      zIndex: 1000,
    })
      .then(() => {
        openContactBusiness()
        if (blockedFlag) {
          return reject(data)
        }
        resolve(data)
      })
      .catch(() => {
        reject(data)
      })
  })
}
//号码保护
export const phoneConfirm = (data: CheckDetail) => {
  const { content, extraData } = data
  const { restrainedType = '0', uniqueCode } = extraData?.phoneProtectResp || {}
  const senderPhone = restrainedType === '0'
  const title = senderPhone ? '号码保护提醒' : '温馨提示'
  const confirmButtonText = senderPhone ? '短信验证' : '我知道了'
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      title,
      message: content,
      confirmButtonText,
      cancelButtonText: '取消',
      showCancelButton: senderPhone,
      allowHtml: true,
    })
      .then(() => {
        if (senderPhone) {
          const bizLoad = JSON.stringify({
            waybillKeylist: uniqueCode?.split(','),
          })
          const senderPhoneValue = piniaStore.order.moduleFormData(ModuleType['寄方信息'])?.mobile
          const url = `/modules/privacy-phone/pages/sms-code/index?phone=${filterAllSpace(senderPhoneValue)}&type=order&bizLoad=${encodeURIComponent(bizLoad)}`
          //跳转基础号码验证
          Taro.navigateTo({
            url: url,
          })
          return reject(data)
        }
        reject(data)
      })
      .catch(() => {
        reject(data)
      })
  })
}
