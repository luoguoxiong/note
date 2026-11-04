export const confirmReport = (selectTime: string, type: string) => {
  try {
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_goodstime_control_v1',
      },
      {
        type,
        button_name: '确定',
        goods_time: selectTime,
      }
    )
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_express_single_goods_times_v1',
      },
      {
        goods_time: selectTime,
        stop_info: '',
      }
    )
  } catch (error) {
    console.log('货好时间-确认上报Error', error)
  }
}

export const confirmNowReport = () => {
  try {
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_goodstime_control_v1',
      },
      {
        button_name: '现在货好',
      }
    )
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_express_single_goods_times_v1',
      },
      {
        goods_time: '现在货好',
        stop_info: '',
      }
    )
  } catch (error) {
    console.log('货好时间-现在货好上报Error', error)
  }
}

export const onlineConfirmNowReport = (isReturnSend?: boolean) => {
  try {
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_goodstime_control_v1',
      },
      {
        button_name: !isReturnSend ? '现在货好' : '签收立即返',
      }
    )
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_express_single_goods_times_v1',
      },
      {
        goods_time: !isReturnSend ? '现在货好' : '签收立即返',
        stop_info: '',
      }
    )
  } catch (error) {
    console.log('货好时间-现在货好-online上报Error', error)
  }
}
