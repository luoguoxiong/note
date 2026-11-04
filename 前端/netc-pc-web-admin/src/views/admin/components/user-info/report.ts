/**
 * 用户信息组件埋点
 * 来源: netc-pc-web/src/utils/reportUtils.js(事件码与旧基座完全一致)
 * 新埋点体系: window.$umpOtherReport(type, eventInfo, extraInfo)
 */

type ReportParams = Record<string, any>

/** 点击 id(对齐老基座 utils/report.js setClickId/getClickId: 每次点击上报前刷新) */
let clickId = ''
export const setClickId = () => {
  clickId = `${Math.floor(Math.random() * 10000)}_${new Date().getTime()}`
}
export const getClickId = () => {
  return clickId
}

/** 个人信息 popover 按钮点击(老 $reportUtils.clkCenterLoginpopupButton) */
export const clkCenterLoginpopupButton = (params: ReportParams = {}) => {
  // 对齐老 sendClickEvent: 点击上报前刷新 clickId(跳转个人中心携带为 pre_click_id)
  setClickId()
  window.$umpOtherReport?.(
    'CLK',
    { eventCode: 'clk_center_loginpopup_button' },
    { event_code: 'clk_center_loginpopup_button', ...params }
  )
}

// ==================== 切换登录手机号埋点 ====================
// (来源: 老组件内直接 window.report.sendClickEvent/sendOtherEvent + $reportUtils, 事件码不变)

/** 切换登录手机号弹窗按钮点击(老 clk_center_mine_switch_phone_pop_up_v1) */
export const clkCenterMineSwitchPhonePopUpV1 = (params: ReportParams = {}) => {
  setClickId()
  window.$umpOtherReport?.(
    'CLK',
    { eventCode: 'clk_center_mine_switch_phone_pop_up_v1' },
    {
      event_code: 'clk_center_mine_switch_phone_pop_up_v1',
      page_name: 'page_center_mine_v1',
      region_code: 'switch_phone',
      ...params,
    }
  )
}

/** 添加登录手机号弹窗曝光(老 $reportUtils.expCenterMineAddPhonePopUpV1) */
export const expCenterMineAddPhonePopUpV1 = (params: ReportParams = {}) => {
  window.$umpOtherReport?.(
    'EXP',
    { eventCode: 'exp_center_mine_add_phone_pop_up_v1' },
    { event_code: 'exp_center_mine_add_phone_pop_up_v1', ...params }
  )
}

/** 添加登录手机号弹窗按钮点击(老 $reportUtils.clkCenterMineAddPhonePopUpV1) */
export const clkCenterMineAddPhonePopUpV1 = (params: ReportParams = {}) => {
  setClickId()
  window.$umpOtherReport?.(
    'CLK',
    { eventCode: 'clk_center_mine_add_phone_pop_up_v1' },
    { event_code: 'clk_center_mine_add_phone_pop_up_v1', ...params }
  )
}

/** 切换/添加手机号结果上报(老 other_center_mine_Switch_phone_add_v1) */
export const otherCenterMineSwitchPhoneAddV1 = (params: ReportParams = {}) => {
  window.$umpOtherReport?.(
    'OTHER',
    { eventCode: 'other_center_mine_Switch_phone_add_v1' },
    {
      event_code: 'other_center_mine_Switch_phone_add_v1',
      region_code: 'switch_phone',
      page_name: 'page_center_mine_Switch_phone_v1',
      login_source: '跨越速运客户端',
      page_type: '弹窗',
      ...params,
    }
  )
}

/** 切换手机号弹窗曝光(老 avatar watch: exp_center_mine_switch_phone_pop_up_v1) */
export const expCenterMineSwitchPhonePopUpV1 = (params: ReportParams = {}) => {
  window.$umpOtherReport?.(
    'EXP',
    { eventCode: 'exp_center_mine_switch_phone_pop_up_v1' },
    {
      event_code: 'exp_center_mine_switch_phone_pop_up_v1',
      page_name: 'page_center_mine_v1',
      region_code: 'switch_phone',
      ...params,
    }
  )
}
