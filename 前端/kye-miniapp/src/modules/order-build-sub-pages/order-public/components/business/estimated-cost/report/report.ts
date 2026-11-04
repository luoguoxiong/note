import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const onClickHeaderReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_cost_detail_back_v1',
    },
    {
      button_name: '返回预估费用总价',
    },
  )
}
export const closeEstimationDetail = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_cost_detail_back_v1',
    },
    {
      button_name: '返回预估费用总价',
    },
  )
}

// 下单_寄件页_契约条款_弹窗消失
export const contractPopupClosedReport = () => {
  umpOtherReport('OTHER', { eventCode: 'other_express_contract_popup_disappear_v1' })
}
