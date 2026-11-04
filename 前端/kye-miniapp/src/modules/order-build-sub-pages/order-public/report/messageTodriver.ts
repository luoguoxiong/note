import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const pageCodeExtra = (pageCode?: string) => (pageCode ? { page_code: pageCode } : {})

// 给司机捎句话点击文本域上报
export const clickTextAreaReport = (label: string, pageCode?: string) => {
  const eventCodeMap = {
    给司机捎句话: 'clk_express_driver_text_v1',
    运单备注: 'clk_express_remarks_text_v1',
  }
  umpOtherReport(
    'CLK',
    {
      eventCode: eventCodeMap[label as keyof typeof eventCodeMap],
    },
    {
      button_name: label,
      ...pageCodeExtra(pageCode),
    },
  )
}

// 给司机捎句话失去焦点上报
export const blurTextAreaReport = (label: string, value: string, pageCode?: string) => {
  const eventCodeMap = {
    给司机捎句话: 'other_express_driver_text_v1',
    运单备注: 'other_express_remarks_text_v1',
  }
  umpOtherReport(
    'OTHER',
    {
      eventCode: eventCodeMap[label as keyof typeof eventCodeMap],
    },
    {
      remark_msg: value,
      ...pageCodeExtra(pageCode),
    },
  )
}

// 关闭给司机捎句话弹窗上报
export const closeLogReport = (label: string, pageCode?: string) => {
  const eventCodeMap = {
    给司机捎句话: 'clk_express_driver_off_v1',
  }
  umpOtherReport(
    'CLK',
    {
      eventCode: eventCodeMap[label as keyof typeof eventCodeMap],
    },
    {
      button_name: label,
      ...pageCodeExtra(pageCode),
    },
  )
}

export const clearReport = (label: string, pageCode?: string) => {
  const eventCodeMap = {
    运单备注: 'clk_express_remarks_clear_v1',
    给司机捎句话: 'clk_express_driver_clear_v1',
  }
  umpOtherReport(
    'CLK',
    {
      eventCode: eventCodeMap[label as keyof typeof eventCodeMap],
    },
    {
      button_name: '清空',
      ...pageCodeExtra(pageCode),
    },
  )
}
