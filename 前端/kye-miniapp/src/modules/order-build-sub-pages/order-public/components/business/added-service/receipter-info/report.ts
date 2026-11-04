import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const receiptReturnButtonCLK = (button_name: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_receipt_return_button_v1',
    },
    {
      button_name,
    },
  )
}
