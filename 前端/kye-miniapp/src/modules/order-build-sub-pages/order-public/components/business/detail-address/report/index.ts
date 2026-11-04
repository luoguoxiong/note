import { Address } from '@order-public-sub-public/constants'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const pasteReport = (value: string, addressType: string) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_paste_v1',
    },
    {
      content: value,
      type: addressType === Address.SENDER ? '寄件详细地址' : '收件详细地址',
    },
  )
}

// 下单_寄件页_寄件信息_详细地址_弹窗消失
export const detailPopupClosedReport = (addressType: string) => {
  umpOtherReport('OTHER', {
    eventCode:
      addressType === Address.SENDER
        ? 'other_express_sender_address_popup_disappear_v1'
        : 'other_express_receiver_address_popup_disappear_v1',
  })
}
