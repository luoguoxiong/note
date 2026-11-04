/**
 * 客户编码模块埋点
 * 来源: netc-pc-web/src/utils/reportUtils.js + netc-pc-web/src/views/guide/report.js
 * 新埋点体系: window.$umpOtherReport(type, eventInfo, extraInfo)
 * 事件码(eventCode)与旧基座完全一致
 */
import { uuid } from '@/utils'

type ReportParams = Record<string, any>

/** 通用点击上报 */
export const reportClickEvent = (eventCode: string, params: ReportParams = {}) => {
  window.$umpOtherReport?.('CLK', { eventCode }, { event_code: eventCode, ...params })
}

/** 通用曝光上报 */
export const reportExpEvent = (eventCode: string, params: ReportParams = {}) => {
  window.$umpOtherReport?.('EXP', { eventCode }, { event_code: eventCode, ...params })
}

/** 通用其它类型上报 */
export const reportOtherEvent = (eventCode: string, params: ReportParams = {}) => {
  window.$umpOtherReport?.('OTHER', { eventCode }, { event_code: eventCode, ...params })
}

/** 更换客户编码弹窗曝光 */
export const expCustomerCodeChangeChangeWindow = (params: ReportParams = {}) => {
  reportExpEvent('exp_customer_code_change_change_window', {
    page_name: 'page_center_mine',
    pageCode: 'page_center_mine',
    ...params,
  })
}

/** 添加客户编码弹窗曝光 */
export const expCustomerCodeBindAddpopup = (params: ReportParams = {}) => {
  reportExpEvent('exp_customer_code_bind_addpopup', {
    page_name: 'page_customer_code_bind',
    pageCode: 'page_center_mine',
    ...params,
  })
}

/** 添加客户编码弹窗按钮点击 */
export const clkCustomerCodeBindAddpopupButton = (params: ReportParams = {}) => {
  reportClickEvent('clk_customer_code_bind_addpopup_button', {
    page_name: 'page_center_mine',
    pageCode: 'page_center_mine',
    ...params,
  })
}

/** 更换客户编码按钮点击 */
export const clkCustomerCodeChangeButton = (params: ReportParams = {}) => {
  reportClickEvent('clk_customer_code_change_button', params)
}

/** 忘记密码弹窗按钮点击 */
export const clkCustomerCodeBindPasswordpopupButton = (params: ReportParams = {}) => {
  reportClickEvent('clk_customer_code_bind_passwordpopup_button', params)
}

/** 绑码申请结果弹窗按钮点击 */
export const clkCustomerCodeBindApplyCompanyPopupResultButton = (params: ReportParams = {}) => {
  reportClickEvent('clk_customer_code_bind_apply_company_popup_result_button', params)
}

/** 忘记密码-等待审批弹窗按钮点击 */
export const clkCustomerCodeBindPasswordReviewpopupButton = (params: ReportParams = {}) => {
  reportClickEvent('clk_customer_code_bind_password_reviewpopup_button', params)
}

/** 忘记密码-提交成功弹窗按钮点击 */
export const clkCustomerCodeBindPasswordSubpopupButton = (params: ReportParams = {}) => {
  reportClickEvent('clk_customer_code_bind_password_subpopup_button', params)
}

/** 绑码重复申请确认弹窗按钮点击 */
export const clkCustomerCodeBindTipsPopupButton = (params: ReportParams = {}) => {
  reportClickEvent('clk_customer_code_bind_tips_popup_button', params)
}

/** 绑码请求结果(其它类型) */
export const otherCustomerCodeBindSub = (params: ReportParams = {}) => {
  reportOtherEvent('other_customer_code_bind_sub', params)
}

/** 绑码请求结果(统一入口, 老 views/guide/report report_other_customer_code_bind_sub) */
export const reportCustomerCodeBindSub = (options: { res?: any; memberName?: string; _action?: string } = {}) => {
  const { res = {}, memberName, _action } = options
  const page_type = _action ? `${_action}客户编码` : '新客绑码'
  otherCustomerCodeBindSub({
    page_code: 'page_customer_code_bind',
    page_name: 'page_customer_code_bind',
    user_name: memberName,
    page_type,
    request_result: res?.code === 0 ? '成功' : '失败',
    failure_reason: res?.code === 0 ? '' : res?.msg || '',
  })
}

/** 绑码接口请求结果上报(老 reportUtils.clkCenterCodeBind, 事件码 other_center_code_bind) */
export const clkCenterCodeBind = (params: ReportParams = {}) => {
  reportOtherEvent('other_center_code_bind', params)
}

/** 带唯一 id 的其它类型上报(预留) */
export const reportOtherEventWithId = (eventCode: string, params: ReportParams = {}) => {
  reportOtherEvent(eventCode, { work_id: uuid(), ...params })
}

// ==================== 申请绑定其他公司(关联账号流程) ====================

/** 申请绑定其他公司弹窗曝光(老 window.report.sendExpEvent) */
export const expCustomerCodeBindApplyCompanyPopup = (params: ReportParams = {}) => {
  reportExpEvent('exp_customer_code_bind_apply_company_popup', params)
}

/** 申请绑定其他公司弹窗按钮点击(新增/删除/取消/确定/获取号码等, 老 v-kytrack 指令) */
export const clkCustomerCodeBindApplyCompanyPopupButton = (params: ReportParams = {}) => {
  reportClickEvent('clk_customer_code_bind_apply_company_popup_button', params)
}

/** 申请绑定其他公司提交结果(老 $reportUtils.otherCustomerCodeBindApplyCompanyPopupSub) */
export const otherCustomerCodeBindApplyCompanyPopupSub = (params: ReportParams = {}) => {
  reportOtherEvent('other_customer_code_bind_apply_company_popup_sub', params)
}
