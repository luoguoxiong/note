import { report_CLK_event } from '@public/utils/reportUtil'

/* 退出登录-确认按钮 */
export const report_clk_home_login_button = (btnName: string) => {
  report_CLK_event('clk_home_login_button', { page_code: 'page_home_mine', button_name: btnName })
}
