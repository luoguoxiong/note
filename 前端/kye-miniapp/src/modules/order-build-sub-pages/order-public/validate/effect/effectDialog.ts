//弹框副作用
import { CheckDetail } from '@order-public-sub-public/types'
import type { DialogOptions } from '@order-public-sub-public/hooks/useShowToast'
// eslint-disable-next-line no-duplicate-imports
// import { showDialog } from '@order-public-sub-public/hooks/useShowToast'
import { createVNode, render } from 'vue'
import TitleIconDialog from '@order-public-sub-public/components/business/limit-custom/dialog-icon/index.vue'
import BulletinDialog from '@order-public-sub-public/components/business/limit-custom/dialog-bulletin/index.vue'
import NormalDialog from '@order-public-sub-public/components/business/limit-custom/dialog-normal/index.vue'
import AddressSuggestlDialog from '@order-public-sub-public/components/business/limit-custom/address-suggest/index.vue'
import AddressList from '@order-public-sub-public/components/business/address-ocr/components/selectModel/index.vue'
import TellClipBoardComponent from '@order-public-sub-public/components/business/limit-custom/tellClipBoard/index.vue'

import {
  addressSuggest,
  approval,
  bulkCargoConfirm,
  failRetryOrder,
  goodsTime,
  goodsTypeInform,
  insuranceLimitConfirm,
  internalEmployeeConfirm,
  lastInfo,
  mobileScrap,
  noPay,
  normalDialog,
  overArea,
  overWeight,
  payAuthorizeConfirm,
  paymentAccountConfirm,
  pureBatteryLimit,
  phoneConfirm,
  realName,
  receiveSendAddressSame,
  repeatWaybillConfirm,
  switchConfig,
  switchingConfig,
  tellClipBoard,
  truthfullyDeclareConfirm,
} from '@order-public-sub-public/validate/access'
import { CheckBeforeEnterType } from '@order-public-sub-public/constants'
import { effectMasker } from '@order-public-sub-public/validate/effect/effectPopup'
import { showDialog } from '@ky-miniui-lib/ky-miniui-lib'
import { getDialogRootClass } from '@order-public-sub-public/validate/pageConfig'
import { FuncDialogProps } from '@order-public-sub-public/components/business/limit-custom/dialog-icon/types'
import { setDefaultScrollTop } from '@order-public-sub-root-pages//order-single/hooks/useScrollTop'

//有遮罩，需要第一次就弹的
const MASKER_IMMEDIATE = [CheckBeforeEnterType.活动提醒]

interface newDialogOptions extends DialogOptions {
  titleIcon?: string
  closeable?: boolean
  storageFlag?: boolean
  zIndex?: number
  showCustomConcat?: boolean
  showCustomConcatCallBack?: () => void
  extraDataValue?: any
}

//生成弹框
export const showKyDialog = (dialogOption: newDialogOptions) => {
  if (!dialogOption || typeof dialogOption !== 'object') {
    throw new Error('showDialog need option')
  }
  //处理富文本message，不更新的的问题
  const { titleIcon, showCustomConcat, title, storageFlag, className } = dialogOption || {}
  console.log('dialogOption', titleIcon, dialogOption)
  setDefaultScrollTop()
  if (titleIcon) {
    return showCustomeDialog({
      parentClassName: getDialogRootClass() || 'dialog_root_order',
      customTitle: title,
      storageFlag: !!storageFlag,
      className: 'ky-title-bg',
      ...dialogOption,
    })
  }
  if (className) {
    return showCustomeDialog({
      parentClassName: getDialogRootClass() || 'dialog_root_order',
      ...dialogOption,
    })
  }
  delete dialogOption.titleIcon
  const options: DialogOptions = dialogOption
  return showDialog({
    parentClassName: getDialogRootClass() || 'dialog_root_order',
    className,
    closeable: false,
    ...options,
  } as DialogOptions)
}

//有图标标题的弹框
export const showCustomeDialog = (options: FuncDialogProps) => {
  // debugger
  const { parentClassName = '', confirm = () => {}, cancle = () => {}, className, extraDataValue } = options
  const page = document.getElementsByClassName(parentClassName)?.[0] || document.body
  const typeComponent = {
    'ky-title-bg': TitleIconDialog,
    'ky-bulletin-dialog': BulletinDialog,
    'ky-normal-dialog': NormalDialog,
    'ky-suggest-dialog': AddressSuggestlDialog,
    'ky-address-multiple-dialog': AddressList,
    'ky-clipboard-dialog': TellClipBoardComponent,
  }
  const comp = typeComponent[className]
  if (!comp) {
    return Promise.resolve(true)
  }
  return new Promise((resolve, reject) => {
    const vnode = createVNode(comp, {
      ...options,
      onConfirm: () => {
        confirm()
        render(null, page)
        resolve(true)
      },
      onCancel: () => {
        cancle()
        render(null, page)
        reject('cancel')
      },
      show: true,
      ...extraDataValue,
    })

    render(vnode, page)
  })
}

//弹框内容分发
// eslint-disable-next-line max-lines-per-function
export const dialogHandOut = async (option: CheckDetail) => {
  const { preLimitType, mask = true, blockedFlag } = option
  // eslint-disable-next-line complexity
  const limitTypeFun = async (preLimitType: CheckBeforeEnterType) => {
    switch (preLimitType) {
      case CheckBeforeEnterType.跳转整车:
        await overWeight(option)
        break
      case CheckBeforeEnterType.地址推荐:
        await addressSuggest(option)
        break
      case CheckBeforeEnterType.复用上次信息:
        await lastInfo(option)
        break
      case CheckBeforeEnterType.账号准入:
        await mobileScrap(option)
        break
      case CheckBeforeEnterType.实名认证:
        await realName(option)
        break
      case CheckBeforeEnterType.未支付:
        await noPay(option)
        break
      case CheckBeforeEnterType.未绑码:
        console.log('未绑码')
        break
      case CheckBeforeEnterType.识别粘贴板:
        await tellClipBoard(option)
        break
      case CheckBeforeEnterType.切换配置:
        await switchConfig(option)
        break
      case CheckBeforeEnterType.下单权限:
        await approval(option)
        break
      case CheckBeforeEnterType.货好时间:
        await goodsTime(option)
        break
      case CheckBeforeEnterType.付款授权:
        await payAuthorizeConfirm(option)
        break
      case CheckBeforeEnterType.寄收地址一致:
        await receiveSendAddressSame(option)
        break
      case CheckBeforeEnterType.收件超区:
        await overArea(option)
        break
      case CheckBeforeEnterType.付款方式:
        await overArea(option)
        break
      case CheckBeforeEnterType.切换配置不跳转:
        await switchingConfig()
        break
      case CheckBeforeEnterType.大票货:
        await bulkCargoConfirm(option)
        break
      case CheckBeforeEnterType.下单失败:
        await failRetryOrder(option)
        break
      case CheckBeforeEnterType.收件地址已下单:
        await repeatWaybillConfirm(option)
        break
      case CheckBeforeEnterType.托寄物告知:
        await goodsTypeInform(option)
        break
      case CheckBeforeEnterType.危险品如实申报:
        await truthfullyDeclareConfirm(option)
        break
      case CheckBeforeEnterType.禁止内部员工下单:
        await internalEmployeeConfirm(option)
        break
      case CheckBeforeEnterType.付款方式校验:
        await paymentAccountConfirm(option)
        break
      case CheckBeforeEnterType.保费校验:
        await insuranceLimitConfirm(option)
        break
      case CheckBeforeEnterType.电池货:
        await pureBatteryLimit(option)
        break
      case CheckBeforeEnterType.号码保护:
        await phoneConfirm(option)
        break
      default:
        await normalDialog(option)
    }
  }
  if (mask) {
    return Promise.resolve(
      effectMasker({
        blockedFlag,
        immediate: MASKER_IMMEDIATE.includes(preLimitType),
        callback: async () => {
          await limitTypeFun(preLimitType)
        },
        topSelector: ['BindCustomerBar', 'OrderCustomer', 'Banner'],
      }),
    )
  }
  await limitTypeFun(preLimitType)
}
