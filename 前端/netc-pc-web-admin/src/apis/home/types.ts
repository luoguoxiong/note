import { Any } from '@/types'

export interface ModuleState {
  /**模块信息 */
  moduleInfo: HomePageModuleInfo[]
  /**模块数据 */
  moduleData: HomePageModuleData
  /** 是否是旧客户 */
  oldUser: number
  /** 是否匹配销售 */
  bindSalesFlag: string
}

export enum ParentModuleCode {
  /** banner广告栏 */
  HOME_PAGE_BANNER = 'HOME_PAGE_BANNER',
  /**运单查询 */
  HOME_PAGE_SEARCH_BAR = 'HOME_PAGE_SEARCH_BAR',
  /**运单统计 */
  HOME_PAGE_WAYBILL_STAT = 'HOME_PAGE_WAYBILL_STAT',
  /**待办事项 */
  HOME_PAGE_TODO_LIST = 'HOME_PAGE_TODO_LIST',
  /**专属权益 */
  HOME_PAGE_EXCLUSIVE_INTEREST = 'HOME_PAGE_EXCLUSIVE_INTEREST',
  /**预存运费 */
  PAY_FOR_DESIPTETTIME = 'PAY_FOR_DESIPTETTIME',
  /**推荐配置 */
  RECOMMON_CARD = 'RECOMMON_CARD',
  /**绑码引导 */
  HOME_PAGE_BIND_CODE = 'HOME_PAGE_BIND_CODE',
  /**新客户卡片 */
  NEW_CUSTOMER_CARD = 'NEW_CUSTOMER_CARD',
  /**新客户搜索 */
  NEW_CUSTOMER_SEARCH = 'NEW_CUSTOMER_SEARCH',
  /**关于跨越 */
  HOME_PAGE_KYE_INFO = 'HOME_PAGE_KYE_INFO',
  /**跨越品牌展示 */
  HOME_PAGE_ABOUT = 'HOME_PAGE_ABOUT',
  /**行业解决方案 */
  INDUSTRY_INFO = 'INDUSTRY_INFO',
  /**新客户推荐功能 */
  NEW_CUSTOMER_COMMON = 'NEW_CUSTOMER_COMMON',
  /**为什么选择跨越 */
  WHY_CHOOSE_KYE = 'WHY_CHOOSE_KYE',
  /**跨越公众号 */
  KYE_OFFICIAL_ACCOUNTS = 'KYE_OFFICIAL_ACCOUNTS',
  /**常用功能 */
  HOME_PAGE_COMMON_FUNCTION = 'HOME_PAGE_COMMON_FUNCTION',
  /**营销卡片 */
  MARKETING_CARD = 'MARKETING_CARD',
  /**最新消息 */
  HOME_PAGE_LATEST_MESSAGE = 'HOME_PAGE_LATEST_MESSAGE',
  /**问候卡片 */
  HOME_PAGE_GREETING = 'HOME_PAGE_GREETING',
}

export enum SubModuleCode {
  /**运单统计-物流概况 */
  LOGISTICS_OVERVIEW = 'LOGISTICS_OVERVIEW',
  /**运单统计-业务概况 */
  BUSINESS_OVERVIEW = 'BUSINESS_OVERVIEW',
  /**费用支付 */
  PAYMENT = 'PAYMENT',
  /**付款权限 */
  PAY_AUTH = 'PAY_AUTH',
  /**权限审批 */
  AUTH_APPROVAL = 'AUTH_APPROVAL',
  /**运单审批 */
  WAYBILL_APPROVAL = 'WAYBILL_APPROVAL',
}

export interface HomePageModuleInfo {
  /**模块编码 */
  moduleCode: ParentModuleCode | SubModuleCode
  /**模块名称 */
  moduleName: string
  /**模块加载优先级 */
  priority: number
  /**模块位置 */
  position: number
  /**默认值 */
  defaultValue: string
  /**子模块数据 */
  subModules: HomePageModuleInfo[] | null
}

export interface HomePageModuleData {
  /**物流概况 */
  logisticsOverview: LogisticsOverviewVO | undefined
  /**揽收概况 */
  receivingOverview: ReceivingOverviewVO | undefined
  /**业务概况 */
  businessOverview: HomePageBusinessProfileVO | undefined
  /**待办事项 */
  pendingItems: HomePagePendingCountVO | undefined
  /**专属权益数据 */
  activityList: HomePageActivityVO[] | undefined
  /**常用功能 */
  commonFunction: LightApplicationInfoListVO[] | undefined
  /**最新消息 */
  latestMessageList: UserMessageVO[] | undefined
}

export interface LogisticsOverviewVO {
  /**待通知取货总数 */
  notifyPickupCount: number
  /**待通知取货角色状态（与跳链中 waybillCustomerSource 一致） */
  notifyPickupSource: number
  /**待通知取货跳链 */
  notifyPickupUrl: string
  /**待揽件总数 */
  pendingItemsCount: number
  /**待揽件角色状态（与跳链中 waybillCustomerSource 一致） */
  pendingItemsSource: number
  /**待揽件跳链 */
  pendingItemsUrl: string
  /** 待签收总数 */
  signCount: number
  /**待签收角色状态（与跳链中 waybillCustomerSource 一致） */
  signSource: number
  /**待签收跳链 */
  signUrl: string
  /**已签收总数 */
  signedCount: number
  /**已签收角色状态（与跳链中 waybillCustomerSource 一致） */
  signedSource: number
  /**已签收跳链 */
  signedUrl: string
}

export interface ReceivingOverviewVO {
  /**待揽件运单总数 */
  pendingReceiveCount: number
  /**待揽件运单角色状态（与跳链中 waybillCustomerSource 一致） */
  pendingReceiveSource: number
  /**待揽件运单跳链 */
  pendingReceiveUrl: string
  /**待签收运单总数 */
  pendingSignCount: number
  /**待签收运单角色状态（与跳链中 waybillCustomerSource 一致） */
  pendingSignSource: number
  /**待签收运单跳链 */
  pendingSignUrl: string
}

export interface HomePageBusinessProfileVO {
  /**总票数 */
  totalVotes: number
  /**总件数 */
  totalPieces: number
  /**角色 */
  type: 1 | 2 | 3 | ''
  /**左边侧边栏定位 */
  locateTo: boolean
  /**票列表 图表列表 */
  detailVotes: DataVO[]
  /**件列表 图表列表 */
  detailPieces: DataVO[]
  /**查看更多跳链 */
  viewMoreUrl?: string
}

export interface DataVO {
  /**时间 */
  dataTime: string
  /**数量 */
  count: number
}
export enum TodoTabEnum {
  PAYMENT = 'PAYMENT',
  PAY_AUTH = 'PAY_AUTH',
  AUTH_APPROVAL = 'AUTH_APPROVAL',
  WAYBILL_APPROVAL = 'WAYBILL_APPROVAL',
}
export interface HomePagePendingCountVO {
  /**付款授权数量 */
  payAuthCount: number | null
  /**权限审批数量 */
  authApprovalCount: number | null
  /**运单审批数量 */
  wayBillApprovalCount: number | null
  /**费用支付 */
  paymentVO: HomePagePaymentVO | null
  /**付款授权数据 */
  payAuthList: PayAuthListVO[] | null
  /**权限审批数据 */
  authApprovalList: AuthApprovalListVO[] | null
  /**运单审批数据 */
  wayBillApprovalList: WayBillApprovalListVO[] | null
  /**tab定位 */
  locateTo: TodoTabEnum
}

export interface HomePagePaymentVO {
  /** 属于哪个类型 */
  locateToType?: 'PAYMENT'
  /**结算类型 */
  payMode: string
  /**纳入月份 */
  orgInMonth: string
  /**应收金额 */
  netReceiptsAmt: string
  /**单量 */
  waybillCount: string
  /**待支付金额 */
  unPaidAmt: string
  /**运单号 */
  waybillNumber: string
  /**寄件城市 */
  deliveryCity: string
  /**寄件人 */
  sender: string
  /**收件城市 */
  pickupCity: string
  /**收件人 */
  receiver: string
  /**单据类型 0 月结1 散客 */
  billType: 0 | 1
  /**寄件时间 */
  deliveryTime: string
  /**服务方式 */
  serviceMethod: string
  /**更多链接 */
  moreDirectUrl: string
  /**去支付链接 */
  directUrl: string
}

export enum PayAuthTypeEnum {
  COMPANY = 10,
  USER = 20,
  WAYBILL = 30,
}

export interface PayAuthListVO {
  id: string | number
  /** 属于哪个类型 */
  locateToType?: 'PAY_AUTH'
  /**运单申请、公司申请、个人申请 */
  authType: PayAuthTypeEnum
  /** 20所有公司 40制定公司 */
  authLevel: 20 | 30 | 40
  /**审批编码 */
  batchNo: string
  /**寄件公司 */
  senderCompany: string
  /**收件公司 */
  recipientCustomerName: string | null
  /**付款公司 */
  payCustomerName: string
  /**申请人 */
  applyName: string
  /**申请人手机 */
  applyMobile: string
  /**申请人角色（是否商务发起的申请，1-是，0-否） */
  isEmpApply: number
  /**申请公司 */
  applyCustomerName: string
  /**申请公司客户编码 */
  applyCustomerCode: string
  /**申请时间 yyyy/MM/dd */
  applyDate: string
  /**寄方客户编码 */
  senderCustomerCode: string
  /**付款客户编码 */
  payCustomerCode: string
  /**寄件人 */
  sender: string
  /** 总票数 */
  waybillCount: number
  /**同意付款跳链（后端下发，缺省走前端写死容器路由） */
  agreeUrl?: string
  /**拒绝付款跳链 */
  rejectUrl?: string
  /**运单详情跳链 */
  detailsUrl?: string
}

export interface AuthApprovalListVO {
  id: string | number
  /** 属于哪个类型 */
  locateToType?: 'AUTH_APPROVAL'
  /**申请人 */
  memberName: string
  /**申请人手机 */
  applyPhone: string
  /**申请原因 */
  applyReason: string
  /**申请时间 yyyy/MM/dd  */
  applyTime: string
  /**权限类型 */
  applyAuth: PayAuthTypeEnum
  /**权限类型描述 */
  authTypeDesc: string
  /**查看更多跳链（后端下发，缺省走前端写死容器路由） */
  viewMoreUrl?: string
  /**同意跳链 */
  agreeUrl?: string
  /**拒绝跳链 */
  rejectUrl?: string
}

export interface WayBillApprovalListVO {
  id: string | number
  /** 属于哪个类型 */
  locateToType?: 'WAYBILL_APPROVAL'
  /**运单号 */
  waybillNumber: string
  /**自动拒绝时间 */
  autoRejectTime: string
  /**寄件城市 */
  sendCity: string
  /**收件城市 */
  receiveCity: string
  /**寄件人 */
  sendName: string
  /**收件人 */
  receiveName: string
  /**寄件公司 */
  sendCustomer: string
  /**收件公司 */
  receiveCustomer: string
  /**寄件类型（服务方式） */
  serviceMode: number
  /**货好时间 yyyy/MM/dd HH:mm */
  goodTime: string
  /**预估费用 */
  estimatedCost: number
  /**预估费用说明 */
  forecastCost: string
  /**下单人 */
  placeOrderName: string
  /**下单人手机号 */
  placeOrderPhone: string
  /** 是否展示预估费用 */
  disPlayForecastCost: boolean
  /**查看更多跳链（后端下发，缺省走前端写死容器路由） */
  viewMoreUrl?: string
  /**同意跳链 */
  agreeUrl?: string
  /**拒绝跳链 */
  rejectUrl?: string
  /**详情跳链 */
  detailsUrl?: string
}

export interface HomePageActivityVO {
  /**活动id */
  id: number
  /**活动编码 */
  code: string
  /**券配置 */
  couponInfoList: CouponInfoVO[]
  /** 是否已领取（兼容历史返回及领取成功后的本地状态） */
  isGet?: boolean
}

export interface CouponInfoVO {
  /** 是否自动发放到账户；未下发时沿用主动领取流程 */
  isAutoGrant?: boolean
  /**活动ID */
  activityId: number
  /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
  type: '10' | '20' | '30'
  /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
  code: string
  /**券面金额;建议直接以厘为单位保存 */
  amount: number
  /**奖券数量 */
  ticketNumber: number
  /**优惠券描述 */
  couponDesc: string
  /**优惠金额 */
  discountAmount: number
  discountRate: number
  reliefForm: 10 | 20 | 30 | 40 | 50 | 60
}

export interface LightApplicationInfoListVO {
  menuName: string
  menuIcon: string
  menuCode: string
  routePath: string
  unknown: unknown
}

export interface queryCommonFunctionVO {
  allMenuList: SettingDataVO[]
  selectedMenuList: SettingDataVO[]
}

export interface SettingDataVO {
  menuName: string
  menuCode: string
}

type JumpType = 0 | 1 | 2 | 3 | 4

export interface UserMessageVO {
  /**消息流水号 */
  messageSerialNumber: string
  /**消息ID */
  messageId: string
  /**手机号 */
  phone: string
  /**用户消息类别编码（数据字典eam_message_type） */
  messageType: number
  /**业务ID(对应各自业务id) */
  businessId: string
  /**状态类型（0-广告、1-消息、2-新闻） */
  stateType: number
  messageTitle: string
  messageContent: string
  messagePushTime: number
  jumpRestrict: 1 | 2 | 3 | null
  pcJumpType: 1 | null
  appJumpType: JumpType | null
  pcUrl?: string | null
  appUrl?: string | null
}

export interface BannerData {
  /** 0 不跳转 1 H5 2 原生 3微信小程序 */
  jumpMode: 0 | 1 | 2 | 3
  /** banner图 */
  posterLink: string
  /** h5链接 */
  h5Link: string
  /** 壳内部路由 */
  pcH5JumpType: string
  modelRoute: string
  advertisementCode: string
  advertisementTitle: string
  customeParam: Record<string, Any>
  pushToStyle: 0 | 1
}

export interface WaybillHistoryIn {
  searchKey: string
  searchType: string
  id: number
}
export interface WaybillListReq {
  /** 10 客户端查看运单资料列表 */
  clientSearchType: number
  /**10 查件历史 */
  clientType: number
  /**运单查询关键字 */
  keyword: string
  /** 运单查询数量 */
  pageSize: number
}

export interface WaybillListRes {
  /** 运单关键字 */
  keyword: string
  /**关键字类型 */
  keywordType: string
}

export interface WaybillListNewRes {
  applicationInfoList: applicationInfoVO[]
  waybillLinkList: WaybillListRes[]
}

export interface applicationInfoVO {
  keywordType: string
  keyword: string
  keywordCode: string
  keywordDescription: string
  extendField: string
  createDate: string
  menuIcon: string
  loadAddress: string
  routePath: string
  keywordIconUrl: string
  recoType: number // 1-搜索应用，2-ai识别应用，空则为运单或其他
  intentType?: number
}

export interface BannerReq {
  /**渠道编码 */
  channelCode: string
  /** 页面编码 */
  pageCode: string
  /** 广告类型集合，数据字典：eam_advertisement_type，10：banner，20：弹窗，30：走马灯，40：开屏页 */
  adTypeList: string[]
  /** 最后更新时间 */
  latestUpdateTime: string
  /** 操作端口（PC 弹窗场景会传） */
  operatePort?: string
  /** 操作系统（pcClient / pc） */
  operatorSystem?: string
}

/** 悬浮广告跳转配置（advertisementType 70） */
export interface AdvertisementFloatDto {
  modelRoute?: string
  h5Link?: string
  pcH5JumpType?: number | string
  jumpMode?: number
  posterLink?: string
  customeParam?: Record<string, string | number> | null
}

/** 弹窗按钮（PC_POPUP_004/005/006/MODIFY_PRICE_006 用） */
export interface AdvertisementButton {
  buttonIndex: number
  buttonName?: string
  buttonText?: string
  jumpMode?: number
  h5Link?: string
  modelRoute?: string
  customeParam?: Record<string, string | number> | null
  twoConfirmStatus?: number
  twoConfirmPopupTitle?: string
  twoConfirmPopupText?: string
  twoConfirmButtonTextOne?: string
  twoConfirmButtonTextTwo?: string
  pcH5JumpType?: number | string
  pageGroupCode?: string
}

/** 弹窗 DTO（与 banner / float 同级，挂在 detailsList[] 内） */
export interface AdvertisementPopupDto {
  advertisementCode?: string
  title?: string
  content?: string
  buttonList?: AdvertisementButton[]
  posterLink?: string
  pushToStyle?: number
  twoConfirmStatus?: number
  noLongerRemindFlag?: number
  noLongerRemind?: number
  noLongerRemindDays?: number
  configCloseButton?: string
  customerParam?: Record<string, string | number> | null
  h5Link?: string
  modelRoute?: string
  customeParam?: Record<string, string | number> | null
  jumpMode?: number
  pcH5JumpType?: number | string
  pageGroupCode?: string
}

/** Banner 详情列表项（弹窗/横幅/悬浮联合类型） */
export interface BannerDetailItem {
  advertisementBannerDto: BannerData
  advertisementFloatDto?: AdvertisementFloatDto | null
  advertisementPopupDto?: AdvertisementPopupDto | null
  advertisementTitle: string
  advertisementCode: string
  pushToStyle?: number
}

export interface BannerRes {
  areaStyleCode: string
  advertisementType?: string
  allowClose?: number
  detailsList: BannerDetailItem[]
}

export interface GetCouponStatus {
  /** 领取优惠卷状态码 0 成功 */
  receiveStatus: number
  /** 领取优惠卷信息 */
  receiveDesc: string
}

export interface EstimateCostRes {
  estimateCost: string
}

export interface ForcaseRes {
  waybillNumber: string
  /** 预估费用，null 表示查询完成但无费用数据（区别于未查询） */
  forecastCost: string | null
}

export interface ReportMsgReq {
  advertisementCodeList: string[]
  channelSource: string
  eventType: number
  buttonIndex?: number
  noLongerRemindFlag?: number
  operatePort?: string
  operatorSystem?: string
}

export interface ReportUserMsgReq {
  messageSerialNumber: string
  messagePushTime: number
  messageType: number
  operatePort: string
  operatorSystem: string
}

export interface UserCustomerType {
  /** 用户类型 0 已绑码 1 新客已合作 2 新客未合作 3 老客未绑码 4 老客需要切换客户编码 */
  clientType: number
}

/** 首页问候卡片配置 */
export interface HomeGreetingVO {
  /** 用户名 */
  userName: string
  /** 问候文案 */
  content: string
}

/** 行政区划多级联动查询入参（web.order.address.getMultiLevelSubList） */
export interface MultiLevelSubListReq {
  /** 层级（获取省列表时传 'province'） */
  districtLevel?: string
  /** 省 ID */
  provinceDistrID?: string
  /** 市 ID */
  cityDistrID?: string
  /** 区 ID */
  zoneDistrID?: string
  /** 街道 ID */
  streetDistrID?: string
  /** 通用父级 ID（获取市/区列表时传父级 districtID） */
  commonDistrID?: string
}

/** 行政区划多级联动列表项 */
export interface MultiLevelSubItem {
  /** 行政区划 ID */
  districtID: string
  /** 行政区划名称 */
  districtName: string
  /** 行政区划代码 */
  adminCode?: string
  /** 名称首字母（省份按字母分组依赖） */
  initials?: string
}

/** 行政区划多级联动查询返回 */
export interface MultiLevelSubVO {
  /** 当前层级 */
  districtLevel?: string
  provinceDistrID?: string
  cityDistrID?: string
  zoneDistrID?: string
  streetDistrID?: string
  /** 地区列表 */
  districtList?: MultiLevelSubItem[]
}

/** 省市区联想入参（web.order.address.mapAddressSearch，用于省市区面板内搜索） */
export interface MapAddressSearchReq {
  /** 搜索关键词 */
  keyword?: string
  /** 限定城市 */
  city?: string
}

/** 地图搜索地区节点（每项含省/市/区完整层级与 ID） */
export interface MapAddressSearchItem {
  /** 等级 */
  level?: string
  /** 省 ID */
  provinceId?: string
  /** 省 */
  province?: string
  /** 市 ID */
  cityId?: string
  /** 市 */
  city?: string
  /** 区 ID */
  countyId?: string
  /** 区 */
  county?: string
  /** 街道 ID */
  streetId?: string
  /** 街道 */
  street?: string
  /** 地区名称（"省/市/区"完整路径） */
  districtName?: string
}

/** 省市区联想返回 */
export interface MapAddressSearchVO {
  /** 关键词 */
  keyWord?: string
  /** 地区列表 */
  districtVOList?: MapAddressSearchItem[]
}

/** 热门城市项（web.order.address.hotCityNameList） */
export interface HotCityNameItem {
  /** 市 ID */
  id: string
  /** 城市名 */
  title: string
  /** 省 ID */
  provinceId: string
}

/** 地图关键词联想入参（web.client.address.mapSearchSuggestFindsuggest） */
export interface MapSearchSuggestReq {
  /** 模糊搜索关键词（地址/POI 名称） */
  keyword: string
  /** 限定检索的城市/区域，可传空字符串 */
  region: string
  /** 页码，从 1 开始 */
  page_index: number
  /** 每页条数 */
  page_size: number
}

/** 关键词联想地址项 */
export interface FindSuggestItem {
  /** id */
  id?: string
  /** 提示文字（POI 名称） */
  title: string
  /** 地址 */
  address?: string
  /** 省 */
  province?: string
  /** 省 ID */
  provinceId?: string
  /** 行政区代码 */
  adcode?: number
  /** 市 */
  city?: string
  /** 市 ID */
  cityId?: string
  /** 提示所描述位置坐标 { lng, lat } */
  location?: { lng: number; lat: number }
  /** 分类 */
  category?: string
  /** 区 */
  district?: string
  /** 区 */
  county?: string
  /** 区 ID */
  countyId?: string
}

/** 地图关键词联想返回（web.client.address.mapSearchSuggestFindsuggest） */
export interface MapSearchSuggestVO {
  /** 总条数 */
  count?: number
  /** POI 列表 */
  data?: FindSuggestItem[]
}

// ==================== 新首页接口（首页改版） ====================

/** 一级接口局部查询场景；不传时查询全量一级数据。 */
export enum FirstPrioritySearchType {
  OVERVIEW = '10',
  PAYMENT = '20',
  PAY_AUTH = '30',
  AUTH_APPROVAL = '40',
  WAYBILL_APPROVAL = '50',
}

/** 二级接口模板局部查询场景。 */
export enum SecondPrioritySearchType {
  SHIPPING_TEMPLATE = '10',
  BATCH_IMPORT_TEMPLATE = '20',
}

/** 局部查询只保证返回对应场景的数据，其他字段可能缺失。 */
export type NewHomepageFirstPriorityPartialData = Partial<Omit<NewHomepageFirstPriorityData, 'pendingItems'>> & {
  pendingItems?: Partial<HomePagePendingCountVO> | null
}

/** 首页视频配置 */
export interface HomePageVideo {
  title: string
  subTitle: string
  videoCover: string
  videoUrl: string
}

/** 新首页-首屏高优先级数据 */
export interface NewHomepageFirstPriorityData {
  /** 是否是旧客户 0-新客 1-老客 */
  oldUser: number
  /** 是否展示物流概况模块 */
  showLogistics: boolean
  /** 是否展示业务概况模块 */
  showBusiness: boolean
  /** 是否展示费用支付（待办事项） */
  showPayment: boolean
  /** 是否展示付款授权（待办事项） */
  showPayAuth: boolean
  /** 是否展示权限审批（待办事项） */
  showAuth: boolean
  /** 是否展示运单审批（待办事项） */
  showWaybill: boolean
  /** 物流概况 + 揽收概况 */
  logisticsOverview?: {
    /** 物流概况 */
    logisticsOverviewVO: LogisticsOverviewVO
    /** 揽收概况（待揽件/待签收运单） */
    receivingOverviewVO: ReceivingOverviewVO
  }
  /** 业务概况 */
  businessOverview: HomePageBusinessProfileVO[]
  /** 待办事项 */
  pendingItems: HomePagePendingCountVO
  /** 留资信息 */
  applyCustomerInfo: {
    /** 留资标识：10-留资，20-非留资 */
    resourceFlag: string
    activityList: {
      /** 31-新客留资送券，32-新客查询时效送券 */
      receiveSource: number
      activity: {
        activityId: number | string
        couponCount: number
      } | null
    }[]
  } | null
  /** 专属权益活动列表 */
  activityList: HomePageActivityVO[] | null
}

/** 新首页-默认寄件模板 */
export interface NewHomepageShippingTemplate {
  /** 是否默认模板 */
  default: boolean
  /** 模板标题 */
  title: string
  senderName: string
  /** 寄件人手机号 */
  senderPhone: string
  receiveName: string
  receivePhone: string
  sendAddress: string
  receiveAddress: string
  payMode: string
  serviceMode: string
  goodsType: string
  addedService: string
}

/** 新首页-默认批量导入模板 */
export interface NewHomepageBatchImportTemplate {
  /** 是否默认模板 */
  default: boolean
  name: string
  remark: string
}

/** 新首页-次优先级数据 */
export interface NewHomepageSecondPriorityData {
  /** 问候卡片 */
  greeting: {
    /** 用户名 */
    userName: string
    /** 问候文案 */
    content: string
  }
  /** 是否关注公众号 1-已关注 */
  subscribe: number
  /** 了解跨越视频列表（实际下发为数组，结构与 Apollo videoConfig 同构） */
  profile: HomePageVideo[] | null
  /** 行业解决方案 CMS 配置（JSON 字符串，实际下发为纯数组） */
  solutionCmsConfig: string
  /** 默认寄件模板 */
  shippingTemplate?: NewHomepageShippingTemplate | null
  /** 默认批量导入模板 */
  batchImportTemplate?: NewHomepageBatchImportTemplate | null
  /** 最新消息列表 */
  userMessageList: UserMessageVO[]
}

/** 新首页-轻应用数据 */
export interface NewHomepageLightApplicationData {
  /** 老客轻应用列表（常用功能） */
  oldCustomerApplication: LightApplicationInfoListVO[]
  /** 营销轻应用列表（营销卡片） */
  marketingApplication: LightApplicationInfoListVO[]
  /** 新客轻应用列表 */
  newCustomerApplication: LightApplicationInfoListVO[]
}

/** 违禁品查询-物品模糊搜索结果项 */
export interface FuzzyGoods {
  /** 物品名称 */
  goodsName: string
  /** 物品性质 */
  nature: string
  /** 运输方式类型 */
  transportType: number
  /** 运输方式名称 */
  transportName: string
  /** 运输方式说明 */
  transportDesc: string
  /** 包装要求 */
  packageTypes: unknown
  /** 一级类目 */
  firstCategory: string
  id: number
  /** 下单建议 */
  customerHint: string | null
}

/** 违禁品查询-物品关键字搜索响应 */
export interface GoodsSearchData {
  /** 完全匹配的物品信息 */
  goodsInfo: FuzzyGoods | null
  /** 模糊匹配的物品列表 */
  fuzzyGoodsList: FuzzyGoods[] | null
  buttonFlag: number
}
