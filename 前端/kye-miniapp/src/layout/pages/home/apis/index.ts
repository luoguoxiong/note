import { HttpOptions } from '@/public/utils/types'
import { http } from '@public/utils/request'
import { GRAY_HEADER_USER_CENTER } from '@public/utils/grayHeader/userCenter'
import * as Types from './types'

// 获取预估运费
export const getEstimateCost = (parmas: Types.WebUamPayAuthGetEstimateCostIn) => {
  return http<Types.WebUamPayAuthGetEstimateCostOut>('web.uam.payAuth.getEstimateCost', parmas)
}

// 获取底部营销活动
export const getMarketActivity = (parmas: Types.CrmActivityReq) => {
  return http<Types.CrmActivityRes>('web.marketing.activity.entry', parmas)
}

export const getWebHomeLaunch = (parmas: Types.WebHomeLaunchReq) => {
  return http<Types.HomeApiRes>('web.homepage.user.menus', parmas, { hideToast: true, extraHeader: GRAY_HEADER_USER_CENTER })
}

// 派送中运单的数量
export const getDeliverCount = (parmas: Types.WebUamPayAuthGetDeliverCountIn) => {
  return http<Types.WebUamPayAuthGetDeliverCountOut>('web.uam.payAuth.getDeliverCount', parmas)
}

// 每日任务及优惠券、签到状态
export const getHomepageTask = (params: Types.WebHomepageTaskIn) => {
  return http<Types.WebHomepageTaskOut>('web.homepage.task', params, { hideToast: true, extraHeader: GRAY_HEADER_USER_CENTER })
}

// 获取每日任务
export const getDailyTask = (parmas: any) => {
  return http<Types.DailyTask>('web.marketing.activityTask.get', parmas, { hideToast: true })
}

// 领取优惠券
export const receiveHomepageCoupon = (params: Types.WebHomepageCouponReceiveIn, options?: HttpOptions) => {
  return http<Types.WebHomepageCouponReceiveOut>('web.homepage.coupon.receive', params, options)
}

// 获取 cms 配置
export const getCMSConfigJson = (params: Types.WebHomepageCmsConfigV2) => {
  return http<Types.WebHomepageCmsConfigOut>('web.homepage.cms.config', params, { hideToast: true })
}

// 签到送积分
export const marketingIntegralSignIntegral = (params: Types.WebMarketingIntegralSignIntegralIn) => {
  return http<Types.WebMarketingIntegralSignIntegralOut>('web.marketing.integral.signIntegral', params, {
    hideToast: true,
  })
}

// 待办事项
export const getHomepageTabs = (params: Types.WebHomepageTabIn) => {
  return http<Types.WebHomepageTabOut>('web.homepage.tab', params, { hideToast: true, extraHeader: GRAY_HEADER_USER_CENTER })
}

// 计算下单草稿运单预估费用
export const getWaybillDraftBatchEstimateCost = (params: Types.WebOrderWaybillWaybillDraftBatchEstimateCostIn) => {
  return http<Types.WebOrderWaybillWaybillDraftBatchEstimateCostOut>(
    'web.order.waybill.waybillDraftBatchEstimateCost',
    params,
  )
}

export const getHomepagePendingItem = (params: Types.WebHomepagePendingItemIn) => {
  return http<Types.WebHomepagePendingItemOut>('web.homepage.pending.item', params)
}

export const getWarehousingPrice = (params: Types.WebQueryWaybillGetWarehousingPriceIn) => {
  return http<Types.WebQueryWaybillGetWarehousingPriceOut>('web.query.waybill.getWarehousingPrice', params)
}

export const getHomePagePopup = () => {
  return http<Types.HomePagePopup>('web.advertisement.query.pop', { sources: 30 }, { hideToast: true })
}

export const getUserInfoByPhone = (params: { source: number }) => {
  return http<Types.UserInfoByPhone>('web.login.user.getUserInfoByPhone', params)
}

export const getNewCustomerActivity = async (
  params: Types.NewCustomerActivityReq,
): Promise<{
  /** 有无留资 */
  hasLeadCapture: boolean
  /** 有无运费时效活动 */
  hasShippingExpiredActivity: boolean
  /** 是否存在留资类活动 */
  hasLeadCaptureActivity: boolean
  waybillActivity: {
    receiveSource: 32
    activityId: number
    couponCount: number
  }
  newCustomerActivity: {
    receiveSource: 31
    activityId: number
    couponCount: number
  }
  videoConfig: Array<{
    title: string
    subTitle: string
    videoCover: string
    videoUrl: string
  }>
}> => {
  const { data } = await http<Types.NewCustomerActivityRes>('web.activity.getNewCustomerActivity', params)

  const activityList = data.activityList ?? []

  const newCustomerActivity = activityList.find((item) => item.receiveSource === 31)
  const waybillActivity = activityList.find((item) => item.receiveSource === 32)

  return {
    /** 有无留资 */
    hasLeadCapture: data.resourceFlag === '10',
    /** 有无运费时效活动 */
    hasShippingExpiredActivity: !!waybillActivity?.activity?.activityId,
    /** 是否存在留资类活动 */
    hasLeadCaptureActivity: !!newCustomerActivity?.activity?.activityId,
    waybillActivity: {
      receiveSource: 32,
      activityId: waybillActivity?.activity.activityId || 0,
      couponCount: waybillActivity?.activity.couponCount || 0,
    },
    newCustomerActivity: {
      receiveSource: 31,
      activityId: newCustomerActivity?.activity.activityId || 0,
      couponCount: newCustomerActivity?.activity.couponCount || 0,
    },
    videoConfig: data.videoConfig,
  }
}
