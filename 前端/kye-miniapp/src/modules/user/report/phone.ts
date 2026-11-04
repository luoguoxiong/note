import { report_pv_event, report_CLK_event, report_other_event } from '@public/utils/reportUtil'
const pageCode = 'page_mine_seting_bind'

export const reportBindPhoneUv = () => {
  report_pv_event(pageCode)
}

export const reporMineSettingBindClick = (button_name) => {
  report_CLK_event('clk_mine_seting_bind_button', {
    event_code: 'clk_mine_seting_bind_button',
    page_code: pageCode,
    region_code: 'bind_phone_region',
    event_name: '我的_设置页_绑定手机号码页_控件点击_点击' + button_name,
    region_name: '我的_设置页_绑定手机号码页',
    button_name,
  })
}

export const reportMineSettingBindOther = (request_result) => {
  report_other_event('other_mine_seting_bind_sub', {
    page_code: pageCode,
    event_code: 'other_mine_seting_bind_sub',
    region_code: 'bind_phone_region',
    event_name: '扫码登录页_提交',
    region_name: '我的_设置页_绑定手机号码页',
    request_result,
  })
}
