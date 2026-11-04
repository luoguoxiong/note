import { effectMasker, effectPopup } from '@order-public-sub-public/validate/effect/effectPopup'
import { createVNode, ref, render } from 'vue'
import {
  AddressRestrict,
  AdjustPrice,
  CheckDetail,
  ClearanceWarehouse,
  CutoffCar,
  GoodsDangerRestrict,
  GoodsRestrict,
  InsuranceRestrict,
  RestrictData,
} from '@order-public-sub-public/types'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
// import { Button, closeDialog, Popup, Radio, RadioGroup } from 'vant'
import { closeDialog } from '@order-public-sub-public/hooks/useShowToast'
import clearanceWarehousePopup from '@order-public-sub-public/components/business/added-service/components/clearance-warehouse-popup/index.vue'
import {
  Channel,
  CheckAfterSubmitType,
  CheckBeforeEnterType,
  DialogResultStatusType,
  dialogStatusMap,
  GoodsDangerType,
  LimitBlockType,
  LimitResult,
  OrderPageType,
  PickerLimitMap,
  YesOrNoNumber,
} from '@order-public-sub-public/constants'

import { uploadAdjustPriceResult } from '@order-public-sub-public/apis'
import { getPrepaidFreightUrl, getQueryObject, getWaybillSource } from '@order-public-sub-public/utils'
import {
  cancelOrderAndGoWaybillSearch,
  isOrderPage,
  skipVehicleOrder,
  tellClipBoardHasChange,
} from '@order-public-sub-public/validate/utils'
import { updatePayAuthorizeAction } from '@order-public-sub-public/components/business/pay-mode/hooks/useConfirm'
import { openContactBusiness } from '@order-public-sub-public/validate/access'
import umpOtherReport from '../../reportUmp/sceneReport/umpotherReport'
import { contactPopup } from '@order-public-sub-public/components/business/contact-business'
import { getBatchId, getChannel } from '@order-public-sub-public/configs'
import { isSingleOrderPage } from '@order-public-sub-public/store/utils'
import { reportDialogResultHandle } from '@order-public-sub-public/validate/asynUtils'
import {
  clkAdjust,
  clkDangerReport,
  expDangerReport,
  clkPickerLimit,
  expAdjust,
  expCutoffCar,
} from '@order-public-sub-public/validate/report'
import { isAliPayClient } from '@order-public-sub-public/utils/device'
import { getDialogRootClass } from '@order-public-sub-public/validate/pageConfig'
import { openURL } from '@/modules/webview/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

// interface maskerInstance extends ComponentPublicInstance {
//   unmount?: () => void
// }
let pickerInstance: any

// 需要重新计算费用
export const needReCalculateCost = ref(false)

// 是否需要上报管控
export const confirmRestrict = ref(false)

/**
 * 根据key更新管控用户点击的结果
 */
// eslint-disable-next-line max-params
export const updateLimitResult = async (options: {
  type: string
  flag: LimitResult
  data?: any
  isRadio?: boolean
}) => {
  const { type, flag, data, isRadio = false } = options
  if (!type) {
    return
  }
  if (type === CheckBeforeEnterType.付款授权) {
    updatePayAuthorizeAction(flag)
    return
  }
  if (type === CheckAfterSubmitType.调价 || type === CheckAfterSubmitType.截单专车) {
    clkAdjust(type, flag)
  }
  let respId = data?.themeId
  const needAdjustRespId: string[] = [
    CheckAfterSubmitType.调价,
    CheckAfterSubmitType.报关入仓,
    CheckAfterSubmitType.报关出仓,
  ]
  if (needAdjustRespId.includes(type)) {
    respId = data?.adjustRespId

    const orderPageType = piniaStore.root.getOrderPageType

    if (orderPageType === OrderPageType.批量寄单票) {
      needReCalculateCost.value = true
      if (type === CheckAfterSubmitType.调价) {
        // 批量寄单票不同意调价 需要添加管控设置，内外同步写入store
        const batchRestrictData = piniaStore.globalData.restrictData

        const newData = {
          ...batchRestrictData,
          adjustPrice: {
            ...batchRestrictData.adjustPrice,
            confirmResult: flag === LimitResult.拒绝 ? YesOrNoNumber.NO : YesOrNoNumber.YES,
          } as AdjustPrice,
        }

        piniaStore.globalData.setRestrictData({ restrictData: newData })

        piniaStore.order.updateOrderRestrictByNumber({
          data: newData,
          orderPageType: OrderPageType.批量寄,
        })
      }
    }
  }
  if (type === CheckAfterSubmitType.取派管控) {
    respId = data?.respId
  }

  const waybillNumber = piniaStore.order.waybillNumber || piniaStore.globalData.restrictWaybillNumber
  try {
    await uploadAdjustPriceResult([
      {
        adjustRespId: respId,
        adjustResult: flag,
        adjustBackType: type,
        waybillSource: getWaybillSource(),
        waybillNumber: waybillNumber || getBatchId(), // #445947 批量公共部分没有运单号需要上报batchId
      },
    ])
  } catch (error) {
    console.error(error)
  }

  refashWaybillInfoList(type, flag, isRadio)
}

// 批量寄修改单条命中报关出入仓后需要调用过程中刷新管控数据
const refashWaybillInfoList = async (type: string, flag: LimitResult, isRadio = false) => {
  const orderPageType = piniaStore.root.getOrderPageType

  const typeMap: Record<string, number> = {
    [CheckAfterSubmitType.取派管控]: 1,
    [CheckAfterSubmitType.截单专车]: 1,
    [CheckAfterSubmitType.报关入仓]: 1,
    [CheckAfterSubmitType.报关出仓]: 1,
    [CheckAfterSubmitType.报关出入仓]: 1,
    [CheckAfterSubmitType.调价]: 1,
  }

  if (flag === LimitResult.取消) {
    return
  }

  if (isSingleOrderPage(orderPageType) && typeMap[type] && !isRadio) {
    // 只有点的是同意、不同意场景
    confirmRestrict.value = true
  }
}

//数组直接上报
export const updateWarehouse = async (data: any) => {
  if (!Array.isArray(data)) {
    return
  }
  data = data.map((i) => {
    return {
      waybillSource: getWaybillSource(),
      waybillNumber: piniaStore.order.waybillNumber || piniaStore.globalData.restrictWaybillNumber,
      ...i,
    }
  })
  try {
    await uploadAdjustPriceResult(data)
  } catch (error) {
    console.error(error)
  }
  refashWaybillInfoList(CheckAfterSubmitType.报关出入仓, LimitResult.确认)
}

/**
 * 调价管控
 * @param {*} data调价管控的数据
 * @returns {*}返回promise
 */
export const adjustPriceLimit = async (data: AdjustPrice, type: CheckAfterSubmitType) => {
  const { customerRichTips, adjustRespId, isAgreeContinue, limitedOrderFlag } = data
  expAdjust()
  if (limitedOrderFlag === LimitBlockType.限制) {
    return new Promise((resolve, reject) => {
      showKyDialog({
        zIndex: 1000,
        message: customerRichTips,
        titleIcon: PickerLimitMap[110]?.iconUrl,
        title: '限制下单',
        allowHtml: true,
        showCancelButton: true,
        cancelButtonText: '我知道了',
        confirmButtonText: '联系商务',
      })
        .then(() => {
          openContactBusiness()
          console.log('resolve', resolve)
          reject(data)
        })
        .catch(() => {
          // #451445 批量寄单条特殊标记
          const orderPageType = piniaStore.root.getOrderPageType
          if (orderPageType === OrderPageType.批量寄单票) {
            resolve({ ...data, status: true })
          } else {
            reject(data)
          }
        })
    })
  }
  return effectPopup({
    title: '调价通知',
    content: formatHtml(customerRichTips),
    type,
    adjustRespId,
    blockedFlag: isAgreeContinue,
    className: 'adjust_price',
  })
}
/**
 * 格式化 HTML，批量添加多个标签的 class
 */
export function formatHtml(html: string): string {
  let result = html
  result = result.replace(/<font/g, '<text').replace(/font>/g, 'text>')
  return result
}

/**
 * 截单专车管控
 * @param {*} data截单专车管控的数据
 * @returns {*}返回promise
 */
export const cutoffCarLLimit = async (data: CutoffCar, type: CheckAfterSubmitType) => {
  const { customerRichTips, themeId, isAgreeContinue } = data
  expCutoffCar()
  return effectPopup({
    title: '专车服务确认',
    content: customerRichTips,
    type,
    themeId,
    blockedFlag: isAgreeContinue,
  })
}

// 取派管控弹窗的promise
// let pickerPromiseResolve: ((value: unknown) => void) | null = null
let pickerPromiseReject: ((value: unknown) => void) | null = null

// 联系商务
function contactPopupFn() {
  // closeDialog()
  contactPopup()
  // 点联系商务关闭弹窗相当于点了我再想想
  pickerPromiseReject?.(true)
}
// 添加事件
const contactPhoneLister = (type: string) => {
  if (type === 'add') {
    // 等待弹框渲染
    setTimeout(() => {
      const divlist = document.getElementsByClassName('picker-limit-contact-phone')
      if (divlist && divlist.length) {
        divlist[divlist.length - 1].addEventListener('click', contactPopupFn)
        console.log(divlist[divlist.length - 1])
      }
    }, 300)
  } else {
    const divlist = document.getElementsByClassName('picker-limit-contact-phone')
    if (divlist && divlist.length) {
      divlist[divlist.length - 1].removeEventListener('click', contactPopupFn)
      console.log(divlist[divlist.length - 1])
    }
  }
}
/**
 * 取派管控
 * @param {*} data取派管控的数据
 * @returns {*}返回promise
 */
// eslint-disable-next-line max-lines-per-function
export const pickerLimit = async (data: AddressRestrict) => {
  const { customerRichTips = '', limitReason, restrictedType, fenceOverZone, storageFlag, contacters } = data || {}
  const blockedFlag = restrictedType === LimitBlockType.限制

  //获取确认按钮文案
  const getConfirmButtonText = (blockedFlag: boolean, storageFlag: boolean) => {
    let normalConfirmButtonText = blockedFlag ? '我知道了' : '继续下单'
    normalConfirmButtonText = storageFlag ? '去充值' : normalConfirmButtonText
    return normalConfirmButtonText
  }
  //跳转充值
  const goDeposit = () => {
    const url = getPrepaidFreightUrl()
    openURL(url, {
      needLogin: true,
      type: 'redirectTo',
    })
  }
  const confirmButtonText = getConfirmButtonText(blockedFlag, storageFlag)
  let title = blockedFlag ? '限制下单' : '温馨提示'
  if (storageFlag) {
    //预存管控特殊处理，需求
    title = '温馨提示'
  }
  const cancelButtonText = storageFlag ? '我再想想' : '取消'
  const openDialog = () => {
    umpOtherReport('EXP', {
      eventCode: 'exp_express_single_Dispatch_v1',
      regionCode: 'pop',
    })

    // #447430 将dialogPromise使用promise包一层，用来增强额外事件的控制能力：预存管控弹窗联系商务点击事件
    const pickerPromise = new Promise((resolve, reject) => {
      // pickerPromiseResolve = resolve
      pickerPromiseReject = reject
      showKyDialog({
        zIndex: 1000,
        message: customerRichTips,
        storageFlag: !!storageFlag,
        titleIcon: PickerLimitMap[limitReason]?.iconUrl,
        title,
        allowHtml: true,
        extraDataValue: {
          contacters,
        },
        showCancelButton: !blockedFlag || storageFlag,
        cancelButtonText,
        confirmButtonText,
        beforeClose: async (action) => {
          let limitResult: LimitResult
          if (blockedFlag) {
            limitResult = LimitResult.取消
          } else {
            limitResult = action === 'confirm' ? LimitResult.确认 : LimitResult.取消
          }
          clkPickerLimit(action === 'confirm' ? confirmButtonText : cancelButtonText)
          try {
            await updateLimitResult({ type: CheckAfterSubmitType.取派管控, flag: limitResult, data })
          } catch (e) {
            console.warn(e)
          }
          return true
        },
      })
        .then(() => resolve(true))
        .catch(() => reject())
        .finally(() => {
          // contactPhoneLister('remove')
        })
    })

    // contactPhoneLister('add')
    return pickerPromise
  }
  if (fenceOverZone && isOrderPage()) {
    closeFenceOverZone()
    const app = effectMasker({
      blockedFlag: true,
      callback: () => {
        openDialog()
      },
      topSelector: ['Receive', 'Sender', 'GoodsTime'],
      immediate: true,
    })
    pickerInstance = app
    return Promise.reject(data)
  } else {
    return new Promise((resolve, reject) => {
      openDialog()
        .then(() => {
          if (blockedFlag) {
            if (storageFlag) {
              reject(goDeposit())
            }
            // #451445 批量寄单条特殊标记
            const orderPageType = piniaStore.root.getOrderPageType
            if (orderPageType === OrderPageType.批量寄单票) {
              resolve({ ...data, status: true })
            } else {
              reject(data)
            }
          } else {
            resolve(data)
          }
        })
        .catch(() => {
          reject(data)
        })
    })
  }
}
//关闭超区遮罩层
export const closeFenceOverZone = () => {
  if (pickerInstance && typeof pickerInstance.unmount === 'function') {
    pickerInstance?.unmount()
  }
}

/**
 * 报关出入仓
 * @param {*} data报关出入仓的数据
 * @returns {*}返回promise
 */
export const orderWarehouseLimit = async (data: ClearanceWarehouse) => {
  const { isAgreeContinue } = data
  return new Promise((resolve, reject) => {
    const parentClassName = getDialogRootClass()
    const page = document.getElementsByClassName(parentClassName)?.[0] || document.body
    const unmount = () => {
      render(null, page)
    }
    const vnode = createVNode(clearanceWarehousePopup, {
      show: true,
      clearanceWarehouse: data,
      cancel: () => {
        unmount()
        reject(data)
      },
      submit: (agree: boolean) => {
        unmount()
        if (isAgreeContinue && !agree) {
          return reject(data)
        }
        resolve(data)
      },
    })
    render(vnode, page)
  })
}

/**
 * 托寄物管控
 * @param {*} data托寄物管控的数据
 * @returns {*}返回promise
 */
export const goodsRestrictLimit = async (data: GoodsRestrict) => {
  const blockedFlag = data?.error
  let { msg } = data?.error || {}
  if (!blockedFlag) {
    const firstMsg = data?.alerts[0]
    msg = firstMsg?.msg
  }
  if (!msg) {
    return
  }
  const confirmButtonText = blockedFlag ? '我知道了' : '继续下单'
  return showKyDialog({
    zIndex: 1000,
    message: msg,
    title: '温馨提示',
    showCancelButton: !blockedFlag,
    cancelButtonText: '取消',
    confirmButtonText,
    allowHtml: true,
    beforeClose: async () => {
      try {
        await updateLimitResult({ type: CheckAfterSubmitType.托寄物, flag: LimitResult.确认, data })
      } catch (e) {
        console.warn(e)
      }
      return true
    },
  })
}

/**
 * 投保管控
 * @param {*} data投保管控管控
 * @returns {*}返回promise
 */
export const insuranceRestrictLimit = async (data: InsuranceRestrict) => {
  return Promise.reject(data)
}

/**
 * 危险品管控
 * @param {*} data
 * @returns {*}返回promise
 */
const editStatusMap = {
  [GoodsDangerType.危险品已签协议弹窗]: {
    title: '温馨提示',
    confirmButtonText: isAliPayClient ? '联系商务' : '去整车并取消运单',
    confirmButtonAction: isAliPayClient ? () => openContactBusiness() : skipVehicleOrder,
    cancelButtonText: '我知道了',
  },
  [GoodsDangerType.危险品未签协议弹窗]: {
    title: '运单异常提醒',
    confirmButtonText: '联系商务',
    cancelButtonText: '取消运单',
    confirmButtonAction: () => openContactBusiness(),
  },
  [GoodsDangerType.禁止运输]: {
    title: '运单异常提醒',
    confirmButtonText: '联系商务',
    cancelButtonText: '取消运单',
    confirmButtonAction: () => openContactBusiness(),
  },
}
const orderStatusMap = {
  [GoodsDangerType.危险品已签协议弹窗]: {
    title: '温馨提示',
    confirmButtonText: isAliPayClient ? '联系商务' : '去整车下单',
    confirmButtonAction: isAliPayClient ? () => openContactBusiness() : skipVehicleOrder,
    cancelButtonText: '我知道了',
  },
  [GoodsDangerType.危险品未签协议弹窗]: {
    title: '托寄物填写提醒',
    confirmButtonText: '联系商务',
    confirmButtonAction: () => openContactBusiness(),
    cancelButtonText: '我知道了',
  },
  [GoodsDangerType.禁止运输]: {
    title: '托寄物填写提醒',
    confirmButtonText: '联系商务',
    confirmButtonAction: () => openContactBusiness(),
    cancelButtonText: '我知道了',
  },
}
export const goodsDangerLimit = (data?: GoodsDangerRestrict) => {
  const { type = GoodsDangerType.危险品未签协议弹窗, msg = '', returnWaybillFlag } = data || {}
  const { isAppointmentPickup } = getQueryObject()
  const editOrder = getChannel() === Channel.修改运单 && !isAppointmentPickup
  const signed = type === GoodsDangerType.危险品已签协议弹窗
  const waybillNumber = piniaStore.order.waybillNumber

  const { confirmButtonText, cancelButtonText, title, confirmButtonAction } = editOrder
    ? editStatusMap[type]
    : orderStatusMap[type]

  const buttonNameMap: { [key: string]: string } = {
    confirm: confirmButtonText,
    cancel: cancelButtonText,
  }
  reportDialogResultHandle({
    preLimitType: type,
    result: DialogResultStatusType.展示,
    params: {
      bizSource: 'restrictData',
      returnWaybillFlag,
    },
  })
  expDangerReport(type)
  return new Promise((resolve, reject) => {
    showKyDialog({
      zIndex: 1000,
      message: msg,
      title,
      showCancelButton: true,
      cancelButtonText,
      confirmButtonText,
      allowHtml: true,
      closeable: editOrder && !signed,
      beforeClose: async (action) => {
        try {
          const resultAction = action || 'close'
          const buttonName = buttonNameMap[resultAction] || '关闭'
          reportDialogResultHandle({
            preLimitType: type,
            result: dialogStatusMap[resultAction],
            params: {
              bizSource: 'restrictData',
              buttonName,
              returnWaybillFlag,
            },
          })
          clkDangerReport(type, buttonName)
          if (editOrder && signed && action === 'confirm') {
            await cancelOrderAndGoWaybillSearch(waybillNumber, false, signed)
          }
          if (editOrder && !signed && action === 'cancel') {
            await cancelOrderAndGoWaybillSearch(waybillNumber, true, signed)
          }
        } catch (e) {
          console.warn(e)
          return true
        }
        if (!action) {
          reject(false)
          return true
        }
        return true
      },
    })
      .then(() => {
        console.log(resolve)
        if (typeof confirmButtonAction === 'function') {
          return reject(confirmButtonAction())
        }
        reject(data)
      })
      .catch(() => {
        reject(data)
      })
  })
}
//清空副作用
export const clearLimit = (restrictData: RestrictData) => {
  if (!restrictData) {
    closeFenceOverZone()
    return
  }
  const noFenceOverZone = !restrictData[CheckAfterSubmitType.取派管控]?.fenceOverZone
  if (noFenceOverZone) {
    closeFenceOverZone()
  }
}

/**
 * 过滤校验
 * @param {*} checkResultList
 * @returns {*} 新的checkResultList
 */
export const filterCheckResultList = async (checkResultList: CheckDetail[]) => {
  if (Array.isArray(checkResultList)) {
    try {
      const index = checkResultList.findIndex((i) => i.preLimitType === CheckBeforeEnterType.识别粘贴板)
      if (index > -1) {
        const word = await tellClipBoardHasChange()
        if (!word) {
          // 粘贴板没内容就不校验这个字段
          checkResultList.splice(index, 1)
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }
  return checkResultList
}
