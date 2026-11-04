import { report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'
import { trackClick } from '@public/utils/report/reportPerformance'

export const report_clk_home_tab = () => {
  trackClick()
  report_CLK_event('clk_home_tab', { page_code: 'page_home_head', button_name: '我的' })
}

export const report_clk_home_mine_mine_button = (btnName: string) => {
  report_CLK_event('clk_home_mine_mine_button', {
    region_code: 'top_information',
    page_code: 'page_home_mine',
    button_name: btnName,
  })
}

export const report_clk_home_login_button = (btnName: string) => {
  report_CLK_event('clk_home_login_button', {
    event_name: '主页_我的页_登录相关点击_控件名称_点击',
    region_code: 'top_information',
    region_name: '顶部信息区',
    page_code: 'page_home_mine',
    button_name: btnName,
  })
}

export const report_exp_page_home_mine = () => {
  report_EXP_event('page_home_mine')
}
