import { locationRouteV2 } from '@/utils/appBridge'
import { baseReportInstance } from '@/reportUmp'
import { useHomeStore } from '@/stores/home'
import { getFirstPriorityData } from '@/apis/home'

interface LinkToAppprovalIn {
  /** '103' 权限审批 或 '104' 运单审批*/
  pageTab: '103' | '104'
  activeTab: '10' | '20'
  /** '1' 同意 或 '2' 拒接 3 详情 */
  operateType?: '1' | '2' | '3'
  /** ID */
  id?: string
  /** 后端下发跳链（如 /admin/permission-manage?activeTab=10&id=xx&operateType=1），缺省走写死容器路由 */
  url?: string
}

interface LinkPayAuth {
  /** '1' 同意 或 '2' 拒接 3 详情 */
  operateType?: '1' | '2' | '3'
  /** ID */
  id?: string
  /** 后端下发跳链，缺省走写死容器路由 */
  url?: string
}

interface BindCodeOptions {
  /** 新客标识 '1'：首页留资模块仅新客可见，跳绑码页时随 query 透传（参数名对齐小程序 isNewCustomer） */
  isNewCustomer?: string
}
export const useLinkTo = () => {
  /**
   * 跳转至权限审批或者运单审批
   * @param query - 包含导航所需信息的对象
   * @param query.pageTab - 活动选项卡，可选值为 '103'（权限审批）或 '104'（运单审批）
   * @param query.activeTab - 活动选项卡，可选值为 '10'（权限审批）或 '20'（运单审批）
   * @param query.operateType - 操作类型，可选值为 '1'（同意）、'2'（拒绝）或 '3'（详情）
   * @param query.id - 可选参数，ID 字符串
   */
  const linkToAppproval = (query: LinkToAppprovalIn) => {
    const region_code = query.pageTab === '104' ? 'waybill_approval_todo' : 'authority_approval_todo'
    let eventCode = undefined
    if (query.pageTab === '104') {
      const enums = {
        1: 'clk_homepage_waybill_approval_todo_agree_v1',
        2: 'clk_homepage_waybill_approval_todo_reject_v1',
        3: 'clk_homepage_waybill_approval_todo_card_v1',
      }
      eventCode = query?.operateType ? enums[query.operateType] : undefined
    } else {
      const enums = {
        1: 'clk_homepage_authority_approval_todo_agree_v1',
        2: 'clk_homepage_authority_approval_todo_reject_v1',
        3: undefined,
      }
      eventCode = query?.operateType ? enums[query.operateType] : undefined
    }
    if (eventCode && region_code) {
      window.$umpOtherReport(
        'CLK',
        {
          eventCode,
        },
        {
          region_code,
        }
      )
      console.log('hhh', baseReportInstance.get('click_id'))
      sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
    }
    // url 仅用于指定跳转目标，不透传给子应用
    const { url, ...restQuery } = query
    locationRouteV2.push({
      // 优先消费后端下发的跳链（path 内嵌 query 会被拆出并入显式 query，显式参数优先覆盖）
      path: url || '/admin/permission-manage',
      query: {
        ...restQuery,
        sourceFrom: 'home',
        needQuerySave: 'false',
        microForceUpdate: '10',
        pre_click_id: baseReportInstance.get('click_id'),
      },
    })
  }

  /**
   * 跳转至付款授权
   * @param query - 包含导航所需信息的对象
   * @param query.operateType - 操作类型，可选值为 '1'（同意）、'2'（拒绝）或 '3'（详情）
   * @param query.id - 可选参数，ID 字符串
   */
  const linkPayAuth = (query: LinkPayAuth) => {
    const region_code = 'pay_accredit_todo'
    const enums = {
      1: 'clk_homepage_pay_accredit_todo_agree_pay_v1',
      2: 'clk_homepage_pay_accredit_todo_reject_pay_v1',
      3: 'clk_homepage_pay_accredit_todo_card_v1',
    }
    const eventCode = query?.operateType ? enums[query.operateType] : undefined
    if (eventCode && region_code) {
      window.$umpOtherReport(
        'CLK',
        {
          eventCode,
        },
        {
          region_code,
        }
      )
      console.log('hhh', baseReportInstance.get('click_id'))
      sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
    }
    // url 仅用于指定跳转目标，不透传给子应用
    const { url, ...restQuery } = query
    locationRouteV2.push({
      // 优先消费后端下发的跳链（path 内嵌 query 会被拆出并入显式 query，显式参数优先覆盖）
      path: url || '/admin/permission-manage',
      query: {
        ...restQuery,
        pageTab: '105',
        sourceFrom: 'home',
        needQuerySave: 'false',
        microForceUpdate: '10',
        pre_click_id: baseReportInstance.get('click_id'),
      },
    })
  }

  /**
   * 待办事项费用支付查看更多、去支付
   * @param queryUrl - 参数信息
   */
  const linkToPay = (queryUrl: string) => {
    locationRouteV2.push({
      path: `/admin/online-settlement?link=${queryUrl}&from=homePage`,
      query: {
        needQuerySave: 'false',
      },
    })
  }

  /**跳转绑码页 */
  const linkToBindCode = (options: BindCodeOptions = {}) => {
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_homepage_binding_code_button_v1',
      },
      {
        region_code: 'binding_code',
        button_name: '立即绑码',
      }
    )
    console.log('hhh', baseReportInstance.get('click_id'))
    sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
    const query: Record<string, string> = {
      pre_click_id: baseReportInstance.get('click_id'),
      needQuerySave: 'false',
      // 子应用(web-netc-user)监听 ON_ROUTE_CHANGE 消息中 timeStamp 变化 + realRoutePath 做二级路由导航
      timeStamp: String(Date.now()),
      realRoutePath: '/admin/user/cusCode',
    }
    // 可选透传新客标识，仅首页留资模块入口下发
    if (options.isNewCustomer !== undefined) {
      query.isNewCustomer = options.isNewCustomer
    }
    locationRouteV2.push({
      path: `/admin/user/cusCode`,
      query,
    })
  }

  /**
   * 申请客户编码页跳转可选参数（新客营销活动上下文）
   * 参考小程序双槽位全透传：31 留资送券 / 32 查询时效送券可并存，来源码随槽位下发
   */
  interface ApplyCustomerCodeOptions {
    /** 槽位31-新客留资送券：营销活动ID（沿用原参数名，兼容下游既有消费） */
    activityId?: number | string
    /** 槽位31：优惠券张数 */
    couponCount?: number | string
    /** 槽位31：领取来源码（31） */
    receiveSource?: number | string
    /** 槽位31存在标记，下发时为 1 */
    hasLeadCaptureActivity?: number | string
    /** 槽位32-新客查询时效送券：领取来源码（32） */
    waybillReceiveSource?: number | string
    /** 槽位32：营销活动ID */
    waybillActivityId?: number | string
    /** 槽位32：优惠券张数 */
    waybillCouponCount?: number | string
    /** 槽位32存在标记，下发时为 1 */
    hasShippingExpiredActivity?: number | string
  }

  /**
   * 跳转申请客户编码页
   * isNew/activityId/couponCount 随 query 透传给子应用(个人中心容器按 route.query 拼 iframe url)，
   * 由申请专属客户编码页在点击提交时拼接进请求参数；
   * isNew 判断新老客，取值依据接口 oldUser（oldUser===0 为新客）
   */
  const linkToApplyCustomerCode = async (options: ApplyCustomerCodeOptions = {}) => {
    const homeStore = useHomeStore()
    // 非首页入口可能尚未加载客户身份，先查询，避免把默认值当成新客。
    if (homeStore.oldUser !== 0 && homeStore.oldUser !== 1) {
      try {
        const { data } = await getFirstPriorityData()
        homeStore.oldUser = data.oldUser
      } catch {
        // 请求层统一提示错误，查询失败时保留当前页。
        return
      }
      if (homeStore.oldUser !== 0 && homeStore.oldUser !== 1) return
    }
    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_homepage_binding_code_button_v1',
      },
      {
        region_code: 'binding_code',
        button_name: '申请客户编码',
      }
    )
    console.log('hhh', baseReportInstance.get('click_id'))
    sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
    // isNew：'1' 新客 / '0' 老客（由首页接口 oldUser 推导，oldUser===0 为新客）
    const {
      activityId,
      couponCount,
      receiveSource,
      hasLeadCaptureActivity,
      waybillReceiveSource,
      waybillActivityId,
      waybillCouponCount,
      hasShippingExpiredActivity,
    } = options
    // 无值不下发，保持与原逻辑一致
    const appendIfPresent = (key: string, value: number | string | undefined) => {
      if (value !== undefined && value !== '') {
        query[key] = String(value)
      }
    }
    const query: Record<string, string> = {
      pre_click_id: baseReportInstance.get('click_id'),
      needQuerySave: 'false',
      // 对齐老基座 microUserRouterGuard 重写后的 query(大写S, 字符串), 子应用据此监听二级路由
      timeStamp: String(Date.now()),
      realRoutePath: '/admin/user/customer-code-apply',
      isNew: homeStore.oldUser === 0 ? '1' : '0',
    }
    // 槽位31：新客留资送券（沿用原参数名）
    appendIfPresent('receiveSource', receiveSource)
    appendIfPresent('activityId', activityId)
    appendIfPresent('couponCount', couponCount)
    appendIfPresent('hasLeadCaptureActivity', hasLeadCaptureActivity)
    // 槽位32：新客查询时效送券（waybill* 独立参数名，可与槽位31并存）
    appendIfPresent('waybillReceiveSource', waybillReceiveSource)
    appendIfPresent('waybillActivityId', waybillActivityId)
    appendIfPresent('waybillCouponCount', waybillCouponCount)
    appendIfPresent('hasShippingExpiredActivity', hasShippingExpiredActivity)
    locationRouteV2.push({
      path: `/admin/user/customer-code-apply`,
      query,
    })
  }

  return {
    linkToAppproval,
    linkPayAuth,
    linkToPay,
    linkToBindCode,
    linkToApplyCustomerCode,
  }
}
