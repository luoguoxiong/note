export const clk_waybillencryption_setup_tips_v1 = (
  waybillSpecialEncryptType: string | boolean,
  waybillNumber: string
) => {
  return !waybillSpecialEncryptType
    ? {
        eventCode: 'clk_waybillencryption_setup_tips_v1',
        regionCode: 'order',
        otherParams: () => {
          return { waybill_order: waybillNumber }
        },
      }
    : {}
}
export const clk_waybillencryption_check_tips_v1 = (waybillNumber: string) => {
  return {
    eventCode: 'clk_waybillencryption_check_tips_v1',
    regionCode: 'order',
    otherParams: () => {
      return { waybill_order: waybillNumber }
    },
  }
}
export const clk_waybillencryption_switch_tips_v1 = (checked: boolean) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_waybillencryption_switch_tips_v1',
      regionCode: 'order',
    },
    {
      waybill_encryption_switch: checked ? '开启' : '关闭',
    }
  )
}

// 下单_寄件页_运单加密_弹窗消失
let flag = false
export const waybillEncryptPopupClosedReport = () => {
  if (flag) return
  window.$umpOtherReport('OTHER', { eventCode: 'other_express_waybillencryption_popup_disappear_v1' })
  flag = true
  setTimeout(() => {
    flag = false
  }, 800)
}
