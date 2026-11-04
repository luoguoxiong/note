import { report_other_event, report_CLK_event, report_EXP_event, report_pv_event } from '@public/utils/reportUtil'
import Taro from '@tarojs/taro'

export const reportOther = (eventId: string, params?: Record<string, string | number | undefined>) => {
  report_other_event(eventId, { ...params, page_code: getPageCode(params?.recognition_type as string) })
}

export const reportClick = (eventId: string, params?: Record<string, string | number | undefined>) => {
  report_CLK_event(eventId, { ...params, page_code: getPageCode(params?.recognition_type as string) })
}

export const reportExp = (eventId: string, params?: Record<string, string | number | undefined>) => {
  report_EXP_event(eventId, { ...params, page_code: getPageCode(params?.recognition_type as string) })
}

export const reportPv = (pageName: string, params?: Record<string, string | number | undefined>) => {
  report_pv_event(pageName, { ...params, page_code: getPageCode(params?.recognition_type as string) })
}

/**
 * 用户点击寄件信息_寄件_快速寄件页_填写寄件人信息框_点击 - 控件点击
 * @param params
 */
export const clk_express_sender_box_v1 = (params?: Record<string, string | number | undefined>) => {
  reportClick('clk_express_sender_box_v1', params)
}

/**
 * 用户点击寄件/收件地址簿_寄件/收件_寄件地址簿_点击 - 控件点击
 * @param params
 */
export const clk_express_single_choise_v1 = (params?: Record<string, string | number | undefined>) => {
  reportClick('clk_express_single_choise_v1', params)
}

/**
 * 快速寄件页_寄件地址簿页_地址选择 - 自定义事件
 * @param params
 */
export const other_express_single_send_address_book_v1 = (params?: Record<string, string | number | undefined>) => {
  reportOther('other_express_single_send_address_book_v1', params)
}

/**
 * 快速寄件页_填写寄件人信息页_粘贴并识别按钮_点击 - 控件点击
 * @param params
 */
export const clk_express_single_send_paste_and_recognize_button_v1 = (
  params?: Record<string, string | number | undefined>,
) => {
  const { recognition_type = '寄件' } = params || {}
  if (recognition_type === '收件') {
    clk_express_single_receiver_paste_and_recognize_button_v1(params)
    return
  }
  reportClick('clk_express_single_send_paste_and_recognize_button_v1', params)
}

/**
 * 寄件_寄件信息_按钮_点击 - 控件点击
 * @param params
 */
export const clk_express_send_information_control_v1 = (params?: Record<string, string | number | undefined>) => {
  const { recognition_type = '寄件' } = params || {}
  if (recognition_type === '收件') {
    clk_express_receiver_information_control_v1(params)
    return
  }
  reportClick('clk_express_send_information_control_v1', params)
}

/**
 * 寄件_寄件信息_详细地址_确认_点击 - 自定义事件
 * @param params
 */
export const other_express_receiver_address_v1 = (params?: Record<string, string | number | undefined>) => {
  reportOther('other_express_receiver_address_v1', params)
}

/**
 * 寄件/收件_填写寄件人信息页_最近寄件地址_点击 - 控件点击
 * @param params
 */
export const clk_express_single_recently_v1 = (params?: Record<string, string | number | undefined>) => {
  reportClick('clk_express_single_recently_v1', params)
}

/**
 * 用户确认寄件地址_寄件信息_提交_点击 - 自定义事件
 * @param params
 */
export const other_express_single_sender_address_v1 = (params?: Record<string, string | number | undefined>) => {
  const { recognition_type = '寄件' } = params || {}
  if (recognition_type === '收件') {
    other_express_single_received_address_v1(params)
    return
  }
  reportOther('other_express_single_sender_address_v1', params)
}

/**
 * 寄件_收件信息_点击 - 控件点击
 * @param params
 */
export const clk_express_receiver_box_v1 = (params?: Record<string, string | number | undefined>) => {
  reportClick('clk_express_receiver_box_v1', params)
}

/**
 * 用户从地址簿选择_快速寄件页_收件地址簿页_地址选择 - 自定义事件
 * @param params
 */
export const other_express_single_received_address_book_v1 = (params?: Record<string, string | number | undefined>) => {
  reportOther('other_express_single_received_address_book_v1', params)
}

/**
 * 寄件_填写收件人信息页_语音识别_点击 - 控件点击
 * @param params
 */
export const clk_express_single_receiver_voice_button_v1 = (params?: Record<string, string | number | undefined>) => {
  reportClick('clk_express_single_receiver_voice_button_v1', params)
}

/**
 * 快速寄件页_填写收件人信息页_粘贴并识别按钮_点击 - 控件点击
 * @param params
 */
export const clk_express_single_receiver_paste_and_recognize_button_v1 = (
  params?: Record<string, string | number | undefined>,
) => {
  reportClick('clk_express_single_receiver_paste_and_recognize_button_v1', params)
}

/**
 * 寄件_收件信息_按钮_点击 - 控件点击
 * @param params
 */
export const clk_express_receiver_information_control_v1 = (params?: Record<string, string | number | undefined>) => {
  reportClick('clk_express_receiver_information_control_v1', params)
}

/**
 * 用户确认收件地址_寄件_填写收件人信息_收件人信息_提交 - 自定义事件
 * @param params
 */
export const other_express_single_received_address_v1 = (params?: Record<string, string | number | undefined>) => {
  reportOther('other_express_single_received_address_v1', params)
}

/**
 * 运费时效查询 - 自定义事件
 * @param params
 */
export const other_freight_query_v1 = (params: Record<string, string | number | undefined>) => {
  reportOther('other_freight_query_v1', params)
}

/**
 * 运费时效_解锁价格_点击 - 控件点击
 * @param params
 */
export const clk_freight_enterprise_v1 = (params?: Record<string, string | number | undefined>) => {
  reportClick('clk_freight_enterprise_v1', params)
}

/**
 * 获取当前页面的埋点编码
 * @description 根据当前页面路由返回对应的埋点标识，用于页面级数据上报
 * @returns 匹配的埋点编码，若未命中映射则返回原始页面路径
 */
export const getPageCode = (recognition_type?: string) => {
  try {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const codeMap = {
      'modules/freight-time/pages/index/index': 'page_freight_query',
      'modules/freight-time/pages/adress/index': recognition_type === '寄件'
        ? 'page_express_single_fill_sender_info_v1'
        : 'page_express_single_fill_receiver_info_v1',
      'modules/order-build-sub-pages/order-public/components/business/address-book/page/index':
        'page_express_single_address_book_v1',
    }
    const fullTaroPath = currentPage?.$taroPath || ''
    let pageName = fullTaroPath.split('?')[0]
    // 地址填写页共用同一路由，通过 type 参数区分寄件/收件人信息页
    if (pageName === 'modules/freight-time/pages/adress/index') {
      const query = fullTaroPath.split('?')[1] || ''
      const typeMatch = query.match(/(^|&)type=([^&]*)/)
      const type = typeMatch ? decodeURIComponent(typeMatch[2]) : ''
      return type === 'receive'
        ? 'page_express_single_fill_receiver_info_v1'
        : 'page_express_single_fill_sender_info_v1'
    }
    return codeMap[pageName] || pageName
  } catch (e) {
    console.log(e)
  }
}

export const clk_express_goods_now_v1 = () => {
  reportClick('clk_express_goods_now_v1', {
    goods_time: '货好时间',
  })
}

export const other_express_single_goods_times_v1 = () => {
  reportClick('other_express_single_goods_times_v1', {
    goods_time: '货好时间',
  })
}
