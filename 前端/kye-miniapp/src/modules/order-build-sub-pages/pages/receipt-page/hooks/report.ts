import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
// 关闭绑码提示条
export const receiptButtonReport = (button_name: string) => {
  console.log('receiptButtonReport', button_name)
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_receipt_button_v1',
    },
    {
      button_name,
    },
  )
}

// 提示拦截弹窗出现
export const showTipPopReport = (page_from: string) => {
  umpOtherReport(
    'EXP',
    {
      eventCode: 'exp_express_receipt_unsaved_button_v1',
    },
    {
      page_from,
    },
  )
}

export const receiptPageExposureReport = () => {
  umpOtherReport('EXP', {
    eventCode: 'other_express_receipt_v1',
  })
}

export const receiptPageBack = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_receipt_back_v1' }, { button_name: '返回' })
}
