export interface IndustryFooterBarStateRes {
  isLogin: boolean
  isOlderCustomer: boolean
  hasLeadCapture: boolean
  hasLeadCaptureActivity: boolean
  hasCompanyWx: boolean
}

export type IndustryFooterBarMockScene =
  | 'not_login'
  | 'new_with_lead_has_wx'
  | 'new_with_lead_no_wx'
  | 'new_no_lead'
  | 'older_customer'
