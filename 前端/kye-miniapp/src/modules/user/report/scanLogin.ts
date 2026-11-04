import { report_pv_event, report_CLK_event, report_EXP_event, report_other_event } from '@public/utils/reportUtil'
const pageCode = 'page_logon_scan_qr_code'

export const reportScanLoginUv = () => {
  report_pv_event(pageCode)
}
export const report_EXP_logon_scan_qr_code = () => {
  report_EXP_event('exp_logon_scan_qr_code')
}
export const reporLoginClick = (button_name) => {
  report_CLK_event('clk_logon_scan_qr_code', {
    event_code: 'clk_logon_scan_qr_code',
    page_code: pageCode,
    region_code: 'scan_login_region',
    event_name: '扫码登录页_登录_点击_' + button_name,
    region_name: '扫码登录页',
    button_name,
  })
}

export const reportLoginOther = (request_result) => {
  report_other_event('other_logon_scan_qr_code_sub', {
    page_code: pageCode,
    event_code: 'other_logon_scan_qr_code_sub',
    region_code: 'scan_login_region',
    event_name: '扫码登录页_提交',
    region_name: '扫码登录页',
    request_result,
  })
}
