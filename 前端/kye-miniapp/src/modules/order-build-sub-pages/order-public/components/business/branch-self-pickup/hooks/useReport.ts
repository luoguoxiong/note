import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const other_express_self_pickup_control_v1 = (params: {
  regionCode?: string
  request_result: string
  failure_reason: string
}) => {
  const { request_result, failure_reason, regionCode } = params
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_self_pickup_control_v1',
      regionCode: regionCode,
    },
    {
      request_result: request_result,
      failure_reason: failure_reason,
    },
  )
}

export const clk_express_self_pickup_control_v1 = (params: { regionCode?: string; button_name: string }) => {
  const { button_name, regionCode } = params
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_self_pickup_control_v1',
      regionCode: regionCode,
    },
    {
      button_name: button_name,
    },
  )
}
