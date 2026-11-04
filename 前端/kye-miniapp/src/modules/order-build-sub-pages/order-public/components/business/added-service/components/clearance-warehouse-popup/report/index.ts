import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
export const getMentionType = (showWarehouseOut: boolean, showWarehouseIn: boolean) => {
  if (showWarehouseOut && showWarehouseIn) {
    return '出入仓'
  }

  if (showWarehouseOut) {
    return '出仓'
  }

  if (showWarehouseIn) {
    return '入仓'
  }
  return ''
}
export const clearanceExposureReport = (showWarehouseOut: boolean, showWarehouseIn: boolean) => {
  umpOtherReport(
    'EXP',
    {
      eventCode: 'exp_express_single_declaration_v1',
      regionCode: 'pop',
    },
    {
      mention_type: getMentionType(showWarehouseOut, showWarehouseIn),
    },
  )
}
export const clk_express_single_declaration_increment_v1 = (showWarehouseOut: boolean, showWarehouseIn: boolean) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_single_declaration_increment_v1' },
    {
      mention_type: getMentionType(showWarehouseOut, showWarehouseIn),
    },
  )
}
