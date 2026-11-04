import { http } from '@public/utils/request'

export interface IGetNewestWaybillInfo {
  /** 运单号 */
  waybillNumber: number
  /** 运单状态10 待通知取货 20 待揽件 30 待签收 40 已签收 50 已取消 */
  waybillStatus: number
  waybillStatusDesc: string
  /** 寄件时间 */
  deliveryTime: string
  /** 货好时间 */
  goodsTime: string
  /** 签收时间 */
  receiveTime: string
  /** 	寄件公司 */
  deliveryCustomerName: string
  /** 寄件人 */
  deliveryPerson: string
  /** 寄件城市 */
  deliveryCity: string
  /** 寄件详细地址 */
  deliveryAddress: string
  /** 收件公司 */
  pickupCustomerName: string
  /** 收件人 */
  pickupPerson: string
  /** 收件城市 */
  pickupCity: string
  /** 收件详细地址 */
  pickupAddress: string
  /** 国际件收件国家 */
  pickupCountry: string
  /** 签收人 */
  receiver: string
  /** 服务方式描述 */
  serviceModeDesc: string
  /** 业务范围 10国际件 */
  waybillBusinessRange: number
  /** 限制类别 数据字典：map_warn_basic_data_reason */
  limitReason: number
  /** 限制类别 数据字典：map_warn_basic_data_reason */
  historyLimitReason: number
  /** 是否有网点自提 0-否 1-是 */
  hasSelfMention: number
  /** 货物保管费 10已产生、20即将产生、30无 */
  storageFeeStatus: number
  /** 报关管控标识 10-入仓异常 20-入仓提醒 30-非下单人无权限或运单状态非待揽件或待签收 40-未命中 */
  clearanceControlFlag: number
  /** 	列表展示类型 */
  showWatermarkType: number
  /** 列表展示文案 */
  showPaperwork: string
  /** 最新外部路由信息 */
  newExteriorRouteInfo: {
    /** 路由描述 */
    routeDescription: string
    /** 路由步骤 运单状态 0 待揽件 10正在安排司机 20司机正在赶来 30司机已到达 40已揽件 50运输中 60派送中 70派送异常 80已签收 */
    routeStep: number
    /** 路由步骤字典描述 */
    routeStepDesc: string
    /** 路由节点上传时间 */
    uploadDate: string
  }
}
// 获取当前登录人最新运单寄收信息 (V1.0)
export const getNewestWaybillInfo = () => {
  return http<IGetNewestWaybillInfo[]>('web.query.homepage.getNewestWaybillInfo')
}

// 获取运单最新状态并更新缓存数据 (V1.0)
export const getWaybillStatusAndUpdateCache = (params) => {
  return http('web.query.homepage.getWaybillStatusAndUpdateCache', params)
}

export interface IAppHomeQueryUnPaidList {
  /** 运单号 */
  waybillNumber: string
  /** 纳入月份（0 账单） */
  inMonth: string
  /** 服务方式 */
  serviceMethod: string
  /** 寄件时间 */
  deliveryTime: string
  /** 寄件城市 */
  deliveryCity: string
  /** 寄件人 */
  sender: string
  /** 收件城市 */
  pickupCity: string
  /** 收件人 */
  receiver: string
  /** 未支付金额 */
  unPaidAmt: string
  /** 应收金额（0 账单） */
  netReceiptsAmt: string
  /** 单据类型(0 账单 1 运单) */
  billType: string
  /** 结算方式 */
  payMode: string
  /** 单量（0 账单）*/
  waybillCount: string
  /** 跳转地址 */
  directUrl: string
  /** 金额单位 */
  amountUnit: string
  /** 查看更多跳转地址 */
  moreDirectUrl: string
}
// 互联网netc_user-包装fms-在线结算-互联网app-待支付卡片 (V1.0)
export const appHomeQueryUnPaidList = () => {
  return http<IAppHomeQueryUnPaidList[]>('web.user.fmsSettlement.appHomeQueryUnPaidList')
}

export interface IGetAdvertisementDetailParam {
  /** 渠道编码，数据字典：eam_advertisement_channel */
  channelCode: string
  /** 页面编码 */
  pageCode: string
  /** appCode */
  appCode?: string
  /** 广告类型集合，数据字典：eam_advertisement_type，10：banner，20：弹窗，30：走马灯，40：开屏页 */
  adTypeList?: string[]
  /** 最后更新时间 yyyy-MM-dd HHmmss */
  latestUpdateTime: string
  /** 操作端口 APPAPPPCPC小程序MINIPROGTAM */
  operatePort?: string
  /** 操作系统 安卓android苹果ios网页pc安装包pcClient */
  operatorSystem?: string
  /** 登录用户手机号,登录时传,未登录不传 */
  loginPhone?: string
}

export interface IAdvertisementBannerDto {
  /** ios图片链接数据 */
  iosLinks: {
    imgRatio1: string
    imgRatio2: string
    imgLink: string
  }[]
  androidLinks: {
    imgRatio1: string
    imgRatio2: string
    imgLink: string
  }[]
  /** 模块路由 */
  modelRoute: string
  /** h5链接 */
  h5Link: string
  /** pc端h5跳转类型：10-打开新窗口加载H5 20-打开内部新tab加载H5 */
  pcH5JumpType: 10 | 20
  /** 页面分组编码 */
  pageGroupCode: string
  /** 跳转方式 0=不跳转；1=h5；2=原生；3=外部小程序；4=调接口 */
  jumpMode: 0 | 1 | 2 | 3 | 4
  /** banner链接 */
  posterLink: string
  /** 按钮下标 */
  buttonIndex: number
  /** 自定义参数 */
  customerParam: object
  /** 不再提醒配置 0=不配置；1=配置 */
  noLongerRemind: 0 | 1
  /** 不再提醒天数 */
  noLongerRemindDays: number
  /** 页面配置的自定义参数 */
  urlCustomParam: {
    pram: string
    value: string
  }[]
  /** 返回跳转请求参数 */
  customeParam: object
}

export interface IGetAdvertisementDetail {
  /** 最后更新时间 yyyy-MM-dd HHmmss	st */
  latestUpdateTime: string
  /** 区域样式编码 */
  areaStyleCode: string
  /** banner数据 */
  detailsList: {
    advertisementBannerDto: IAdvertisementBannerDto
    advertisementCode: string
  }[]
}
// 获取广告内容详情 (V1.0)
export const getAdvertisementDetail = (param: IGetAdvertisementDetailParam) => {
  return http<IGetAdvertisementDetail[]>('web.advertisement.getDetails', param)
}

export interface IConfirmByUserAdv {
  /** 广告编码 */
  advertisementCodeList?: string[]
  /** 渠道来源 */
  channelSource: string
  /** 事件类型，1-按钮事件，2-关闭事件，3-曝光事件，会持续增加不同场景的触发事件 3-曝光事件 */
  eventType: number
  /** 按钮下标 事件类型为【按钮事件】，则该字段有值 */
  buttonIndex?: number
  /** 自定义参数 */
  customerParam?: object
  /** 勾选不再提醒 0=未勾选；1=已勾选 */
  noLongerRemindFlag?: number
  /** 操作端口 APPAPPPCPC小程序MINIPROGTAM */
  operatePort?: string
  /** 操作系统 安卓android苹果ios网页pc安装包pcClient */
  operatorSystem?: string
}

// 用户操作事件触发接口 (V1.0)
export const confirmByUserAdv = (param: IConfirmByUserAdv) => {
  return http<object>('web.advertisement.confirmByUser', param)
}

export interface IReportEventParam {
  /** 广告编码 */
  adCodes: string[]
  /** 1：按钮事件 2：关闭事件 3：曝光事件 4：点击事件 */
  eventType: 1 | 2 | 3 | 4
  /** 按钮名称 */
  buttonName?: string
  /** 操作端口 APPAPPPCPC小程序MINIPROGTAM */
  operatePort?: string
  /** 操作系统 安卓android苹果ios网页pc安装包pcClient */
  operatorSystem?: string
}

// 用户操作事件上报 (V1.0)
export const reportEvent = (param: IReportEventParam) => {
  return http<object>('web.advertisement.event.report', param)
}
