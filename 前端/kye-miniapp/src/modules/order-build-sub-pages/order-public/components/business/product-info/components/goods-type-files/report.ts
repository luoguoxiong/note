import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
// export const showBatteryLimitReport = (content: string) => {
//   umpOtherReport(
//     'EXP',
//     {
//       eventCode: 'exp_express_batterylimit_v1',
//     },
//     {
//       content,
//     }
//   )
// }

// 文件上传点击
export const clickGoodsTypeUploadReport = (file_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_battery_cert_add_v1',
    },
    {
      file_type,
    },
  )
}

// 删除文件
export const clickDeleteGoodsTypeReport = (file_type: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_battery_cert_delete_v1',
    },
    {
      file_type,
    },
  )
}

// 点击确定提交文件
export const clickSubmitUpload = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_battery_cert_sub_v1',
  })
}

// pv
export const showGoodsTypeUploadPageReport = () => {
  umpOtherReport('OTHER', {
    eventCode: 'other_express_battery_cert_v1',
  })
}
