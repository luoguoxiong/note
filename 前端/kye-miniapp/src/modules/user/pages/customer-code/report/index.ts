/**
 * 客户编码模块埋点上报
 *
 * 参考实名认证模块 (src/modules/user/pages/realname/report/index.ts) 实现
 * 封装 exp/clk/other 三类埋点方法，完整迁移 H5 项目的所有埋点事件1
 */
import { report_EXP_event, report_CLK_event, report_other_event } from '@/public/utils/reportUtil'
import { ref } from 'vue'

export const expressType = ref('')
export const setExpressType = (type: string) => {
  expressType.value = type
}

// ==================== 页面曝光事件 ====================

/**
 * 绑定客户编码页面曝光
 */
export const exp_customer_code_bind_page = (params?: Record<string, any>) => {
  report_EXP_event('page_customer_code_bind', {
    page_name: '绑定客户编码',
    page_type: '绑定客户编码',
    express_type: expressType.value,
    work_id: true,
    ...params,
  })
}

/**
 * 更换客户编码页面曝光
 */
export const exp_customer_code_change_page = (params?: Record<string, any>) => {
  report_EXP_event('page_customer_code_change', {
    page_name: '更换客户编码',
    page_type: '更换客户编码',
    work_id: true,
    ...params,
  })
}

/**
 * 切换客户编码页面曝光
 */
export const exp_customer_code_switch_page = (params?: Record<string, any>) => {
  report_EXP_event('page_customer_code_switch', {
    page_name: '切换客户编码',
    page_type: '切换客户编码',
    work_id: true,
    ...params,
  })
}

/**
 * 解绑确认弹窗曝光
 */
export const exp_customer_code_unbind_confirmpopup = (page_type?: string) => {
  report_EXP_event('exp_customer_code_unbind_confirmpopup', {
    page_name: 'page_customer_code_switch',
    page_type: page_type || '切换客户编码',
    event_type_id: 2202,
    work_id: true,
  })
}

/**
 * 部门切换弹窗曝光
 */
export const exp_change_departments = () => {
  report_EXP_event('exp_change_departments', {
    page_name: '客户编码_绑定客户编码页',
    page_code: 'page_customer_code_bind',
    event_name: '客户编码_切换下单部门弹窗_曝光',
    event_code: 'exp_change_departments',
    event_type_id: 2202,
    work_id: true,
  })
}

// ==================== 按钮点击事件 ====================

/**
 * 通用按钮点击（绑定/更换/切换页面共用）
 *
 * @param buttonName - 按钮名称（确认/保存/忘记密码/申请专属商务/了解更多等）
 * @param params - 额外参数
 */
export const clk_customer_code_button = (buttonName: string, params?: Record<string, any>) => {
  report_CLK_event('clk_customer_code_button', {
    button_name: buttonName,
    page_name: 'page_customer_code_bind',
    work_id: true,
    ...params,
  })
}

/**
 * 解绑按钮点击
 */
export const clk_customer_code_relation_bindpopup_button = (buttonName: string, params?: Record<string, any>) => {
  report_CLK_event('clk_customer_code_relation_bindpopup_button', {
    button_name: buttonName,
    page_name: 'page_customer_code_bind',
    work_id: true,
    ...params,
  })
}

/**
 * 冻结/回收解绑弹窗按钮点击
 *
 * @param buttonName - 按钮名称: "立即解绑" | "取消"
 * @param bindStatus - 绑定状态: "切换" | "绑定"
 * @param pageType - 上报场景: "切换客户编码" | "更换客户编码"
 */
export const clk_customer_code_bindpopup_button = (buttonName: string, bindStatus: string, pageType: string) => {
  report_CLK_event('clk_customer_code_bindpopup_button', {
    button_name: buttonName,
    page_name: 'page_customer_code_switch',
    bind_status: bindStatus,
    page_type: pageType,
    work_id: true,
  })
}

/**
 * 切换客户编码按钮点击
 */
export const clk_customer_code_switch_old_button = (buttonName: string, params?: Record<string, any>) => {
  report_CLK_event('clk_customer_code_switch_old_button', {
    button_name: buttonName,
    page_name: 'page_customer_code_switch',
    work_id: true,
    ...params,
  })
}

/**
 * 部门切换按钮点击
 */
export const clk_change_departments_button = (buttonName: string) => {
  report_CLK_event('clk_change_departments_button', {
    button_name: buttonName,
    page_name: '客户编码_绑定客户编码页',
    page_code: 'page_customer_code_bind',
    event_code: 'clk_change_departments_button',
    event_name: '客户编码_切换下单部门弹窗_控件名称_点击',
    work_id: true,
  })
}

/**
 * 解绑确认弹窗按钮点击
 *
 * @param buttonName - 按钮名称: "解除绑定" | "我再想想"
 * @param pageType - 上报场景: "切换客户编码" | "更换客户编码"
 */
export const clk_customer_code_unbind_confirmpopup_button = (buttonName: string, pageType: string) => {
  report_CLK_event('clk_customer_code_unbind_confirmpopup_button', {
    button_name: buttonName,
    page_type: pageType,
    page_name: 'page_customer_code_switch',
    work_id: true,
  })
}

// ==================== 业务结果事件 ====================

/**
 * 绑定客户编码结果上报
 *
 * @param params - 结果参数
 * @param params.request_result - 请求结果: "成功" | "失败"
 * @param params.customer_no - 客户编码
 * @param params.page_type - 上报场景: "绑定客户编码" | "添加客户编码" | "更换客户编码"
 * @param params.failure_reason - 失败原因（可选）
 */
export const other_customer_code_bind_sub = (params: {
  request_result: string
  customer_no: string
  page_type: string
  failure_reason?: string
}) => {
  report_other_event('other_customer_code_bind_sub', {
    request_result: params.request_result || '成功',
    customer_no: params.customer_no,
    page_type: params.page_type,
    failure_reason: params.failure_reason,
    page_code: 'page_customer_code_bind',
    work_id: true,
  })
}

/**
 * 切换客户编码结果上报
 *
 * @param params - 结果参数
 * @param params.request_result - 请求结果
 * @param params.customer_no - 客户编码
 * @param params.failure_reason - 失败原因
 */
export const other_customer_code_bind_change_sub = (params: {
  request_result: string
  customer_no: string
  failure_reason?: string
}) => {
  report_other_event('other_customer_code_bind_change_sub', {
    request_result: params.request_result || '成功',
    customer_no: params.customer_no,
    failure_reason: params.failure_reason,
    page_code: 'page_customer_code_bind',
    work_id: true,
  })
}

/**
 * 解绑成功结果上报
 */
export const other_customer_code_bindpopup_success = () => {
  report_other_event('other_customer_code_bindpopup_success', {
    page_name: '客户编码_绑定客户编码页',
    page_code: 'page_customer_code_bind',
    event_name: '客户编码_客户编码页_解绑提示弹窗_解绑成功',
    event_code: 'other_customer_code_bindpopup_success',
    event_type_id: 19999,
    request_result: '成功',
    page_type: '绑定客户编码',
  })
}

/**
 * 部门切换成功上报
 */
export const other_change_departments_success = () => {
  report_other_event('other_change_departments_success', {
    page_name: '客户编码_绑定客户编码页',
    page_code: 'page_customer_code_bind',
    event_name: '客户编码_切换下单部门弹窗_切换部门成功',
    event_code: 'other_change_departments_success',
    event_type_id: 19999,
    request_result: '成功',
    page_type: '绑定客户编码',
  })
}

// ==================== 忘记密码页埋点 ====================

/**
 * 忘记密码页页面曝光
 */
export const exp_customer_code_password_page = () => {
  report_EXP_event('page_customer_code_password', {
    page_name: '客户编码_客户编码页_忘记密码页',
    page_code: 'page_customer_code_password',
    event_type_id: 2001,
    work_id: true,
  })
}

/**
 * 忘记密码页按钮点击
 *
 * @param buttonName - 按钮名称: "95324" | "提交"
 */
export const clk_customer_code_password_button = (buttonName: string) => {
  report_CLK_event('clk_customer_code_password_button', {
    page_name: '客户编码_客户编码页_忘记密码页',
    page_code: 'page_customer_code_password',
    button_name: buttonName,
    work_id: true,
  })
}

/**
 * 忘记密码页申请成功上报
 *
 * @param matchStates - 匹配状态: "匹配成功" | "匹配失败"
 */
export const other_customer_code_password_apply_success = (matchStates: string) => {
  report_other_event('other_customer_code_password_apply_success', {
    page_name: '客户编码_客户编码页_忘记密码页',
    request_result: '成功',
    match_states: matchStates,
    express_type: expressType.value,
  })
}

/**
 * 忘记密码结果页按钮点击
 *
 * @param buttonName - 按钮名称
 * @param subStates - 提交状态: "提交成功" | "审核中"
 */
export const clk_customer_code_password_sub_button = (buttonName: string, subStates: string) => {
  report_CLK_event('clk_customer_code_password_sub_button', {
    page_name: '客户编码_客户编码页_忘记密码页',
    page_code: 'page_customer_code_password',
    button_name: buttonName,
    sub_states: subStates,
    work_id: true,
  })
}

/**
 * 忘记密码结果页拨打按钮点击（加载中）
 *
 * @param buttonName - 按钮名称
 */
export const clk_customer_code_password_sub_load_button = (buttonName: string) => {
  report_CLK_event('clk_customer_code_password_sub_load_button', {
    page_name: '客户编码_客户编码页_忘记密码页',
    page_code: 'page_customer_code_password',
    button_name: buttonName,
    work_id: true,
  })
}

/**
 * 联系弹窗曝光
 */
export const clk_customer_code_call_popup = (buttonName: string, expressType: string) => {
  report_CLK_event('clk_customer_code_call_popup', {
    page_name: '客户编码_客户编码页_忘记密码页',
    page_code: 'page_customer_code_password',
    button_name: buttonName,
    express_type: expressType,
    work_id: true,
  })
}

/**
 * 忘记密码页商务弹窗按钮点击
 *
 * @param buttonName - 按钮名称
 */
export const clk_customer_code_password_business_popup_button = (buttonName: string) => {
  report_CLK_event('clk_customer_code_password_business_popup_button', {
    page_name: '客户编码_客户编码页_忘记密码页',
    page_code: 'page_customer_code_password',
    button_name: buttonName,
    work_id: true,
  })
}

/**
 * 申请绑定其他公司页面曝光
 */
export const exp_page_customer_code_bind_other_company = () => {
  report_EXP_event('page_customer_code_bind_other_company', {
    page_name: '客户编码_绑定其他公司申请页',
    page_code: 'page_customer_code_bind_other_company',
    event_type_id: 2001,
    work_id: true,
  })
}

/**
 * 申请绑定其他公司按钮点击
 *
 * @param buttonName - 按钮名称
 */
export const clk_customer_code_bind_other_company_apply_button = (buttonName: string) => {
  report_CLK_event('clk_customer_code_bind_other_company_apply_button', {
    page_name: '客户编码_绑定其他公司申请页',
    page_code: 'page_customer_code_bind_other_company',
    button_name: buttonName,
    work_id: true,
  })
}

/**
 * 申请绑定其他公司结果上报
 *
 * @param requestResult - 请求结果: "成功" | "失败"
 * @param failureReason - 失败原因（可选）
 */
export const other_customer_code_bind_other_company_apply_sub = (requestResult: string, failureReason?: string) => {
  report_other_event('other_customer_code_bind_other_company_apply_sub', {
    page_name: '客户编码_绑定其他公司申请页',
    page_code: 'page_customer_code_bind_other_company',
    request_result: requestResult,
    failure_reason: failureReason,
    work_id: true,
  })
}

/**
 * 绑定其他公司结果页页面曝光
 *
 * @param workId - 工单ID
 * @param currentPath - 当前路径: "申请成功" | "等待审批"
 */
export const exp_page_customer_code_bind_other_company_sub = (workId?: string, currentPath?: string) => {
  report_EXP_event('page_customer_code_bind_other_company_sub', {
    page_name: '客户编码_绑定其他公司结果页',
    page_code: 'page_customer_code_bind_other_company_sub',
    event_type_id: 2001,
    work_id: workId || true,
    current_path: currentPath || '',
  })
}

/**
 * 绑定其他公司结果页按钮点击
 *
 * @param buttonName - 按钮名称
 * @param currentPath - 当前路径: "申请成功" | "等待审批"
 * @param workId - 工单ID（可选）
 */
export const clk_customer_code_bind_other_company_sub_button = (
  buttonName: string,
  currentPath: string,
  workId?: string,
) => {
  report_CLK_event('clk_customer_code_bind_other_company_sub_button', {
    page_name: '客户编码_绑定其他公司结果页',
    page_code: 'page_customer_code_bind_other_company_sub',
    button_name: buttonName,
    current_path: currentPath,
    work_id: workId || true,
  })
}

/**
 * 老用户无推荐弹窗按钮点击
 *
 * @param buttonName - 按钮名称: "继续" | "取消"
 * @param currentPath - 当前路径: "绑定客户编码页" | "更换客户编码页" | "忘记密码页"
 */
export const clk_customer_code_bind_old_norec_popup_end_button = (buttonName: string, currentPath?: string) => {
  report_CLK_event('clk_customer_code_bind_old_norec_popup_end_button', {
    button_name: buttonName,
    page_name: 'page_customer_code_bind',
    current_path: currentPath || '',
    work_id: true,
  })
}
