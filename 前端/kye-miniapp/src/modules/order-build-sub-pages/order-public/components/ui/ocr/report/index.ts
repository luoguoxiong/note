import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const clk_express_single_sender_intelligence_button_v1 = (addressType: string) => {
  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    return {
      eventCode: 'clk_express_single_sender_intelligence_button_v1',
    }
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    return {
      eventCode: 'clk_express_single_receiver_intelligence_button_v1',
    }
  }
}

export const clk_express_single_send_intellect_button_v1 = (addressType: string) => {
  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    return {
      eventCode: 'clk_express_single_send_intellect_button_v1',
    }
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    return {
      eventCode: 'clk_express_single_receiver_intellect_button_v1',
    }
  }
}

export const clk_express_single_sender_intelligence_button_v2 = (addressType: string) => {
  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    return {
      eventCode: 'clk_express_single_send_paste_and_recognize_button_v1',
    }
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    return {
      eventCode: 'clk_express_single_receiver_paste_and_recognize_button_v1',
    }
  }
}

export const audioFailReport = (errMsg: string) => {
  umpOtherReport(
    'OTHER',
    { eventCode: 'other_audio_fail_reason' },
    {
      errMsg: errMsg,
    },
  )
}
