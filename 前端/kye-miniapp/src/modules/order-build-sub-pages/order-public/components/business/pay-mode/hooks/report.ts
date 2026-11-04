let flag = false
// 下单_寄件页_付款方式_弹窗消失
export const payPopupClosedReport = () => {
  if (flag) return
  window.$umpOtherReport('OTHER', {
    eventCode: 'other_express_paymente_popup_disappear_v1',
  })
  flag = true
  setTimeout(() => {
    flag = false
  }, 800)
}
