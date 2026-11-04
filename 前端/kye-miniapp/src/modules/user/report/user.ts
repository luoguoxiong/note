import { report_pv_event, report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'
const userSettingPageCode = 'page_edite_person_v1'
export const reportUserSettingUv = () => {
  report_pv_event(userSettingPageCode)
}
export const report_EXP_page_edite_person_v1 = () => {
  report_EXP_event(userSettingPageCode)
}
export const reportCustomeCodeClick = (button_name) => {
  report_CLK_event('clk_edite_person_button_v1', {
    event_code: 'clk_edite_person_button_v1',
    page_code: userSettingPageCode,
    region_code: 'person_region',
    event_name: '点击_编辑个人资料页_' + button_name,
    region_name: '个人资料',
    button_name,
  })
}
