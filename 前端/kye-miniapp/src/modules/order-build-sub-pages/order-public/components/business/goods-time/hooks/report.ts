import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const clk_express_goodstime_v1 = () => {
  return {
    eventCode: 'clk_express_goodstime_v1',
    otherParams: () => {
      return {
        button_name: '货好时间',
      }
    },
  }
}

// 下单_寄件页_货好时间_弹窗消失
export const goodsTimeClosedReport = () => {
  umpOtherReport('OTHER', {
    eventCode: 'other_express_goodstime_popup_disappear_v1',
  })
}
