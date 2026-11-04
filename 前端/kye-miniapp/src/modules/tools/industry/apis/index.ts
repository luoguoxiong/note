import type { IndustryFooterBarMockScene, IndustryFooterBarStateRes } from './types'

const MOCK_SCENE: IndustryFooterBarMockScene = 'new_no_lead'

const FOOTER_BAR_MOCK_MAP: Record<IndustryFooterBarMockScene, IndustryFooterBarStateRes> = {
  // 未登录：展示去登录
  not_login: {
    isLogin: false,
    isOlderCustomer: false,
    hasLeadCapture: false,
    hasLeadCaptureActivity: false,
    hasCompanyWx: false,
  },
  // 新客已留资：展示联系商务 + 添加企微
  new_with_lead_has_wx: {
    isLogin: true,
    isOlderCustomer: false,
    hasLeadCapture: true,
    hasLeadCaptureActivity: true,
    hasCompanyWx: true,
  },
  // 新客已留资，无企微：仅展示联系商务
  new_with_lead_no_wx: {
    isLogin: true,
    isOlderCustomer: false,
    hasLeadCapture: true,
    hasLeadCaptureActivity: true,
    hasCompanyWx: false,
  },
  // 新客未留资：展示获取专属服务方案
  new_no_lead: {
    isLogin: true,
    isOlderCustomer: false,
    hasLeadCapture: false,
    hasLeadCaptureActivity: true,
    hasCompanyWx: false,
  },
  // 老客：不展示
  older_customer: {
    isLogin: true,
    isOlderCustomer: true,
    hasLeadCapture: true,
    hasLeadCaptureActivity: true,
    hasCompanyWx: true,
  },
}

export const getIndustryFooterBarState = (): IndustryFooterBarStateRes => {
  // 当前固定走 mock 数据，切换场景只需修改 MOCK_SCENE
  return FOOTER_BAR_MOCK_MAP[MOCK_SCENE]
}
