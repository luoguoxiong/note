// 保价曝光
export const exp_express_single_value_v1 = () => {
  return {
    eventCode: 'exp_express_single_value_v1',
  }
}

// 点击保价声明
export const clk_express_single_insurance_statement_v1 = () => {
  window.$umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_single_insurance_statement_v1' },
    {
      button_name: '保价声明',
    }
  )
}

// 点击保价组件
export const clk_express_insured_v1 = (price: string | number) => {
  window.$umpOtherReport('CLK', { eventCode: 'clk_express_insured_v1' }, { value_price: price })
}

// 保价失焦
export const other_express_insured_control_v1 = (price: string | number) => {
  window.$umpOtherReport('OTHER', { eventCode: 'other_express_insured_control_v1' }, { amount: price })
}

export const other_express_single_value_v1 = (price: string | number) => {
  window.$umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_value_v1',
    },
    {
      value_price: price,
      Input_method: '外部输入框',
      request_result: '成功',
      failure_reason: '',
    }
  )
}

// 保价弹窗曝光
export const exp_express_insured_popup_v1 = () => {
  window.$umpOtherReport('EXP', {
    eventCode: 'exp_express_insured_popup_v1',
  })
}

// 用户点击不再提示《保价声明》
export const clk_express_insured_notips_v1 = () => {
  window.$umpOtherReport('CLK', { eventCode: 'clk_express_insured_notips_v1' })
}

// 用户点击保价弹窗按钮: 关闭保价弹窗、不保价、保价
export const clk_express_protectprice_control_v1 = (name: string) => {
  window.$umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_protectprice_control_v1' },
    {
      button_name: name,
    }
  )
}

// 下单_寄件页_物品报价_弹窗消失
export const protectpricePopoupClosedReport = () => {
  window.$umpOtherReport('OTHER', { eventCode: 'other_express_protectprice_popup_disappear_v1' })
}
