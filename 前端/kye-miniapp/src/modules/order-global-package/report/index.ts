import { report_other_event, report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'
import Taro from '@tarojs/taro'

// ==================== 类型定义（原 @order-public/reportUmp/type/types） ====================

export type Indexable<T> = {
  [index: string]: T
}

export interface eventType {
  eventCode: string
  eventId?: number
  regionCode?: string
}

export type ReportTypeEnum = 'CLK' | 'EXP' | 'OTHER'

export enum EventTypeId {
  CLK = 2101,
  EXP = 2201,
  OTHER = 19999,
  PV = 2001,
}

export enum ReportType {
  '点击' = 'CLK',
  '曝光' = 'EXP',
  '自定义' = 'OTHER',
}

// ==================== umpOtherReport 核心函数（原 @order-public/reportUmp/sceneReport/umpotherReport） ====================

/**
 * 通用上报函数 - 支持 CLK / EXP / OTHER 三种类型
 * @param type 上报类型: 'CLK' | 'EXP' | 'OTHER'
 * @param event 事件对象 { eventCode, eventId?, regionCode? }
 * @param params 额外参数
 */
export const umpOtherReport = (type: ReportTypeEnum, event: eventType, params: Indexable<any> = {}) => {
  const { eventCode, eventId = EventTypeId.OTHER, regionCode } = event
  const reportFunMap = {
    CLK: report_CLK_event,
    EXP: report_EXP_event,
    OTHER: report_other_event,
  }
  const reportParams = {
    event_type_id: EventTypeId[type] || eventId,
    regionCode: regionCode,
    ...params,
  }
  const reportFun = reportFunMap[type] || report_other_event
  setTimeout(() => {
    reportFun?.call(null, eventCode, reportParams)
  })
}

// ==================== address-ocr 相关上报函数（原 @order-public/report/sender） ====================

/** 寄件/收件 eventCode 切换 */
const triggerSerderOrReceiveCode = (params: { addressType?: string; eventCode: string }) => {
  const { addressType } = params
  let { eventCode } = params

  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    eventCode = eventCode.replace('_receiver_', '_sender_')
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    eventCode = eventCode.replace('_sender_', '_receiver_').replace('_send_', '_receiver_')
  }
  return eventCode
}

/** 关闭绑码提示条 - 点击上报 */
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

/** 清空文本框内容 - 点击上报 */
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

// ==================== address-block 相关上报函数 ====================

/** 地址详情提示上报（原 address-block/report/detailTipsReport） */
const SENDER_TYPE_LABEL = '寄方信息'

export const detailTipsReport = (type: string, content: string) => {
  const typeName = type === SENDER_TYPE_LABEL ? '寄件地址不完整' : '收件地址不完整'
  umpOtherReport(
    'EXP',
    {
      eventCode: 'exp_express_whole_remind_v1',
    },
    {
      content,
      recognition_type: typeName,
    },
  )
}

// ==================== 地址簿相关上报函数（原 @order-public/components/business/address-book/page/report） ====================

/** 地址簿控件点击 */
export const clk_express_single_choise_v1 = (recognition_type: string, reportType: 'bind' | 'methods' = 'methods') => {
  const type = recognition_type === 'receive.receive' ? '收件' : '寄件'
  if (reportType === 'methods') {
    umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_single_choise_v1',
      },
      { button_name: `${type}地址簿`, recognition_type: type },
    )
  } else {
    umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_single_choise_v1',
        regionCode: 'address',
      },
      { button_name: `${type}地址簿`, recognition_type: type },
    )
  }
}

/** 点击智能识别 - 点击上报 */
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
    umpOtherReport('CLK', { eventCode: eventCode }, reportParams)
  } catch (error) {
    console.log('error', error)
  }
}

/** 智能识别帮助 - 点击上报 */
export const clickOrcHelpReport = (addressType?: string) => {
  const eventCode = triggerSerderOrReceiveCode({
    addressType,
    eventCode: 'clk_express_single_sender_intelligencen_desc_v1',
  })
  umpOtherReport('CLK', { eventCode: eventCode }, { button_name: '智能识别帮助' })
  if (addressType === 'SENDER_PAGE') {
    umpOtherReport('OTHER', { eventCode: 'other_express_sender_intellect_perception_v1' })
  } else {
    umpOtherReport('OTHER', { eventCode: 'other_express_receiver_intellect_perception_v1' })
  }
}

/** 用户点击图片识别 - 点击上报 */
export const clickImgOcrReport = (addressType?: string) => {
  const eventCode = triggerSerderOrReceiveCode({
    addressType,
    eventCode: 'clk_express_single_sender_intelligencen_picture_v1',
  })
  umpOtherReport('CLK', { eventCode: eventCode }, { button_name: '图片识别' })
}

// ==================== selectModel 多候选地址选择弹框上报 ====================

/** 多候选地址选择 - 选择某一项点击上报 */
export const clk_selectModel_choose_address = (recognitionType: string, recognitionMsg: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_fill_Multiple_open_button_v1',
      regionCode: 'sender_box',
    },
    {
      recognition_type: recognitionType,
      recognition_msg: recognitionMsg,
    },
  )
}

// ==================== OCR UI 相关上报（原 ocr/index.vue 注释埋点） ====================

/** OCR 文本框点击 - 点击上报 */
export const clk_ocr_text_click = (addressType?: string) => {
  const eventCode = triggerSerderOrReceiveCode({
    addressType,
    eventCode: 'clk_express_single_send_intellect_button_v1',
  })
  umpOtherReport('CLK', { eventCode })
}

/** OCR 图片识别按钮点击 - 点击上报 */
export const clk_ocr_img_recognition = (addressType?: string) => {
  const eventCode = triggerSerderOrReceiveCode({
    addressType,
    eventCode:
      addressType === 'SENDER_PAGE' || addressType === '10'
        ? 'clk_express_single_send_image_recognition_button_v1'
        : 'clk_express_single_receiver_image_recognition_button_v1',
  })
  umpOtherReport('CLK', { eventCode }, { page_code: getPageCode(addressType) })
}

/** OCR 帮助弹窗 - 点击上报（同 clickOrcHelpReport，统一入口） */
// clickOrcHelpReport 已在上方定义，此处复用

/** OCR 语音识别按钮点击 - 点击上报 */
export const clk_ocr_voice = (addressType?: string) => {
  const page_code = getPageCode(addressType)
  const eventCode =
    addressType === 'SENDER_PAGE' || addressType === '10'
      ? 'clk_express_single_sendr_voice_button_v1'
      : 'clk_express_single_receiver_voice_button_v1'
  umpOtherReport('CLK', { eventCode }, { page_code })
}

/** OCR 语音按钮曝光 - 曝光上报 */
export const exp_ocr_voice_button = (addressType?: string) => {
  const eventCode =
    addressType === 'SENDER_PAGE' || addressType === '10'
      ? 'exp_express_single_send_voice_button_v1'
      : 'exp_express_single_receiver_voice_button_v1'
  umpOtherReport('EXP', { eventCode })
}

// ==================== 语音识别相关上报（原 ocr/utils.ts 注释埋点） ====================

/** 语音识别失败 - 其他上报 */
export const audioFailReport = (errMsg: string) => {
  umpOtherReport('OTHER', { eventCode: 'other_audio_fail_reason' }, { errMsg })
}

/** 语音识别结果日志上传上报（原 updateLog 中注释的 audioReport） */
export const audioReport = (params: {
  source: string
  bizSource: string
  bizData: {
    bizId: string
    waybillNumber: string
    operationSource: number
    addressType: string
    aiRes: string
  }
}) => {
  // 原 @order-public/components/ui/ocr/report 的 audioReport
  // 需要接入具体的上报渠道时在此实现，当前保留签名
  console.log('[report] audioReport', params)
}

/** 语音识别对话框确认结果上报（原 reportDialogResult） */
export const audioDialogResultReport = (params: {
  bizSource: string
  channel: string | undefined
  source: string
  bizData: {
    waybillInfos: { waybillNumber: string }[]
    buttonName: string
  }
}) => {
  // 原 getChannel() + reportDialogResult 逻辑
  // 需要接入具体的上报渠道时在此实现，当前保留签名
  console.log('[report] audioDialogResultReport', params)
}

// ==================== 详细地址弹框相关上报（原 detail-address/index.vue 注释埋点） ====================

/** 详细地址弹窗关闭上报 */
export const detailPopupClosedReport = (addressType: string) => {
  const eventCode =
    addressType.includes('SENDER') || addressType === '10'
      ? 'exp_detail_sender_popup_closed_v1'
      : 'exp_detail_receiver_popup_closed_v1'
  umpOtherReport('EXP', { eventCode })
}

/** 详细地址粘贴文本上报 */
export const pasteReport = (message: string, addressType: string) => {
  const eventCode =
    addressType.includes('SENDER') || addressType === '10'
      ? 'clk_detail_sender_paste_text_v1'
      : 'clk_detail_receiver_paste_text_v1'
  umpOtherReport('CLK', { eventCode }, { message })
}

/** 详细地址寄件页打开曝光上报 */
export const exp_detail_sender_open = () => {
  umpOtherReport('EXP', { eventCode: 'exp_detail_sender_popup_open_v1' })
}

/** 详细地址收件页联想列表有数据曝光上报 */
export const exp_detail_receiver_suggest = () => {
  umpOtherReport('EXP', { eventCode: 'exp_detail_receiver_suggest_data_v1' })
}

// ==================== OCR eventCode 工具函数（原 ui/ocr/report） ====================

/** 寄件/收件 eventCode 切换 - 智能识别按钮 v1 */
export const clk_express_single_sender_intelligence_button_v1 = (addressType: string) => {
  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    return { eventCode: 'clk_express_single_sender_intelligence_button_v1' }
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    return { eventCode: 'clk_express_single_receiver_intelligence_button_v1' }
  }
}

/** 寄件/收件 eventCode 切换 - 发送智能按钮 v1 */
export const clk_express_single_send_intellect_button_v1 = (addressType: string) => {
  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    return { eventCode: 'clk_express_single_send_intellect_button_v1' }
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    return { eventCode: 'clk_express_single_receiver_intellect_button_v1' }
  }
}

/** 寄件/收件 eventCode 切换 - 粘贴并识别按钮 v2 */
export const clk_express_single_sender_intelligence_button_v2 = (addressType: string) => {
  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    return { eventCode: 'clk_express_single_send_paste_and_recognize_button_v1' }
  } else if (addressType === 'RECEIVE_PAGE' || addressType === '20') {
    return { eventCode: 'clk_express_single_receiver_paste_and_recognize_button_v1' }
  }
}

/** 寄件/收件语音曝光 eventCode */
export const exp_express_single_send_voice_button_v1_eventCode = (addressType: string) => {
  if (addressType === 'SENDER_PAGE' || addressType === '10') {
    return 'exp_express_single_send_voice_button_v1'
  }
  return 'exp_express_single_receiver_voice_button_v1'
}

/**
 * 获取当前页面的埋点编码
 * @description 根据当前页面路由返回对应的埋点标识，用于页面级数据上报
 * @returns 匹配的埋点编码，若未命中映射则返回原始页面路径
 */
export const getPageCode = (addressType?: string) => {
  try {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const codeMap = {
      'modules/freight-time/pages/index/index': 'page_freight_query',
      'modules/freight-time/pages/adress/index':
        addressType === 'SENDER_PAGE' || addressType === '10'
          ? 'page_express_single_fill_sender_info_v1'
          : 'page_express_single_fill_receiver_info_v1',
      'modules/order-build-sub-pages/order-public/components/business/address-book/page/index':
        'page_express_single_address_book_v1',
    }
    let pageName = currentPage?.$taroPath?.split('?')[0]
    return codeMap[pageName] || pageName
  } catch (e) {
    console.log(e)
  }
}
