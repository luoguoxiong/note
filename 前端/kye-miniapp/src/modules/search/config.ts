import { Waybill } from '@/layout/pages/home/components/todo-list/types'

export const FILTER_APP_CODE = ['H5_SIGN_IN', 'H5_SIGN_IN_MINI_V1', 'SIGN_IN_MINI_V1', 'MESSAGE_SUBSCRIPTION']


/** 菜单原数据 */
export const MENU_LIST = [
  { label: '去支付', type: 'canNeedPay' },
  { label: '催取', type: 'canTake' },
  { label: '催派', type: 'canExpediting' },
  { label: '修改运单', type: 'canModify' },
  {
    label: '恢复下单',
    type: 'canModify',
    show(waybill: Waybill) {
      return (
        Number(waybill.waybillStatus) === 20 &&
        !waybill.canCancel &&
        [110, 111].includes(Number(waybill.showWatermarkType))
      )
    },
  },
  {
    label: '添加展会',
    type: 'pickupExhibition',
    show: (waybill: Waybill) =>
      Number(waybill.showExhibitionStatus) === 2 && Number(waybill.pickupExtensionNumber) === 0,
  },
  {
    label: '查看展会',
    type: 'pickupExtensionNumber',
    show: (waybill: Waybill) => Number(waybill.showExhibitionStatus) === 2 && Number(waybill.pickupExtensionNumber) > 0,
  },

  { label: '取货评价', type: 'addDeliveryScoreFlag', disabledInAliPay: true },
  { label: '查看取货评价', type: 'viewDeliveryScoreFlag', disabledInAliPay: true },
  { label: '修改取货评价', type: 'modifyDeliveryScoreFlag', disabledInAliPay: true },
  { label: '签收确认', type: 'signReceiptConfirm' },
  { label: '派货评价', type: 'addPickupScoreFlag', disabledInAliPay: true },
  { label: '查看派货评价', type: 'viewPickupScoreFlag', disabledInAliPay: true },
  {
    label: '修改派货评价',
    type: 'modifyPickupScoreFlag',
    disabledInAliPay: true,
  },
  { label: '通知收件人', type: 'notice', disabledInAliPay: true },
  { label: '取消运单', type: 'canCancel' },
  { label: '运单标签', type: 'showLabelFlag' },
  { label: '再来一单', type: 'canAnotherOrder' },
  { label: '打印面单', type: 'canPrint', disabledInAliPay: true },
  { label: '派货照片', type: 'canShowDispatchPhoto' },
]
