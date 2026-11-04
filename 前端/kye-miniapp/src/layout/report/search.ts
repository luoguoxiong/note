import { report_CLK_event } from '@public/utils/reportUtil'

export const report_clk_home_tab = () => {
  report_CLK_event('clk_home_tab', { page_code: 'page_home_head', button_name: '查件' })
}
