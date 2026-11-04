import { Options } from '@/types'
import { http } from '@/utils/request/request'
import * as homeTypes from './types'
import native from '@/utils/native'
import type { HttpResponse } from '@/utils/types'

// 历史记录查询接口
export const searchHistoryLimit = () => {
  return http<homeTypes.WaybillHistoryIn[]>('web.query.searchHistory.limit', {
    number: 20,
    clientType: 10,
  })
}

// 历史记录删除接口
export const searchHistoryDelete = () => {
  return http<null>('web.query.searchHistory.delete', {
    isAll: 1,
    clientType: 10,
  })
}

// 运单模糊查询
export const getWaybillList = (data: homeTypes.WaybillListReq) => {
  return http<homeTypes.WaybillListRes[]>('web.query.waybill.getWaybillLink', data)
}

export const getWaybillListNew = (data: homeTypes.WaybillListReq) => {
  return http<homeTypes.WaybillListNewRes>('web.user.application.indexSearch.pc', data)
}

// banner接口查询
export const getAdvertisementDetails = (data: homeTypes.BannerReq) => {
  return http<homeTypes.BannerRes[]>('web.advertisement.getDetails', data)
}

// 首页模块数据
export const getHomeModuleData = () => {
  return http<homeTypes.ModuleState>('web.basicBiz.homepage.modules')
}

// ==================== 新首页接口（首页改版） ====================

// 新首页-首屏高优先级数据（物流/业务概况、待办事项、专属权益）
export function getFirstPriorityData(): Promise<HttpResponse<homeTypes.NewHomepageFirstPriorityData>>
export function getFirstPriorityData(
  searchType: homeTypes.FirstPrioritySearchType
): Promise<HttpResponse<homeTypes.NewHomepageFirstPriorityPartialData>>
export function getFirstPriorityData(searchType?: homeTypes.FirstPrioritySearchType) {
  return http<homeTypes.NewHomepageFirstPriorityData>(
    'web.basicBiz.newHomepage.getFirstPriorityData',
    searchType === undefined ? {} : { searchType }
  )
}

// 新首页-次优先级数据（问候、视频、模板、最新消息等）
// 重载区分全量/局部查询：无参返回完整数据；带 searchType 仅保证返回对应场景字段（推荐配置 Tab 局部刷新），其他字段可能缺失
export function getSecondPriorityData(): Promise<HttpResponse<homeTypes.NewHomepageSecondPriorityData>>
export function getSecondPriorityData(
  searchType: homeTypes.SecondPrioritySearchType
): Promise<HttpResponse<Partial<homeTypes.NewHomepageSecondPriorityData>>>
export function getSecondPriorityData(searchType?: homeTypes.SecondPrioritySearchType) {
  return http<homeTypes.NewHomepageSecondPriorityData>(
    'web.basicBiz.newHomepage.getSecondPriorityData',
    searchType === undefined ? {} : { searchType }
  )
}

// 新首页-轻应用数据（老客/营销/新客）
export const getLightApplicationData = () => {
  return http<homeTypes.NewHomepageLightApplicationData>('web.basicBiz.newHomepage.getLightApplicationData')
}

/** 已领取或全部自动发放的券包可直接寄件；混合券包仍保留领取入口。 */
export const isCouponReadyToShip = (activity: homeTypes.HomePageActivityVO) =>
  activity.isGet === true ||
  (activity.couponInfoList.length > 0 && activity.couponInfoList.every((coupon) => coupon.isAutoGrant === true))

// 优惠券列表
export const getCouponList = () => {
  return http<homeTypes.HomePageActivityVO[]>('web.basicBiz.homepage.exclusiveActivityList')
}

// 领取优惠券
/**
 * 领取优惠券
 * @param activityId 活动ID（必填）
 * @param phone 手机号（可选）
 * @param from 来源（可选，10-PC端）
 */
export const getCoupon = (activityId: number, phone?: string, from?: number) => {
  return http<homeTypes.GetCouponStatus>('web.basicBiz.homepage.receiveCoupon', {
    activityId,
    ...(phone ? { phone } : {}),
    ...(from !== undefined ? { from } : {}),
  })
}

// 获取常用功能
export const getCommonFunction = () => {
  return http<homeTypes.LightApplicationInfoListVO[]>('web.basicBiz.homepage.commonFunction')
}

// 常用功能回显接口 (V1.0)
export const queryCommonFunction = () => {
  return http<homeTypes.queryCommonFunctionVO>('web.basicBiz.homepage.queryCommonFunction')
}

// 功能权限校验接口 (V1.0)
export const checkMenu = (menuCode: string) => {
  return http<boolean>('web.basicBiz.homepage.checkMenu', { menuCode })
}

// 常用功能保存接口 (V1.0)
export const saveCommonFunction = (menuCodeList: string[]) => {
  return http('web.basicBiz.homepage.saveCommonFunction', { menuCodeList })
}

// 物流概况
export const getLogisticsOverview = () => {
  return http<{
    logisticsOverviewVO: homeTypes.LogisticsOverviewVO
    receivingOverviewVO: homeTypes.ReceivingOverviewVO
  }>('web.basicBiz.homepage.logisticsOverview', {})
}

/** 解析业务概况数据，得到角色定位 tab 与下拉选项 */
export const parseBusinessOverview = (businessData: homeTypes.HomePageBusinessProfileVO[]) => {
  const maps = {
    1: '作为寄方',
    2: '作为收方',
    3: '作为付款方',
  }
  const labels: Options[] = []
  let activeTab = ''
  businessData.forEach((element) => {
    if (element.locateTo) {
      activeTab = element.type as string
    }
    labels.push({
      value: element.type,
      label: element.type ? maps[element.type] : '',
    })
  })
  return {
    activeTab,
    labels,
  }
}

// 业务概况
export const getBusinessOverview = async () => {
  const { data } = await http<homeTypes.HomePageBusinessProfileVO[]>('web.basicBiz.homepage.businessOverview', {})
  let businessData: homeTypes.HomePageBusinessProfileVO[] = data
  if (!Array.isArray(businessData)) {
    businessData = []
  }
  const { activeTab, labels } = parseBusinessOverview(businessData)
  return {
    activeTab,
    labels,
    data: businessData,
  }
}

// 获取待办事项
export const getPendingItems = async () => {
  return http<homeTypes.HomePagePendingCountVO>('web.basicBiz.homepage.pendingItems')
}

// 获取运单预估费用
export const getEstimateCost = async (batchNo: string) => {
  return http<homeTypes.EstimateCostRes>('web.basicBiz.homepage.payAuth.getEstimateCost', { batchNo })
}

// 获取派送中的数量
export const getDeliverCount = async (batchNo: string) => {
  return http<{ number: number }>('web.basicBiz.homepage.payAuth.getDeliverCount', { batchNo })
}

// 获取费用支付
export const getPayment = async () => {
  return http<homeTypes.HomePagePendingCountVO>('web.basicBiz.homepage.payment')
}

// 获取付款授权
export const getPayAuthList = async () => {
  return http<homeTypes.HomePagePendingCountVO>('web.basicBiz.homepage.payAuthList')
}

// 获取权限审批
export const getAuthApprovalList = async () => {
  return http<homeTypes.HomePagePendingCountVO>('web.basicBiz.homepage.authApprovalList')
}
// 获取运单审批
export const getWayBillApprovalList = async () => {
  return http<homeTypes.HomePagePendingCountVO>('web.basicBiz.homepage.wayBillApprovalList')
}

export const getForecastCost = async (waybillNumbers: string[]) => {
  return http<homeTypes.ForcaseRes[]>('web.basicBiz.homepage.wayBill.getForecastCost', { waybillNumbers })
}

export function advertisementConfirmByUser(params: homeTypes.ReportMsgReq) {
  return http('web.advertisement.confirmByUser', params)
}

export type ReportParams = {
  adCodes: string[]
  eventType: number
  operatePort: string
  operatorSystem: string

  buttonName?: string
}

export function eventReport(params: {
  adCodes: string[]
  eventType: number
  buttonName?: string
  operatePort?: string
  operatorSystem?: string
}) {
  // 不需要曝光了
  if (params.eventType === 3) return
  const operatePort = 'PC'
  const operatorSystem = native.isClientMode() ? 'pcClient' : 'pc'

  return http('web.advertisement.event.report', { operatePort, operatorSystem, ...params })
}

export function reportUserMsg(params: homeTypes.ReportUserMsgReq) {
  return http('web.advertisement.userMessage.reportUserMsg', params)
}

export function getCustomerType() {
  return http<homeTypes.UserCustomerType>('web.uam.userCenter.user.getClientType')
}

// 获取首页问候卡片配置（描述文案由后端接口配置下发）
export const getHomeGreeting = () => {
  return http<homeTypes.HomeGreetingVO>('web.basicBiz.homepage.greeting')
}

// 网点查询-行政区划多级联动（获取省：{districtLevel:'province'}；获取市/区：{commonDistrID: 父级districtID}）
export const getMultiLevelSubList = (data: homeTypes.MultiLevelSubListReq) => {
  return http<homeTypes.MultiLevelSubVO>('web.order.address.getMultiLevelSubList', data)
}

// 网点查询-省市区联想（传 keyword 按名称搜索，districtName 为"省/市/区"完整路径）
export const mapAddressSearch = (data: homeTypes.MapAddressSearchReq = {}) => {
  return http<homeTypes.MapAddressSearchVO>('web.order.address.mapAddressSearch', data)
}

// 网点查询-热门城市列表
export const getHotCityNameList = () => {
  return http<homeTypes.HotCityNameItem[]>('web.order.address.hotCityNameList')
}

// 网点查询-详细地址关键词联想 POI
/** 地图关键词联想（web.client.address.mapSearchSuggestFindsuggest） */
export const mapSearchSuggest = (data: homeTypes.MapSearchSuggestReq) => {
  return http<homeTypes.MapSearchSuggestVO>('web.client.address.mapSearchSuggestFindsuggest', data)
}
