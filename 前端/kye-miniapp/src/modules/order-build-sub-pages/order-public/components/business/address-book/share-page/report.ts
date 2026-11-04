import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const toSubmitReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_fill_invite_submit_v1',
    },
    {
      button_name: '提交信息',
    },
  )
}
