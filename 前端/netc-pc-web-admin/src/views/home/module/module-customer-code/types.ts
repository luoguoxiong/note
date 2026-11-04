/**
 * 客户编码模块类型定义
 * 来源: customer-code/components/*.vue (老 JS 组件内联结构)
 */
import type { CustomerInfo } from '@/apis/user/types'

/** 可绑定公司列表项（web.uamAppUser.getUserBindableCompanyList） */
export type CustomerListItem = CustomerInfo & {
  /** 列表透传: customerShortName 默认取 customerName */
  customerShortName?: string
  [key: string]: any
}

/** 可绑定公司列表响应（老 store.setCustomerListAction 数据源） */
export interface BindableCompanyList {
  /** 客户编码列表类型，见 CompanyInfoType */
  type: number
  companyInfoList: CustomerListItem[]
}

/** 忘记密码-申请绑码响应数据（web.uam.apply.applyBindCustomerFromClient） */
export interface ApplyBindCustomerData {
  customerCode: string
  customerName?: string
  customerShortName?: string
  appliedFlag?: boolean
  existedApplyFlag?: boolean
  /** 审批状态: 0-提交成功（无需审批），非 0-等待审批 */
  applyStatus?: number
  appliedInfoList?: AppliedInfo[]
  role?: string
  name?: string
  needRealName?: boolean
  [key: string]: any
}

/** 已申请绑定公司信息 */
export interface AppliedInfo {
  customerCode: string
  customerShortName: string
  [key: string]: any
}

/** 虚拟号响应数据（web.uam.apply.getVirtualNum 等） */
export interface VirtualNumData {
  virtualNum: string
  needRealName?: boolean
  [key: string]: any
}

/** 忘记密码流程弹窗间传递的数据 */
export interface ApprovalFlowData {
  source?: string
  role?: string
  name?: string
  customerCode?: string
  customerName?: string
  applyStatus?: number
  virtualNum?: string
  trackName?: string
  changeTrackName?: string
  needRealName?: boolean
  [key: string]: any
}

/** 风控校验弹窗入参（web.uam.riskVerify.getCheckInfo） */
export interface RiskVerifyPayload {
  ruleId?: string | number
  strategyCode?: string | number
  [key: string]: any
}

/** 风控校验结果 */
export interface RiskVerifyResult {
  safeVerifyId: string
}

/** 绑定客户编码结果（useCustomerCode.bindCustomerCode 返回值） */
export interface BindCustomerCodeResult {
  success?: boolean
  flowVisible?: boolean
  contactPhone?: boolean
  companyList?: CustomerListItem[]
  msg?: string
  [key: string]: any
}
