export const exp_express_remarks_v1 = () => {
  return {
    eventCode: 'exp_express_remarks_v1',
    otherParams: () => ({ button_name: '运单备注' }),
  }
}

export const clk_express_remarks_v1 = () => {
  return {
    eventCode: 'clk_express_remarks_v1',
    otherParams: () => ({ button_name: '运单备注' }),
  }
}

// 下单_寄件页_运单备注_弹窗消失
export const remarksPopupClosedReport = () => {
  window.$umpOtherReport('OTHER', { eventCode: 'other_express_remarks_popup_disappear_v1' })
}

export const clk_express_remarks_control_v1 = (button_name: string) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_remarks_control_v1',
    },
    {
      button_name: button_name,
    },
  )
}