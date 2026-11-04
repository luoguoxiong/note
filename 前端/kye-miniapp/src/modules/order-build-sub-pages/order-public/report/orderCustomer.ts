// 用户点击去绑码
export const clickBindCodeReport = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_bindcustomercode_v1  ',
    },
    {
      button_name: '去绑码',
    }
  )
}

// 关闭绑码提示条
export const clickCloseBarReport = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_bindcustomercode_off_v1  ',
    },
    {
      button_name: '关闭绑码提示条',
    }
  )
}
