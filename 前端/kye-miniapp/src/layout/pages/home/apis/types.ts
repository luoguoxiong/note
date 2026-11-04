export interface BirtahdayIn {
  isNeedPopUp: boolean
  integral: number
}

export interface MailboxMsgTipsIn {
  fbId: number | string
  /** 奖励类型（40：现金；20：积分），其他无奖励 */
  rewardType: 40 | 20 | null
  rewardAmount: string | null
  count: number
  url: string
}

export interface LuckPopupIn {
  integralAmount: string
  randomId: string
}

export interface CouponTimeout {
  count: number
}

export interface CouponTimeoutIn {
  phone: string
  version: '20'
}

export interface WebUamPayAuthGetEstimateCostIn {
  /**
   * 批次号
   */
  batchNo: string
}

export interface WebUamPayAuthGetEstimateCostOut {
  /**
   * 预估运费
   */
  estimateCost?: string
}

export interface CrmActivityReq {
  /**
   * 入口类别：10-520赚积分首页吸底 20-520赚积分订单列表浮窗
   */
  category: 10 | 20
}

export interface CrmActivityRes {
  imageUrl: string
  url: string
  isShow: boolean
}

export interface WebHomeLaunchReq {
  channel: 'ios' | 'android' | 'wechatApplet' | 'alipayMini' | string
}

export interface HomeApiRes {
  waybillStat: WaybillStat
  menuList: MenuItem[]
  lightAppList: MenuItem[]
  userLabel: UserLabel
  dynamicConfig: any
  appUser: AppUser
}

export interface WaybillStat {
  waitNoticeNum: number
}

export interface MenuItem {
  applicationCode: string
  areaCode: string
  menuCode: string
  menuName: string
  menuIcon: string
  smallIcon: string
  menuBackground: string
  menuContent: string
  routePath: string
  accessMode: any
  versionNumber: string
  customizedType: number
  loginType: number
  internalStaffType: number
  customerCodeType: number
  md5: string
  dependentVersion: string
  sort: number
  versionConfigId: number
  accessOfflinePackage: number
  maxMenuCount: number
  tips: any
  buildType: any
  menuIconType: number
  menuIconContent: any
  smallIconType: number | null
  smallIconContent: string | null
  needGray: number
  grayHeader: any[] | null
  description: string | null
  versionCustomParam: any
  customParam: string
  loadAddress: string
}

export interface UserLabel {
  newCustomerFlag: string
  bindSalesFlag: string
}

export interface AppUser {
  id: number
  customerId: string
  customerCode: string
  customerShortName: string
  userType: string
  userTel: string
  userName: string
  internalColleaguesFlag: string
  helpName: string
  appGeneralizeFlag: string
  qqGeneralizeFlag: string
  weixinGeneralizeFlag: string
  source: string
  mobileScrapFlag: string
  registerTime: number
  freezeFlag: string
  scoreStatus: string
  customerPassword: string
  cityAreaCode: string
  workUnit: string
  birthday: number
  sex: string
  registerBlacklist: string
  emergencyAuthorization: string
  scoreExchangeFlag: string
  allowCheckFlag: string
  marketPhone: string
  marketName: string
  assistantName: string
  assistantPhone: string
  lastLoginTime: number
  calculationName: string
  seniorManagerName: string
}

export interface WebUamPayAuthGetDeliverCountIn {
  /**
   * 批次号
   */
  batchNo: string
}

export interface WebUamPayAuthGetDeliverCountOut {
  /**
   * 派送中数量
   */
  number?: number
}

export interface WebHomepageTaskIn {
  /**
   * 渠道
   */
  channel: string
}

export interface WebHomepageTaskOut {
  /**
   * 优惠券
   */
  coupon?: {
    /**
     * 活动id
     */
    id?: number
    /**
     * 活动编码
     */
    code?: string
    /**
     * 活动开始时间
     */
    realPushStart?: number
    /**
     * 活动结束时间
     */
    realPushEnd?: number
    /**
     * 活动状态10-草稿，20-待启动，30-进行中，40-已结束，50-已归档
     */
    status?: number
    /**
     * 券配置
     */
    couponInfoList?: Array<{
      /**
       * id
       */
      id?: number
      /**
       * 活动ID
       */
      activityId?: number
      /**
       * 优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券
       */
      type?: number
      /**
       * 优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001
       */
      code?: string
      /**
       * 减免形式;CRM营销中台-减免形式（crm_marketing_coupon_info_relief_form）。10-满减券，20-折扣券，30-直减券，40-每满N减N券 50满额折扣券
       */
      reliefForm?: number
      /**
       * 券面金额;建议直接以厘为单位保存
       */
      amount?: number
      /**
       * 优惠金额
       */
      discountAmount?: number
      /**
       * 折扣金额
       */
      deductionAmount?: number
      /**
       * 使用门槛
       */
      usingThreshold?: number
      /**
       * 减免上线
       */
      reliefLimit?: number
      /**
       * 购买价格
       */
      price?: number
      /**
       * 折扣比率；1-100整数
       */
      discountRate?: number
      /**
       * 使用产品；多个前后|分割；CRM营销中台-使用产品（crm_marketing_for_product）
       */
      forProduct?: string
      /**
       * 活动类型；1：公司活动、2：销售申请活动
       */
      activityType?: number
      /**
       * 指定使用日期; 多个英文逗号分割；CRM营销中台-指定日期（crm_marketing_specify_use_date）
       */
      specifyUseDate?: string
      /**
       * 是否限制区域；crm-通用是否 （crm_common_yes_no）。1-是，0-否
       */
      limitArea?: number
      /**
       * 始发地；以分隔
       */
      beginAddress?: string
      /**
       * 目的地；以分隔
       */
      endAddress?: string
      /**
       * 始发区号
       */
      beginAreaCode?: string
      /**
       * 目的区号
       */
      endAreaCode?: string
      /**
       * 优惠券有限期类型；CRM营销中台-优惠券有限期类型（crm_marketing_activity_coupon_info_valid_type）。10-指定日期，20-领券后生效
       */
      validType?: number
      /**
       * 有效期开始
       */
      validStart?: string
      /**
       * 有效期截止
       */
      validEnd?: string
      /**
       * 领券后多少天、多少月有效
       */
      validTime?: string
      /**
       * 领券后生效时间单位；CRM营销中台-生效时间单位（crm_marketing_activity_coupon_group_valid_time_unit）。10-天，20-月
       */
      validTimeUnit?: number
      /**
       * 兑换优惠券需消耗的积分
       */
      costIntegral?: number
      /**
       * 奖券数量
       */
      ticketNumber?: number
      /**
       * 优惠券描述
       */
      couponDesc?: string
      /**
       * 优惠券张数
       */
      ticketCount?: number
      /**
       * 绑定成功张数
       */
      bindCount?: number
      /**
       * 优惠券张数
       */
      couponCount?: number
      /**
       * 优惠券限制区域；json字符串
       */
      couponLimitArea?: string
    }>
  }
  /**
   * 券卡片有序列表（后端已排序/合并/截断，最多 3 张；无券、未登录、开关关闭或降级时为空列表）
   */
  couponCardList?: HomepageCouponCard[]
  /**
   * 每日签到
   */
  signInfo?: {
    /**
     * 签到状态
     */
    signStatus?: string
    /**
     * 签到积分
     */
    givingIntegral?: number
  }
  userLabel: {
    /**20 申请专属商务 */
    bindSalesFlag: string
  }
  waybillStat: WaybillStat
}

/**
 * 券种标识（couponCardList.couponCategory）
 */
export enum CouponCategoryEnum {
  /** 免单券 */
  Free = 10,
  /** 待领取券 */
  Receive = 20,
  /** 下单券 */
  Order = 30,
}

/**
 * 优惠券配置（couponCardList 卡内 couponInfo / couponInfoList 元素）
 */
export interface HomepageCouponInfo {
  /** 活动ID */
  activityId?: number
  /** 优惠券编码 */
  code?: string
  /** 优惠券类型：10-账单券 20-下单券 30-代金券 */
  type?: number
  /** 减免形式：10-满减 20-折扣 30-无门槛 40-每满N减N 50-满额折扣 60-新版折扣 */
  reliefForm?: number
  /** 券类型描述，原值展示 */
  reliefFormDesc?: string
  /** 券面金额 */
  amount?: number | null
  /** 使用门槛 */
  usingThreshold?: number | null
  /** 减免上限 */
  reliefLimit?: number | null
  /** 折扣比率，1-100 整数（展示折数 = (100-rate)/10） */
  discountRate?: number | null
  /** 折扣比率，0.01-100 */
  discountRatio?: string | null
  /** 优惠券描述，原值展示 */
  couponDesc?: string
  /** 有效期开始 */
  validStart?: string | null
  /** 有效期截止 */
  validEnd?: string | null
  /** 券数量（张）。券包内「xN」单券数量；外层「共N张」由前端累加本字段计算 */
  ticketNumber?: number
}

/**
 * 券区域卡片（task 接口 couponCardList 元素）
 */
export interface HomepageCouponCard {
  /** 券种标识，见 CouponCategoryEnum */
  couponCategory?: number
  /** 卡片汇总张数，单张为 1，合并后为组内券张数 */
  couponCount?: number
  /** 有效期开始（时间戳） */
  validStart?: number
  /** 有效期截止（时间戳） */
  validEnd?: number
  /** 活动ID */
  activityId?: number
  /** 活动编码 */
  activityCode?: string
  /** 优惠券类型 */
  couponType?: number
  /** 优惠券类型描述 */
  couponTypeDesc?: string
  /** 免单范围：10-全免(含增值服务费) 20-免运单运费 30-仅免增值费 */
  freeRange?: number
  /** 免单范围描述，原值展示 */
  freeRangeDesc?: string
  /** 免单总额 */
  maxTotalAmount?: number
  /** 免单票数 */
  maxCount?: number
  /** 单票免单金额上限 */
  maxAmount?: number
  /** 券标题 */
  couponTitle?: string
  /** 优惠券描述，原值展示 */
  couponDesc?: string
  /** 活动id（待领取券卡） */
  id?: number
  /** 活动编码 */
  code?: string
  /** 活动开始时间 */
  realPushStart?: number
  /** 活动结束时间 */
  realPushEnd?: number
  /** 活动状态：10-草稿 20-待启动 30-进行中 40-已结束 50-已归档 */
  status?: number
  /** 券配置（待领取券卡，券包渲染数据源） */
  couponInfoList?: HomepageCouponInfo[]
  /** 用户优惠券编码（下单券卡，「立即寄件」二次校验匹配键） */
  couponBaseCode?: string
  /** 券面金额 */
  amount?: number
  /** 优惠券信息（下单券卡） */
  couponInfo?: HomepageCouponInfo
}

export interface DailyTask {
  /**
   * 任务类型Id
   */
  id?: number
  /**
   * 任务类型code
   */
  taskTypeCode?: string
  /**
   * 任务类型名称
   */
  taskTypeName?: string
  /**
   * 任务类型Icon
   */
  taskTypeIcon?: string
  /**
   * 默认展示任务数
   */
  defaultShowNum?: number
  /**
   * 排序
   */
  sort?: number
  /**
   * 备注
   */
  remark?: string
  /**
   * 活动详情
   */
  detailList?: Array<{
    /**
     * 活动Id
     */
    id?: number
    /**
     * 任务编码
     */
    taskCode?: string
    /**
     * 任务标题
     */
    title?: string
    /**
     * 任务标题描述
     */
    titleDesc?: string
    /**
     * 任务内容描述
     */
    taskDesc?: string
    /**
     * 任务icon
     */
    taskIcon: string
    /**
     * 任务是否有状态
     */
    hasStatus?: number
    /**
     * 任务操作默认文案
     */
    gotoEnableDesc?: string
    /**
     * 任务不可操作状态文案
     */
    gotoDisableDesc?: string
    /**
     * 任务执行跳转类型：1.无操作 2.本地跳转路由 3.链接跳转 4.请求api
     */
    gotoType?: number
    /**
     * 任务跳转链接api
     */
    gotoLink?: string
    /**
     * 默认toast提示，调用apiCode成功后的默认提示语
     */
    toast?: string
    /**
     * 跳转是否前置拦截 0.无 1.拦截
     */
    beforeIntercept?: number
    /**
     * 拦截请求Api
     */
    beforeApi?: string
    /**
     * 排序，倒序
     */
    sort?: number
    /**
     * 任务状态, 1.进行中 2.已完成
     */
    taskStatus?: number
  }>
}

export interface WebHomepageCouponReceiveIn {
  /**
   * 活动ID
   */
  activityId?: number
  /**
   * 领取来源
   */
  from?: number
}

export type WebHomepageCouponReceiveOut = number

export type WebHomepageCmsConfigIn = any

export interface WebHomepageCmsConfigV2 {
  category?: 'MOBILE_HOME_PAGE_CMS'
  moduleCode?: string
}

export interface WebHomepageCmsConfigOut {
  /**
   * cms 配置列表
   */
  configs?: Array<{
    /**
     * 模块编码
     */
    moduleCode: string
    /**
     * cms内容
     */
    cmsContent: string
  }>
}

export interface WebMarketingIntegralSignIntegralIn {
  /**
   * 任务id
   */
  taskId: number
  /**
   * 客户编码
   */
  customerCode?: string
  /**
   * 积分来源，1-ios,2-安卓，3-小程序, 4-pc
   */
  source: number
}

export type WebMarketingIntegralSignIntegralOut = any

export interface WebHomepageTabIn {
  /**
   * 页签编码
   */
  tabCode: string
  /**
   * alipayMini，android，ios，pc，wechatApplet
   */
  channel: string
}

export interface WebHomepageTabOut {
  /**
   * 唯品订单信息
   */
  wpOrder?: {
    /**
     * 获取唯品JIT消息数(待确认数)
     */
    messageCount?: number
    /**
     * 最新待确认批次信息
     */
    latestBatchInfo?: {
      /**
       * 跨越批次号（生成二维码时使用该批次号）
       */
      batchNo?: string
      /**
       * 唯品批次号
       */
      vipBatchNo?: string
      /**
       * 二维码状态（0：初始（表示待确认的数据）  1：成功 2：失败）
       */
      qrCodeState?: number
      /**
       * 收件仓库（收件地）
       */
      vipWarehouse?: string
      /**
       * 始发城市
       */
      startCity?: string
      /**
       * 运单票数
       */
      waybillCount?: number
    }
  }
  /**
   * 最新运单
   */
  latestWaybill?: any
  /**
   * 待办事项
   */
  pendingItem?: any

  mobilePaymentResp: WebHomepagePaymentOut
}

export type WebHomepagePaymentIn = any

export interface WebHomepagePaymentOut {
  /**
   * 运单号
   */
  waybillNumber?: string
  /**
   * 纳入月份（0 账单）
   */
  inMonth?: string
  /**
   * 原始月份
   */
  orgInMonth?: string
  /**
   * 服务方式
   */
  serviceMethod?: string
  /**
   * 寄件时间
   */
  deliveryTime?: string
  /**
   * 寄件城市
   */
  deliveryCity?: string
  /**
   * 寄件人
   */
  sender?: string
  /**
   * 收件城市
   */
  pickupCity?: string
  /**
   * 收件人
   */
  receiver?: string
  /**
   * 未支付金额
   */
  unPaidAmt?: string
  /**
   * 应收金额（0 账单）
   */
  netReceiptsAmt?: string
  /**
   * 单据类型
   */
  billType?: number
  /**
   * 结算方式
   */
  payMode?: string
  /**
   * 单量（0 账单）
   */
  waybillCount?: string
  /**
   * 跳转地址
   */
  directUrl?: string
  /**
   * 更多跳转地址
   */
  moreDirectUrl?: string
}

export interface WebOrderWaybillWaybillDraftBatchEstimateCostIn {
  /**
   * 查询人手机
   */
  mobile: string
  /**
   * 客户编码
   */
  customerCode: string
  /**
   * 类型 10.需调价审核，20.需运单审核
   */
  type: number
  /**
   * 是否需要优惠券减免金额
   */
  needCouponReduce?: boolean
  /**
   * 运单号
   */
  waybillNumbers: string[]
}

export type WebOrderWaybillWaybillDraftBatchEstimateCostOut = Array<{
  /**
   * 优惠券减免金额
   */
  couponReduceAmount?: number
  /**
   * 优惠后金额(折后金额)
   */
  amountAfterDiscount?: number
  /**
   * 唯一标识（和请求参数对应）
   */
  onlyOne?: string
  /**
   * 单条成功失败标识： true 成功， false失败
   */
  successFlag?: boolean
  /**
   * 失败错误信息
   */
  errorMsg?: string
  /**
   * 费用响应参数
   */
  feeResponse?: {
    /**
     * 运单运费
     */
    waybillAmount?: number
    /**
     * 折前运费
     */
    beforeDiscountAmount?: number
    /**
     * 增值费
     */
    addedValueAmount?: number
    /**
     * 总计
     */
    totalAmount?: number
    /**
     * 回单费
     */
    receiptMoneyFee?: number
    /**
     * 保价服务费
     */
    statementPriceFee?: number
    /**
     * 代收货款服务费
     */
    collectionFee?: number
    /**
     * 夜间取货费
     */
    nightPickupFee?: number
    /**
     * 超长费
     */
    overLengthFee?: number
    /**
     * 木架费
     */
    woodenFrameFee?: number
    /**
     * 超区费
     */
    superAreaFee?: number
    /**
     * 调价费
     */
    offerAdjustPrice?: number
    /**
     * 附加费
     */
    surchargeAmount?: number
    /**
     * 奖券描述
     */
    prizeDesc?: string
    /**
     * 保费来源(10-默认保费 20-强制保费 30-声明价值保费 40-按件投保)
     */
    premiumSource?: number
    /**
     * 运费公式
     */
    freightFormula?: {
      /**
       * 收费形式,（数据字典Key）  crm_charge_type
       */
      chargeType?: string
      /**
       * 收费形式描述
       */
      chargeDesc?: string
      /**
       * 计费提示
       */
      feeWeightTips?: string
      /**
       * 运费计算公式
       */
      freightFormula?: string
      /**
       * 增值费计算公式
       */
      valueAddedFeeFormula?: string
      /**
       * 总费用公式
       */
      totalFeeFormula?: string
      /**
       * 举例说明列表
       */
      amountExampleList?: Array<{
        /**
         * 区间起始值
         */
        start?: number
        /**
         * 区间结束值
         */
        end?: number
        /**
         * 区间价格
         */
        price?: number
        /**
         * 顺序
         */
        index?: number
      }>
      /**
       * 举例说明备注
       */
      exampleRemark?: string
      /**
       * 举例公式
       */
      exampleFormula?: string
    }
    /**
     * 单票最低收费
     */
    singleLowestAmount?: number
    /**
     * 最低批次收费
     */
    lowestBatchCharge?: number
    /**
     * 开通小件且物品重量小于等于5KG 10是 20否
     */
    smallFlag?: number
  }
}>

export interface WebHomepagePendingItemIn {
  /**
   * 事项编码
   */
  itemCode?: string
}
export type WebHomepagePendingItemOut = Array<{
  /**
   * 事项名称
   */
  itemName?: string
  /**
   * 事项编码
   */
  itemCode?: string
  /**
   * 数量
   */
  count?: number
  /**
   * 待办详情
   */
  itemDetail?: object
}>

export interface WebQueryWaybillGetWarehousingPriceIn {
  /**
   * 运单号
   */
  waybillNumber: string
  /**
   * 请求来源 10列表 20路由
   */
  requestSource?: number
}

export interface WebQueryWaybillGetWarehousingPriceOut {
  /**
   * 单条数据成功失败标识
   */
  successFlag?: boolean
  /**
   * 错误提示信息
   */
  errorMsg?: string
  /**
   * 报关退仓总手续费---报关手续费+退仓手续费
   */
  totalAmount?: string
  /**
   * 报关手续费（收件地址匹配的上调额度）
   */
  fenceAmount?: string
  /**
   * 退仓手续费（寄件地址匹配的上调额度）
   */
  warehouseAmount?: string
  /**
   * 异常操作总费 --- 报关异常操作费+退仓异常操作费
   */
  excTotalAmount?: string
  /**
   * 报关异常操作费 --- 收件地址匹配的异常操作费
   */
  excFenceAmount?: string
  /**
   * 退仓异常操作费 --- 寄件地址匹配的异常操作费
   */
  excWarehouseAmount?: string
  /**
   * 报关退仓手续费提示（入仓调价提示）
   */
  fenceTips?: string
  /**
   * 异常操作费提示 --- 同时匹配到多个提示语是，优先取收件地址匹配到的配置的提示语
   */
  excTips?: string
  /**
   * 寄件地址区域ID
   */
  sendRegionId?: string
  /**
   * 收件地址区域ID
   */
  endRegionId?: string
  /**
   * 路由是否需要自动弹窗
   */
  isNeedPop?: boolean
  /**
   * 入仓调价提示富文本
   */
  fenceTipsText?: string
  /**
   * 异常操作提示富文本
   */
  excTipsText?: string
  /**
   * 入仓调价提示H5
   */
  fenceTipsH5?: string
  /**
   * 异常操作费提示H5
   */
  excTipsH5?: string
}

export interface HomePagePopup {
  luckyCustomerPop: LuckPopupIn
  mailboxMsgTips: MailboxMsgTipsIn
  birthdayPopUpVO: BirtahdayIn
  timeoutCouponCount: number
}

export interface UserInfoByPhone {
  subscribe: number
  loginStatus: number
  subscribeTime: number
  phone: string
  jgId: string
  deviceCode: string
}

export interface NewCustomerActivityReq {
  channel: 'ios' | 'android' | 'pc' | 'wechatApplet' | 'lark' | 'amap' | 'alipay'
  /** 10-新客首页,20-二级页 */
  scene: '10' | '20' | '30'
  /** 否校验新老客 1-是 0-否 */
  checkNewCustomer: '0' | '1'
}

export interface NewCustomerActivityRes {
  /** 10-留资 20-非留资 */
  resourceFlag: string
  activityList: ActivityItem[]
  videoConfig: Array<{
    title: string
    subTitle: string
    videoCover: string
    videoUrl: string
  }>
}

export interface ActivityItem {
  /** 送券类型 31-新客留资送券，32-新客查询时效送券 */
  receiveSource: number
  activity: Activity
}

export interface Activity {
  activityId: number
  couponCount: number
}
