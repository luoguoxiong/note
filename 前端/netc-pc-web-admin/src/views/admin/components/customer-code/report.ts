/**
 * 添加/切换客户编码按钮埋点
 * 来源: netc-pc-web/src/utils/reportUtils.js(事件码与旧基座完全一致)
 * 新埋点体系: window.$umpOtherReport(type, eventInfo, extraInfo)
 */

type ReportParams = Record<string, any>

/** 点击 id(对齐老基座 utils/report.js setClickId/getClickId: 每次点击上报前刷新) */
let clickId = ''
export const setClickId = () => {
  clickId = `${Math.floor(Math.random() * 10000)}_${new Date().getTime()}`
}
export const getClickId = () => {
  return clickId
}

/** 绑定|切换|添加|更换客户编码按钮点击(老 $reportUtils.clkCenterCustomerBindButton) */
export const clkCenterCustomerBindButton = (params: ReportParams = {}) => {
  // 对齐老 sendClickEvent: 点击上报前刷新 clickId(跳转绑码页携带为 pre_click_id)
  setClickId()
  window.$umpOtherReport?.(
    'CLK',
    { eventCode: 'clk_center_customer_bind_button' },
    {
      event_code: 'clk_center_customer_bind_button',
      page_name: 'page_center_mine',
      pageCode: 'page_center_mine',
      ...params,
    }
  )
}

/** 切换客户编码弹窗按钮点击(老 $reportUtils.clkCenterChangepopupButton) */
export const clkCenterChangepopupButton = (params: ReportParams = {}) => {
  setClickId()
  window.$umpOtherReport?.(
    'CLK',
    { eventCode: 'clk_center_changepopup_button' },
    { event_code: 'clk_center_changepopup_button', ...params }
  )
}

/** 切换客户编码弹窗曝光(老 $reportUtils.expChangeCustomerCodeWindow) */
export const expChangeCustomerCodeWindow = (params: ReportParams = {}) => {
  window.$umpOtherReport?.(
    'EXP',
    { eventCode: 'exp_change_customer_code_window' },
    {
      event_code: 'exp_change_customer_code_window',
      page_name: 'page_center_mine',
      pageCode: 'page_center_mine',
      ...params,
    }
  )
}
