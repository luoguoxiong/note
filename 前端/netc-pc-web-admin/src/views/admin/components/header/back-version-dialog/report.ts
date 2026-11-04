/**
 * 回到旧版埋点
 * 来源: netc-pc-web/src/views/layout/components/back-version-dialog/report/index.js
 * 老项目 Vue.prototype.$umpother({...}, 'CLK') → window.$umpOtherReport('CLK', { eventCode }, { ...其余字段 })
 */

/* 主页_客户端顶部返回旧版弹窗_点击 - 取消 */
export const clk_home_version_cancel_btn = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_home_versionpopup_v1',
    },
    {
      event_code: 'clk_home_versionpopup_v1',
      region_code: 'top_navigation',
      page_code: 'client_menu_v1',
      page_name: 'client_menu_v1',
      button_name: '取消',
    }
  )
}

/* 主页_客户端顶部返回旧版弹窗_点击 -确认 */
export const clk_home_version_confirm_btn = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_home_versionpopup_v1',
    },
    {
      event_code: 'clk_home_versionpopup_v1',
      region_code: 'top_navigation',
      page_code: 'client_menu_v1',
      page_name: 'client_menu_v1',
      button_name: '确定',
    }
  )
}
