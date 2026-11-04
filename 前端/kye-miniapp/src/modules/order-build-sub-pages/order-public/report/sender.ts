/* eslint-disable prettier/prettier */
import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const window: {
  $umpOtherReport: any
} = {
  $umpOtherReport: () => {},
}

export const triggerSerderOrReceiveCode = (params: { addressType?: string; eventCode: string }) => {
  const { addressType } = params
  let { eventCode } = params

  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    eventCode = eventCode.replace('_receiver_', '_sender_')
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    eventCode = eventCode.replace('_sender_', '_receiver_').replace('_send_', '_receiver_')
  }
  return eventCode
}
// 关闭绑码提示条
export const clickOpenOcrReport = (content?: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_sender_intellect_button_v1  ',
    },
    {
      button_name: '文本识别',
      content: content || '',
    },
  )
}

export const clickOcrClearReport = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_sender_intelligence_clear_v1  ',
    },
    {
      button_name: '清空文本框内容',
      content: '',
    },
  )
}

// 点击识别上报
export const getAiAddrAnalysisReport = (params: any) => {
  try {
    const {
      addressType,
      request_result,
      request_status,
      city,
      companyName,
      county,
      detailAddress,
      extension,
      mobile,
      person,
      province,
      telephone,
      content,
    } = params
    const eventCode = triggerSerderOrReceiveCode({
      addressType,
      eventCode: 'clk_express_single_sender_intelligence_button_v1',
    })
    const reportParams = {
      button_name: '点击识别',
      content: content || '',
      request_status: request_status || '',
      request_result: request_result || '',
      sender_name: person || '',
      sender_IPhone: mobile || '',
      sender_tel: telephone || '',
      sender_address: `${province}${city}${county}${detailAddress}${extension}` || '',
      sender_company: companyName || '',
    }
    console.log('reportParams', reportParams)
    umpOtherReport(
      'CLK',
      {
        eventCode: eventCode,
      },
      reportParams,
    )
  } catch (error) {
    console.log('error', error)
  }
}

// 智能识别帮助
export const clickOrcHelpReport = (addressType?: string) => {
  // const eventCode = triggerSerderOrReceiveCode({
  //   addressType,
  //   eventCode: 'clk_express_single_sender_intelligencen_desc_v1',
  // })
  // umpOtherReport(
  //   'CLK',
  //   {
  //     eventCode: eventCode,
  //   },
  //   {
  //     button_name: '智能识别帮助',
  //   },
  // )
  // if (window.location.hash?.includes('receive')) {
  //   // 寄件
  //   reportPerception('other_express_receiver_intellect_perception_v1')
  // } else {
  //   reportPerception('other_express_sender_intellect_perception_v1')
  // }
}

// 用户点击图片识别
export const clickImgOcrReport = (addressType?: string) => {
  const eventCode = triggerSerderOrReceiveCode({
    addressType,
    eventCode: 'clk_express_single_sender_intelligencen_picture_v1',
  })
  umpOtherReport(
    'CLK',
    {
      eventCode: eventCode,
    },
    {
      button_name: '图片识别',
    },
  )
}

// 删除最近寄件地址
export const clickDeleteRecentAddressReport = (params: { addressType?: string; no?: number; id?: string }) => {
  const { addressType, id, no } = params
  let eventCode = 'clk_express_single_recently_delete_v1'
  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    eventCode = 'clk_express_single_recently_delete_v1'
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    eventCode = ''
  }

  umpOtherReport(
    'CLK',
    {
      eventCode: eventCode,
    },
    {
      no: no || '',
      id: id || '',
    },
  )
}
