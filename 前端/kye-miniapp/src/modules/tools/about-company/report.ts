import { report_CLK_event, report_EXP_event } from '@/public/utils'

const ABOUT_COMPANY_PAGE_CODE = 'page_brand_service_v1'
// const ABOUT_COMPANY_PAGE_NAME = '企业服务'
const ABOUT_COMPANY_TOP_REGION_CODE = 'top_service'
const ABOUT_COMPANY_BOTTOM_REGION_CODE = 'bottom_service'
const ABOUT_COMPANY_EXPOSURE_EVENT_CODE = 'exp_homepage_brand_service_v1'
const ABOUT_COMPANY_TAB_EVENT_CODE = 'clk_homepage_brand_service_v1'
const ABOUT_COMPANY_BUTTON_EVENT_CODE = 'clk_homepage_button_service_v1'

export const reportAboutCompanyPageExposure = () => {
  report_EXP_event(ABOUT_COMPANY_EXPOSURE_EVENT_CODE, {
    event_code: ABOUT_COMPANY_EXPOSURE_EVENT_CODE,
    event_type_id: 2201,
    page_code: ABOUT_COMPANY_PAGE_CODE,
    // page_name: ABOUT_COMPANY_PAGE_NAME,
    region_code: ABOUT_COMPANY_TOP_REGION_CODE,
    region_name: '公司简介tab',
    event_name: '企业服务二级页面_曝光',
  })
}

export const reportAboutCompanyTabClick = (buttonName: string) => {
  if (!buttonName) return

  report_CLK_event(ABOUT_COMPANY_TAB_EVENT_CODE, {
    event_code: ABOUT_COMPANY_TAB_EVENT_CODE,
    event_type_id: 2101,
    page_code: ABOUT_COMPANY_PAGE_CODE,
    region_code: ABOUT_COMPANY_TOP_REGION_CODE,
    region_name: '公司简介tab',
    button_name: buttonName,
  })
}

export const reportAboutCompanyFooterButtonClick = (buttonName: string) => {
  if (!buttonName) return

  report_CLK_event(ABOUT_COMPANY_BUTTON_EVENT_CODE, {
    event_code: ABOUT_COMPANY_BUTTON_EVENT_CODE,
    event_type_id: 2101,
    page_code: ABOUT_COMPANY_PAGE_CODE,
    region_code: ABOUT_COMPANY_BOTTOM_REGION_CODE,
    region_name: '公司简介底部按钮',
    button_name: buttonName,
  })
}
