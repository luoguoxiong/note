import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const clk_express_single_customer_v1 = (params: { name: string; orderCustomer: string }) => {
  const { name, orderCustomer } = params
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_single_customer_v1', regionCode: 'header' },
    {
      button_name: name,
      account_status: orderCustomer ? '已绑码' : '未绑码',
    },
  )
}

export const expBindcustomercode = () => {
  setTimeout(() => {
    umpOtherReport('EXP', { eventCode: 'exp_express_bindcustomercode_v1' })
  }, 100)
}
