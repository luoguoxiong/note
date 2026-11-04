import { report_CLK_event, report_EXP_event, report_pv_event } from '@/public/utils'

export const reportSerchClick = (top_search: string) => {
  report_CLK_event('clk_homepage_search_v1', {
    event_code: 'clk_homepage_search_v1',
    page_code: 'page_homepage_v1',
    region_code: 'top_search',
    event_name: '移动端首页_顶部搜索栏菜单_点击',
    region_name: '搜索栏',
    top_search,
  })
}

export const reportClickBtnName = (button_name: string) => {
  report_CLK_event('clk_home_button_name', {
    event_code: 'clk_home_button_name',
    page_code: 'page_homepage_v1',
    region_code: 'send_mail',
    event_name: '移动端新版首页_下单核心业务区_菜单入口点击',
    region_name: '下单核心业务区',
    button_name,
  })
}

export const reportFastShipEntry = (access_name: string) => {
  report_CLK_event('clk_homepage_send_mail_button_v1', {
    event_code: 'clk_homepage_send_mail_button_v1',
    page_code: 'page_homepage_v1',
    region_code: 'send_mail',
    event_name: '移动端新版首页_下单核心业务区_菜单入口点击',
    region_name: '下单核心业务区',
    access_name,
  })
}

export const reportHomePageUv = () => {
  report_pv_event('page_homepage_v1')
}

export const reportMarketAreaClick = ({ access_name, customer_name }) => {
  report_CLK_event('clk_homepage_marketing_region_button_v1', {
    event_code: 'clk_homepage_marketing_region_button_v1',
    page_code: 'page_homepage_v1',
    region_code: 'marketing_region',
    event_name: '移动端新版首页_营销区域_菜单入口点击',
    region_name: '营销区域',
    access_name,
    customer_name,
  })
}

export const reportCompanyProfileClick = ({ access_name }) => {
  report_CLK_event('clk_homepage_quick_company_profile_v1', {
    event_code: 'clk_homepage_quick_company_profile_v1',
    page_code: 'page_homepage_v1',
    region_code: 'company_profile',
    event_name: '移动端新版首页_公司简介_菜单入口点击',
    region_name: '公司简介',
    access_name,
  })
}

export const reportIndustryInfoClick = ({ access_name }) => {
  report_CLK_event('clk_homepage_industry_solutions_button_v1', {
    event_code: 'clk_homepage_industry_solutions_button_v1',
    page_code: 'page_homepage_v1',
    region_code: 'industry_solutions',
    event_name: '移动端新版首页_行业解决方案_入口点击',
    region_name: '行业解决方案',
    access_name,
  })
}

export const reportFloatShipping = ({ advertising_code, button_name }) => {
  report_CLK_event('clk_homepage_advertising_space_button_v1', {
    event_code: 'clk_homepage_advertising_space_button_v1',
    page_code: 'page_homepage_v1',
    region_code: 'advertising_space',
    event_name: '点击移动端新版首页-侧边广告位_点击',
    region_name: '侧边广告位',
    button_name,
    advertising_code,
  })
}

export const reportCouponCardExposure = (type_name?: string) => {
  report_EXP_event('exp_homepage_coupon_area_v1', {
    page_code: 'page_homepage_v1',
    region_code: 'coupon_area',
    region_name: '专属权益',
    event_name: '移动端新版首页_专属权益_入口曝光',
    type_name,
  })
}

export const reportCouponClick = (access_name: string, type_name?: string) => {
  report_CLK_event('clk_homepage_coupon_area_button_v1', {
    event_code: 'clk_homepage_coupon_area_button_v1',
    event_name: '移动端新版首页_专属权益_入口点击',
    page_code: 'page_homepage_v1',
    region_code: 'coupon_area',
    region_name: '专属权益',
    access_name,
    type_name,
  })
}

export const reportTodoTabClick = (access_name: string) => {
  report_CLK_event('clk_homepage_waybill_todo_list_v1', {
    event_code: 'clk_homepage_waybill_todo_list_v1',
    event_name: '移动端新版首页_待办区域_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项',
    access_name,
  })
}

export const reportApprovalClickMore = () => {
  report_CLK_event('clk_homepage_waybill_approval_see_more_v1', {
    event_code: 'clk_homepage_waybill_approval_see_more_v1',
    event_name: '移动端新版首页_待办事项_运单审批_查看更多_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_运单审批',
  })
}

export const reportApproavalClick = (button_name: string) => {
  report_CLK_event('clk_homepage_waybill_approval_type_v1', {
    event_code: 'clk_homepage_waybill_approval_type_v1',
    event_name: '移动端新版首页_待办事项_运单审批_同意/拒绝_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_运单审批',
    button_name,
  })
}

export const reportApproavalDetailClick = (button_name: string) => {
  report_CLK_event('clk_homepage_waybill_approval_card_switch_v1', {
    event_code: 'clk_homepage_waybill_approval_card_switch_v1',
    event_name: '移动端新版首页_待办事项_运单审批_卡片_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_运单审批',
    button_name,
  })
}

export const reportApprovalCostClick = () => {
  report_CLK_event('clk_homepage_waybill_approval_cost_v1', {
    event_code: 'clk_homepage_waybill_approval_cost_v1',
    event_name: '移动端新版首页_待办事项_运单审批_点击查看预估费用_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_运单审批',
  })
}

export const reportPriceMoreClick = () => {
  report_CLK_event('clk_homepage_price_adjustment_see_more_v1', {
    event_code: 'clk_homepage_price_adjustment_see_more_v1',
    event_name: '移动端新版首页_待办事项_调价审核_查看更多_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_调价审核',
  })
}

export const reportPirceCopyClick = () => {
  report_CLK_event('clk_homepage_price_adjustment_copy_v1', {
    event_code: 'clk_homepage_price_adjustment_copy_v1',
    event_name: '移动端新版首页_待办事项_调价审核_复制_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_调价审核',
  })
}

export const reportPriceClick = (button_name: string) => {
  report_CLK_event('clk_homepage_price_adjustment_agree_v1', {
    event_code: 'clk_homepage_price_adjustment_agree_v1',
    event_name: '移动端新版首页_待办事项_调价审核_确认下单_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_调价审核',
    button_name,
  })
}

export const reportPayAuthClickMore = () => {
  report_CLK_event('clk_homepage_payment_authorization_view_more_v1', {
    event_code: 'clk_homepage_payment_authorization_view_more_v1',
    event_name: '移动端新版首页_待办事项_付款授权_查看更多_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_付款授权',
  })
}

export const reportPayAuthClick = (button_name: string) => {
  report_CLK_event('clk_homepage_payment_authorization_type_v1', {
    event_code: 'clk_homepage_payment_authorization_type_v1',
    event_name: '移动端新版首页_待办事项_付款授权_同意付款_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_付款授权',
    button_name,
  })
}

export const reportPayAuthDetailClick = () => {
  report_CLK_event('clk_homepage_payment_authorization_card_v1', {
    event_code: 'clk_homepage_payment_authorization_card_v1',
    event_name: '移动端新版首页_待办事项_付款授权_卡片_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_付款授权',
  })
}

export const reportPayAuthCostClick = () => {
  report_CLK_event('clk_homepage_payment_authorization_cost_v1', {
    event_code: 'clk_homepage_payment_authorization_cost_v1',
    event_name: '移动端新版首页_待办事项_付款授权_查看预估总费用_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_付款授权',
  })
}

export const reportPayAuthTabClick = () => {
  report_CLK_event('clk_homepage_payment_authorization_entrance_v1', {
    event_code: 'clk_homepage_payment_authorization_entrance_v1',
    event_name: '移动端新版首页_待办事项_付款授权_入口_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_付款授权',
  })
}

export const reportAuthClick = (button_name: string) => {
  report_CLK_event('clk_homepage_permission_approval_type_v1', {
    event_code: 'clk_homepage_permission_approval_type_v1',
    event_name: '客户端首页_待办事项_权限审批_同意_点击',
    page_code: 'page_homepage_v1',
    region_code: 'authority_approval_todo',
    region_name: '待办事项_权限审批',
    button_name,
  })
}

export const reportAuthDetailClick = () => {
  report_CLK_event('clk_homepage_permission_approval_view_more_v1', {
    event_code: 'clk_homepage_permission_approval_view_more_v1',
    event_name: '客户端首页_待办事项_权限审批_查看更多_点击',
    page_code: 'page_homepage_v1',
    region_code: 'authority_approval_todo',
    region_name: '待办事项_权限审批',
  })
}

export const reportTodoSmallTabClick = (button_name: string) => {
  report_CLK_event('clk_homepage_waybill_approval_entrance_v1', {
    event_code: 'clk_homepage_waybill_approval_entrance_v1',
    event_name: '移动端新版首页_待办事项_入口_点击',
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
    region_name: '待办事项_权限审批',
    button_name,
  })
}

export const reportAboutKyeClick = (access_name: string) => {
  report_CLK_event('clk_homepage_understand_v1', {
    page_code: 'page_homepage_v1',
    event_code: 'clk_homepage_understand_v1',
    region_code: 'understand_kye',
    event_name: '移动端新版首页_了解跨越_点击',
    access_name,
  })
}

export const reportCustomerClick = (access_name: string) => {
  report_CLK_event('clk_homepage_customer_button_v1', {
    page_code: 'page_homepage_v1',
    event_code: 'clk_homepage_customer_button_v1',
    region_code: 'understand_kye',
    event_name: '移动端新版首页_新客按钮_点击',
    access_name,
  })
}

export const reportToLogin = () => {
  report_CLK_event('clk_homepage_top_login_v1', {
    page_code: 'page_homepage_v1',
    event_code: 'clk_homepage_top_login_v1',
    region_code: 'top_login',
    event_name: '移动端新版首页_登录_点击',
  })
}

export const reportClickVideo = () => {
  report_CLK_event('clk_homepage_brand_v1', {
    event_code: 'clk_homepage_brand_v1',
    page_code: 'page_homepage_v1',
    region_code: 'top_brand',
    event_name: '移动端新版首页_企业服务品牌信息_点击',
    region_name: '品牌位',
  })
}
