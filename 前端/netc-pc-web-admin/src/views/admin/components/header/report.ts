/**
 * header 埋点
 * 来源: netc-pc-web/src/views/layout/report/index.js
 * 新埋点体系: window.$umpOtherReport(type, eventInfo, extraInfo)
 */
import { uuid } from '@/utils'

/** 顶栏导航点击埋点 */
export const reportHeaderClick = (navigation_menu: string) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_home_topmenu_v1',
    },
    {
      event_code: 'clk_home_topmenu_v1',
      page_code: 'client_menu_v1',
      page_name: 'client_menu_v1',
      navigation_menu,
      region_code: 'top_navigation',
    }
  )
}

/** 公告跑马灯点击埋点 */
export const reportNotice = (clk_content: string) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_home_lamp_v1',
    },
    {
      event_code: 'clk_home_lamp_v1',
      region_code: 'top_navigation',
      page_code: 'client_menu_v1',
      page_name: 'client_menu_v1',
      clk_content,
    }
  )
}

/** 侧边栏菜单点击埋点(供 menu 使用) */
export const reportMenuClick = (side_menu: string) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_home_sidemenu_v1',
    },
    {
      event_code: 'clk_home_sidemenu_v1',
      page_code: 'client_menu_v1',
      page_name: 'client_menu_v1',
      side_menu,
      region_code: 'side_bar',
      work_id: uuid(),
    }
  )
}
