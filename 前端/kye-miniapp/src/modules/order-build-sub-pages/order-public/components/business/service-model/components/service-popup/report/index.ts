export const selectServiceReport = (value: string, failMessage?: string) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_service_control_v1',
    },
    {
      button_name: value,
    }
  )
  if (!failMessage) {
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_express_single_severice_float_v1',
      },
      {
        severice_type: value,
        request_result: '成功',
        failure_reason: '',
      }
    )
  } else {
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_express_single_severice_float_v1',
      },
      {
        severice_type: value,
        request_result: '失败',
        failure_reason: failMessage,
      }
    )
  }
}

export const onCloseReport = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_service_control_v1',
    },
    {
      button_name: '关闭',
    }
  )
}
