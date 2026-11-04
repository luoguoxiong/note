import { report_CLK_event, report_EXP_event, report_pv_event, uuid } from '@/public/utils'

const DELIVERY_AREA_PAGE_CODE = 'page_delivery_range'

const TOP_SEARCH_REGION_CODE = 'top_search'
const TOP_SEARCH_REGION_NAME = '顶部查询区'
const SEARCH_RESULTS_REGION_CODE = 'search_results'
const SEARCH_RESULTS_REGION_NAME = '查询结果区'

const SEARCH_CLICK_EVENT_CODE = 'clk_delivery_range_search_v1'
const RESULT_CLICK_EVENT_CODE = 'clk_delivery_range_results_v1'
const LEAD_FORM_EXPOSURE_EVENT_CODE = 'exp_delivery_range_get_service'
const LEAD_FORM_CLICK_EVENT_CODE = 'clk_delivery_range_get_service'
const LEAD_FORM_COMPANY_NAME_CLICK_EVENT_CODE = 'clk_delivery_range_company_name'
const LEAD_FORM_AREA_CLICK_EVENT_CODE = 'clk_delivery_range_third_level_address'
const LEAD_FORM_DETAIL_ADDRESS_CLICK_EVENT_CODE = 'clk_delivery_range_detailed_address'

export const DELIVERY_AREA_BUTTON_NAME = {
  servicePlan: '获取专属服务方案',
  sendOrder: '去寄件',
  contactBusiness: '联系商务',
  receiveBenefit: '领取新客专属福利',
  submit: '提交',
} as const

export const DELIVERY_AREA_ACTIVITY_RESULT = {
  success: '成功',
  fail: '失败',
} as const

export const DELIVERY_AREA_LEAD_FORM_FIELD = {
  companyName: 'companyName',
  area: 'area',
  detailAddress: 'detailAddress',
} as const

type DeliveryAreaActivityResult = (typeof DELIVERY_AREA_ACTIVITY_RESULT)[keyof typeof DELIVERY_AREA_ACTIVITY_RESULT]

type DeliveryAreaLeadFormField = (typeof DELIVERY_AREA_LEAD_FORM_FIELD)[keyof typeof DELIVERY_AREA_LEAD_FORM_FIELD]

const pageParams = {
  page_code: DELIVERY_AREA_PAGE_CODE,
}

const searchResultsRegionParams = {
  ...pageParams,
  region_code: SEARCH_RESULTS_REGION_CODE,
  region_name: SEARCH_RESULTS_REGION_NAME,
}

let currentPageWorkId = ''

const leadFormFieldClickEventMap: Record<DeliveryAreaLeadFormField, { eventCode: string; eventName: string }> = {
  [DELIVERY_AREA_LEAD_FORM_FIELD.companyName]: {
    eventCode: LEAD_FORM_COMPANY_NAME_CLICK_EVENT_CODE,
    eventName: '配送范围_查询结果内开通企业账号弹窗_填写公司名称',
  },
  [DELIVERY_AREA_LEAD_FORM_FIELD.area]: {
    eventCode: LEAD_FORM_AREA_CLICK_EVENT_CODE,
    eventName: '配送范围_查询结果内开通企业账号弹窗_填写省市区',
  },
  [DELIVERY_AREA_LEAD_FORM_FIELD.detailAddress]: {
    eventCode: LEAD_FORM_DETAIL_ADDRESS_CLICK_EVENT_CODE,
    eventName: '配送范围_查询结果内开通企业账号弹窗_填写详细地址',
  },
}

const refreshPageWorkId = () => {
  currentPageWorkId = uuid()
  return currentPageWorkId
}

const getCurrentPageWorkId = () => {
  if (!currentPageWorkId) {
    return refreshPageWorkId()
  }
  return currentPageWorkId
}

const createWorkIdParam = () => ({
  work_id: getCurrentPageWorkId(),
})

export const reportDeliveryAreaPageView = () => {
  const workIdParam = {
    work_id: refreshPageWorkId(),
  }

  report_pv_event(DELIVERY_AREA_PAGE_CODE, {
    event_code: DELIVERY_AREA_PAGE_CODE,
    ...workIdParam,
  })
}

export const reportDeliveryAreaSearchClick = (contentName: string) => {
  report_CLK_event(SEARCH_CLICK_EVENT_CODE, {
    ...pageParams,
    region_code: TOP_SEARCH_REGION_CODE,
    region_name: TOP_SEARCH_REGION_NAME,
    event_name: '移动端配送范围页_查询_点击',
    content_name: contentName,
    ...createWorkIdParam(),
  })
}

export const reportDeliveryAreaResultClick = (buttonName: string) => {
  if (!buttonName) return

  report_CLK_event(RESULT_CLICK_EVENT_CODE, {
    ...searchResultsRegionParams,
    event_name: '移动端配送范围页_查询结果_点击',
    button_name: buttonName,
    ...createWorkIdParam(),
  })
}

export const reportDeliveryAreaLeadFormExposure = () => {
  report_EXP_event(LEAD_FORM_EXPOSURE_EVENT_CODE, {
    ...searchResultsRegionParams,
    event_name: '移动端配送范围_查询结果内开通企业账号弹窗_曝光',
    ...createWorkIdParam(),
  })
}

export const reportDeliveryAreaLeadFormFieldClick = (field: DeliveryAreaLeadFormField) => {
  const eventConfig = leadFormFieldClickEventMap[field]
  if (!eventConfig) return

  report_CLK_event(eventConfig.eventCode, {
    ...searchResultsRegionParams,
    event_name: eventConfig.eventName,
    ...createWorkIdParam(),
  })
}

export const reportDeliveryAreaLeadFormClick = (buttonName: string, activityResult?: DeliveryAreaActivityResult) => {
  if (!buttonName) return

  report_CLK_event(LEAD_FORM_CLICK_EVENT_CODE, {
    ...searchResultsRegionParams,
    event_name: '移动端配送范围_查询结果内开通企业账号弹窗_点击',
    button_name: buttonName,
    ...(activityResult ? { activity_result: activityResult } : {}),
    ...createWorkIdParam(),
  })
}
