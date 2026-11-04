export const clk_order_pickuptime_change_button_v1 = (params: { button_name: string }) => {
  const { button_name } = params
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_order_pickuptime_change_button_v1',
    },
    {
      button_name: button_name,
    }
  )
}

export const clk_order_pickuptime_ship_button_v1 = (params: { button_name: string }) => {
  const { button_name } = params
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_order_pickuptime_ship_button_v1',
    },
    {
      button_name: button_name,
    }
  )
}

export const exp_order__pickuptime_change_V1 = () => {
  return {
    eventCode: 'exp_order__pickuptime_change_V1',
    otherParams: () => {
      return {
        button_name: '时间控件',
      }
    },
  }
}

export const clk_order__pickuptime_change_V1 = (params: { button_name: string }) => {
  const { button_name } = params
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_order__pickuptime_change_V1',
    },
    {
      button_name: button_name,
    }
  )
}

export const exp_order__pickuptime_change_confirm_V1 = () => {
  window.$umpOtherReport('EXP', {
    eventCode: 'exp_order__pickuptime_change_confirm_V1',
  })
}

export const clk_order__pickuptime_change_confirm_V1 = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_order__pickuptime_change_confirm_V1',
    },
    {
      button_name: '我知道了',
    }
  )
}
