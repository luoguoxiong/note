import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const toShareToOrderReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_page_express_single_send_invite_inform_v1',
    },
    {
      button_name: '通知寄件人下单',
    },
  )
}

export const toViewRouteReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_page_express_single_send_invite_inform_v1',
    },
    {
      button_name: '查看运单',
    },
  )
}

export const toViewRouteExpReport = () => {
  umpOtherReport(
    'EXP',
    {
      eventCode: 'exp_page_express_single_send_invite_inform_v1',
    },
    {},
  )
}

export const toUrgeFillReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_page_express_singe_invite_inputinfo',
    },
    {
      button_name: '催他下单',
    },
  )
}

export const toOrderReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_page_express_singe_invite_delivery',
    },
    {
      button_name: '去下单',
    },
  )
}
