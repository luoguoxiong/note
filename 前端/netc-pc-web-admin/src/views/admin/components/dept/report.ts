/**
 * 切换部门组件埋点
 * 来源: netc-pc-web/src/utils/reportUtils.js(事件码与旧基座完全一致)
 * 新埋点体系: window.$umpOtherReport(type, eventInfo, extraInfo)
 */

type ReportParams = Record<string, any>

/** 绑定|切换|添加|更换客户编码按钮点击(切换部门图标复用, 事件码同 customer-code/report.ts) */
export const clkCenterCustomerBindButton = (params: ReportParams = {}) => {
  window.$umpOtherReport?.(
    'CLK',
    { eventCode: 'clk_center_customer_bind_button' },
    {
      event_code: 'clk_center_customer_bind_button',
      page_name: 'page_center_mine',
      pageCode: 'page_center_mine',
      ...params,
    }
  )
}

/** 切换部门按钮点击(老 $reportUtils.clkChangeDepartmentsButton) */
export const clkChangeDepartmentsButton = (params: ReportParams = {}) => {
  window.$umpOtherReport?.(
    'CLK',
    { eventCode: 'clk_change_departments_button' },
    {
      event_code: 'clk_change_departments_button',
      page_name: 'page_center_mine',
      pageCode: 'page_center_mine',
      ...params,
    }
  )
}

/** 切换部门弹窗曝光(老 $reportUtils.expChangeDepartments) */
export const expChangeDepartments = (params: ReportParams = {}) => {
  window.$umpOtherReport?.(
    'EXP',
    { eventCode: 'exp_change_departments' },
    {
      event_code: 'exp_change_departments',
      page_name: 'page_center_mine',
      pageCode: 'page_center_mine',
      ...params,
    }
  )
}

/** 切换部门结果上报(老 $reportUtils.otherChangeDepartmentsSuccess) */
export const otherChangeDepartmentsSuccess = (params: ReportParams = {}) => {
  window.$umpOtherReport?.(
    'OTHER',
    { eventCode: 'other_change_departments_success' },
    {
      event_code: 'other_change_departments_success',
      page_name: 'page_center_mine',
      pageCode: 'page_center_mine',
      ...params,
    }
  )
}
