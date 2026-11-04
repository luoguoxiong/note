import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const clkCustomer = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_single_custom_coding_v1',
  })
}

export const clkCustomerButton = (result: string, name: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_custom_coding_v1',
    },
    {
      code_name: name,
      button_name: result,
    },
  )
}
