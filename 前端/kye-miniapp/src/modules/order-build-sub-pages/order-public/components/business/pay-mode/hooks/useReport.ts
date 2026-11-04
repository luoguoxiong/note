export const beforeConfirmReport = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_pay_control_v1',
    },
    {
      button_name: '确定',
    }
  )
}

export const confirmErrorReport = (params: { reason: string; type: string }) => {
  const { reason, type } = params
  window.$umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_payment_sub_v1',
    },
    {
      type_payment: type,
      request_result: '失败',
      failure_reason: reason,
    }
  )
  window.$umpOtherReport(
    'EXP',
    {
      eventCode: 'page_express_single_failure_reason_v1',
    },
    {
      failure_reason: reason,
    }
  )
}
