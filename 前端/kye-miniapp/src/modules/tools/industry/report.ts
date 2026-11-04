import { report_CLK_event } from '@/public/utils'

const INDUSTRY_SOLUTIONS_PAGE_CODE = 'page_industry_solutions_v1'
// const INDUSTRY_SOLUTIONS_PAGE_NAME = '企业服务'
const INDUSTRY_SOLUTIONS_REGION_CODE = 'industry_solutions_case'
const INDUSTRY_SOLUTIONS_EVENT_CODE = 'clk_homepage_industry_solutions_case_v1'
const INDUSTRY_SOLUTIONS_BUTTON_EVENT_CODE = 'clk_homepage_industry_solutions_button_v1'

export const reportIndustrySolutionsCaseTabClick = (buttonName: string) => {
  if (!buttonName) return

  report_CLK_event(INDUSTRY_SOLUTIONS_EVENT_CODE, {
    event_code: INDUSTRY_SOLUTIONS_EVENT_CODE,
    event_type_id: 2101,
    page_code: INDUSTRY_SOLUTIONS_PAGE_CODE,
    // page_name: INDUSTRY_SOLUTIONS_PAGE_NAME,
    region_code: INDUSTRY_SOLUTIONS_REGION_CODE,
    region_name: '行业解决案例顶部tab',
    event_name: '行业解决方案案例_顶部tab_点击',
    button_name: buttonName,
  })
}

export const reportIndustrySolutionsFooterButtonClick = (buttonName: string) => {
  if (!buttonName) return

  report_CLK_event(INDUSTRY_SOLUTIONS_BUTTON_EVENT_CODE, {
    event_code: INDUSTRY_SOLUTIONS_BUTTON_EVENT_CODE,
    event_type_id: 2101,
    page_code: INDUSTRY_SOLUTIONS_PAGE_CODE,
    region_code: INDUSTRY_SOLUTIONS_REGION_CODE,
    region_name: '行业解决案例底部按钮',
    button_name: buttonName,
  })
}
