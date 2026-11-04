/* eslint-disable complexity */
/**
 * @Desc: home 首页 store (pinia)
 * 由 src/store/modules/home (vuex) 迁移而来，保持对外暴露的状态/动作与迁移前一致。
 */
import { computed, reactive, toRefs } from 'vue'
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import {
  getAdvertisementDetails,
  // getAuthApprovalList,
  // getBusinessOverview,
  getCommonFunction as apiGetCommonFunction,
  getCouponList as apiGetCouponList,
  getFirstPriorityData,
  getLightApplicationData,
  // getLogisticsOverview,
  // getPayAuthList,
  // getPayment,
  // getPendingItems as apiGetPendingItems,
  getSecondPriorityData,
  // getWayBillApprovalList,
  parseBusinessOverview,
  // getBusinessOverview,
  // getLogisticsOverview,
} from '@/apis/home'
import {
  TodoTabEnum,
  FirstPrioritySearchType,
  SecondPrioritySearchType,
  type AdvertisementFloatDto,
  type BannerData,
  type BannerRes,
  type HomeGreetingVO,
  type HomePageActivityVO,
  type HomePageBusinessProfileVO,
  type HomePagePendingCountVO,
  type LightApplicationInfoListVO,
  type LogisticsOverviewVO,
  type HomePageVideo,
  type NewHomepageBatchImportTemplate,
  type NewHomepageFirstPriorityData,
  type NewHomepageLightApplicationData,
  type NewHomepageSecondPriorityData,
  type NewHomepageShippingTemplate,
  type ReceivingOverviewVO,
  type UserMessageVO,
} from '@/apis/home/types'
import { ReportAppTimeEnum, report } from '@/utils/reportApp'
import { SessionStorageManager, LocalStorageManager } from '@/utils/storageManager'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'
import type { Options } from '@/types'

/** 首页加载状态等基础信息 */
export interface HomeStatus {
  /** 加载ModuleState数据是否失败 */
  isLoadFail: boolean
  /** 加载数据中，显示骨架屏 */
  isFetching: boolean
  /** 加载优惠卷信息 */
  isFetchingCoupon: boolean
  /** 公司业务概况角色 -1 数据异常 1:作为寄方 2:作为收方 3:作为付款方*/
  activeTab: '' | 1 | 2 | 3
  /** 公司业务概况角色Select数据 */
  businessLables: Options[]
  /** 运单统计模块loading */
  businessLoading: boolean
  /** 运单统计某块是否异常 */
  businessIsFail: boolean
  /** 常用功能loading */
  commonFunctionLoading: boolean
  /** 待办事项是否在加载中 */
  todoIsLoading: boolean
  /** 关于跨越信息 */
  keyInfo: KeyInfo | undefined
  /** 是否是旧客户 */
  oldUser: number | undefined
  /** 是否匹配销售 */
  bindSalesFlag: string
}

export interface KeyInfo {
  officialWebsite: string
  subModule: KeyInfoItem[]
}

export interface KeyInfoItem {
  content: string
  imgUrl: string
  title: string
  viewMoreUrl: string
}

export interface TodoTabs {
  label: string
  value: TodoTabEnum
}

/**
 * 首页模块数据（moduleData）。
 * 注意：接口返回的 businessOverview 实际为列表，故这里以数组类型描述真实运行数据。
 */
export interface HomeModuleData {
  /** 物流概况 */
  logisticsOverview: LogisticsOverviewVO | undefined
  /** 揽收概况 */
  receivingOverview: ReceivingOverviewVO | undefined
  /** 业务概况 */
  businessOverview: HomePageBusinessProfileVO[] | undefined
  /** 待办事项 */
  pendingItems: HomePagePendingCountVO | undefined
  /** 专属权益数据 */
  activityList: HomePageActivityVO[] | undefined
  /** 常用功能 */
  commonFunction: LightApplicationInfoListVO[] | undefined
  /** 最新消息 */
  latestMessageList: UserMessageVO[] | undefined
}

/** 首页 store 全量状态（迁移前 vuex 的 HomeState 即为扁平结构，此处保持一致） */
export interface HomeState extends HomeStatus {
  /** 留资信息与对应送券活动 */
  applyCustomerInfo: NewHomepageFirstPriorityData['applyCustomerInfo']
  /** 模块数据 */
  moduleData: HomeModuleData
  /** banner数据 */
  bannerData: BannerData[]
  /** 悬浮广告数据（advertisementType 70） */
  floatAdData: { advertisementCode: string; advertisementFloatDto: AdvertisementFloatDto }[]
  /** 弹窗广告区域数据（advertisementType 20），供首页精准通知弹窗复用，避免重复请求 */
  popupAdData: BannerRes | null
  /** 是否有线索采集 */
  hasLeadCapture: boolean
  /** 是否有线索采集活动 */
  hasLeadCaptureActivity: boolean
  /** 问候卡片数据 */
  greetingData: HomeGreetingVO | undefined
  /** 是否关注公众号 */
  isCandidate: boolean
  /** 寄件模板 */
  shippingTemplate: NewHomepageShippingTemplate | null
  /** 批量导入模板 */
  batchImportTemplate: NewHomepageBatchImportTemplate | null
  /** 行业解决方案 */
  industryInfo: unknown[]
  /** 了解跨越视频列表（新首页次优先级接口下发） */
  aboutVideo: HomePageVideo[]
  /** 营销卡片轻应用列表（新首页轻应用接口下发） */
  marketingApplication: LightApplicationInfoListVO[]
  /** 新客轻应用列表（新首页轻应用接口下发，新客户推荐功能） */
  newCusomerApplication: LightApplicationInfoListVO[]
  /** 是否展示物流概况模块（新首页首屏高优先级接口下发） */
  showLogistics: boolean
  /** 是否展示业务概况模块（新首页首屏高优先级接口下发） */
  showBusiness: boolean
  /** 是否展示费用支付tab-待办事项（新首页首屏高优先级接口下发） */
  showPayment: boolean
  /** 是否展示付款授权tab-待办事项（新首页首屏高优先级接口下发） */
  showPayAuth: boolean
  /** 是否展示权限审批tab-待办事项（新首页首屏高优先级接口下发） */
  showAuth: boolean
  /** 是否展示运单审批tab-待办事项（新首页首屏高优先级接口下发） */
  showWaybill: boolean
}

/** 首页持久化缓存字段（仅数据字段，不含 loading/失败等瞬态状态） */
const HOME_CACHE_KEYS = [
  'applyCustomerInfo',
  'moduleData',
  'greetingData',
  'isCandidate',
  'shippingTemplate',
  'batchImportTemplate',
  'industryInfo',
  'aboutVideo',
  'marketingApplication',
  'newCusomerApplication',
  'oldUser',
  'bindSalesFlag',
  'activeTab',
  'businessLables',
  'showLogistics',
  'showBusiness',
  'showPayment',
  'showPayAuth',
  'showAuth',
  'showWaybill',
] as const

/** 首页持久化缓存数据 */
export type HomeCacheData = Pick<HomeState, (typeof HOME_CACHE_KEYS)[number]>

export const useHomeStore = defineStore('home', () => {
  // ==================== state ====================
  /**
   * 全量状态：单个 reactive 扁平对象（内部访问 state.xxx）。
   * 对外通过 ...toRefs(state) 摊平暴露，消费方仍按单字段 ref 使用，与迁移前保持一致。
   */
  const state = reactive<HomeState>({
    /** 模块数据 */
    moduleData: {
      logisticsOverview: undefined,
      receivingOverview: undefined,
      businessOverview: undefined,
      pendingItems: undefined,
      activityList: [],
      commonFunction: [],
      latestMessageList: [],
    },
    /** 加载数据是否失败 */
    isLoadFail: false,
    /** 加载数据中，显示骨架屏 */
    isFetching: true,
    /** banner数据 */
    bannerData: [],
    /** 悬浮广告数据（advertisementType 70） */
    floatAdData: [],
    /** 弹窗广告区域数据（advertisementType 20），供首页精准通知弹窗复用，避免重复请求 */
    popupAdData: null,
    /** 加载优惠卷信息 */
    isFetchingCoupon: false,
    /** 公司业务概况角色 */
    activeTab: '',
    /** 公司业务概况角色Select数据 */
    businessLables: [],
    /** 运单统计模块loading */
    businessLoading: false,
    /** 运单统计某块是否异常 */
    businessIsFail: false,
    /** 待办事项是否在加载中 */
    todoIsLoading: false,
    /** 常用功能loading */
    commonFunctionLoading: false,
    /** 关于跨越信息 */
    keyInfo: undefined,
    /** 是否是旧客户 */
    oldUser: undefined,
    applyCustomerInfo: null,
    /** 是否匹配销售 */
    bindSalesFlag: '20',
    /** 是否有线索采集 */
    hasLeadCapture: false,
    /** 是否有线索采集活动 */
    hasLeadCaptureActivity: false,
    /** 问候卡片数据 */
    greetingData: undefined,
    /** 是否关注公众号（默认视为已关注，待次优先级接口确认 subscribe=0 后才展示关注公众号模块） */
    isCandidate: true,
    /** 寄件模板 */
    shippingTemplate: {
      title: '',
      senderPhone: '',
      default: false,
      senderName: '',
      receiveName: '',
      receivePhone: '',
      sendAddress: '',
      receiveAddress: '',
      payMode: '',
      serviceMode: '',
      goodsType: '',
      addedService: '',
    },
    /** 批量导入模板 */
    batchImportTemplate: {
      default: false,
      name: '',
      remark: '',
    },
    /** 行业解决方案 */
    industryInfo: [],
    /** 了解跨越视频列表（新首页次优先级接口下发） */
    aboutVideo: [],
    /** 营销卡片轻应用列表（新首页轻应用接口下发） */
    marketingApplication: [],
    /** 新客轻应用列表（新首页轻应用接口下发，新客户推荐功能） */
    newCusomerApplication: [],
    /** 是否展示物流概况模块（新首页首屏高优先级接口下发） */
    showLogistics: true,
    /** 是否展示业务概况模块（新首页首屏高优先级接口下发） */
    showBusiness: true,
    /** 是否展示费用支付tab-待办事项（新首页首屏高优先级接口下发） */
    showPayment: true,
    /** 是否展示付款授权tab-待办事项（新首页首屏高优先级接口下发） */
    showPayAuth: true,
    /** 是否展示权限审批tab-待办事项（新首页首屏高优先级接口下发） */
    showAuth: true,
    /** 是否展示运单审批tab-待办事项（新首页首屏高优先级接口下发） */
    showWaybill: true,
  })

  // ==================== 持久化缓存 ====================
  /** 是否已有可展示的模块数据（命中缓存或已加载成功） */
  let hasModuleData = false

  /** 从 localStorage 恢复首页缓存，命中则首屏直接渲染缓存数据 */
  function loadCache() {
    try {
      const cache = LocalStorageManager.get('homeCache') as Record<string, unknown> | null
      if (!cache) return
      // 广告数据（banner/弹窗/悬浮）不持久化，忽略历史缓存中的残留值
      delete cache.bannerData
      delete cache.popupAdData
      delete cache.floatAdData
      Object.assign(state, cache)
      hasModuleData = true
      // 命中缓存：不展示骨架屏，接口静默刷新
      state.isFetching = false
    } catch {
      // 缓存解析失败则忽略，走正常加载流程
    }
  }

  /** 将数据字段写入 localStorage 缓存 */
  function saveCache() {
    try {
      const cache = {} as Record<string, unknown>
      HOME_CACHE_KEYS.forEach((key) => {
        cache[key] = state[key]
      })
      LocalStorageManager.save('homeCache', cache as HomeCacheData)
    } catch {
      // 缓存写入失败则忽略
    }
  }

  // 初始化时优先加载缓存
  if (getToken() && sessionStorage.getItem('homeReadyToken') === getToken()) loadCache()

  // ==================== getters ====================
  /** 首页状态聚合（骨架屏/失败/权限变化/各 loading） */
  const homeStatus = computed<HomeStatus>(() => ({
    isLoadFail: state.isLoadFail,
    isFetching: state.isFetching,
    isFetchingCoupon: state.isFetchingCoupon,
    activeTab: state.activeTab,
    businessLables: state.businessLables,
    businessLoading: state.businessLoading,
    businessIsFail: state.businessIsFail,
    commonFunctionLoading: state.commonFunctionLoading,
    todoIsLoading: state.todoIsLoading,
    keyInfo: state.keyInfo,
    oldUser: state.oldUser,
    bindSalesFlag: state.bindSalesFlag,
  }))

  /** 待办事项 */
  const pendingItems = computed<HomePagePendingCountVO | undefined>(() => state.moduleData.pendingItems)
  /** 专属权益列表 */
  const couponData = computed<HomePageActivityVO[]>(() => state.moduleData.activityList || [])
  /** 最新消息 */
  const latestMessageList = computed<UserMessageVO[]>(() => state.moduleData.latestMessageList || [])
  /** 常用功能 */
  const commonFunction = computed<LightApplicationInfoListVO[]>(() => state.moduleData.commonFunction || [])
  /** 业务概况 */
  const businessOverview = computed<HomePageBusinessProfileVO[] | undefined>(() => state.moduleData.businessOverview)
  /** 物流概况 */
  const logisticsOverview = computed<LogisticsOverviewVO | undefined>(() => state.moduleData.logisticsOverview)
  /** 揽收概况 */
  const receivingOverview = computed<ReceivingOverviewVO | undefined>(() => state.moduleData.receivingOverview)
  /** 是否是新客户且未匹配销售（专属权益入口判断） */
  const isExclusive = computed(() => state.oldUser === 0 && state.bindSalesFlag === '20')

  /** 将三个新首页接口数据写入 store（首屏加载与权限变更后的全量刷新共用） */
  /** 是否已完成过一次待办数据加载（用于区分首次定位与再次进入保持现状） */
  let hasLoadedPendingItems = false

  /**
   * 根据新接口数据判断待办 tab 是否可保持现状：
   * tab 未被接口开关隐藏，且该分类下仍有待办内容，才保持当前定位。
   */
  function canKeepPendingTab(pending: HomePagePendingCountVO, locateTo: TodoTabEnum): boolean {
    const showFlagMaps: Record<TodoTabEnum, boolean> = {
      [TodoTabEnum.PAYMENT]: state.showPayment,
      [TodoTabEnum.PAY_AUTH]: state.showPayAuth,
      [TodoTabEnum.AUTH_APPROVAL]: state.showAuth,
      [TodoTabEnum.WAYBILL_APPROVAL]: state.showWaybill,
    }
    if (!showFlagMaps[locateTo]) return false
    const hasContentMaps: Record<TodoTabEnum, boolean> = {
      [TodoTabEnum.PAYMENT]: !!pending.paymentVO,
      [TodoTabEnum.PAY_AUTH]: (pending.payAuthCount || 0) > 0,
      [TodoTabEnum.AUTH_APPROVAL]: (pending.authApprovalCount || 0) > 0,
      [TodoTabEnum.WAYBILL_APPROVAL]: (pending.wayBillApprovalCount || 0) > 0,
    }
    return hasContentMaps[locateTo]
  }

  function applyNewHomepageData(
    firstData: NewHomepageFirstPriorityData,
    secondData: NewHomepageSecondPriorityData,
    lightData: NewHomepageLightApplicationData
  ) {
    // ===== 首屏高优先级数据 =====
    // 是否老客
    state.oldUser = firstData.oldUser
    state.applyCustomerInfo = firstData.applyCustomerInfo ?? null
    state.bindSalesFlag = firstData.applyCustomerInfo?.resourceFlag ?? '20'
    // 物流概况/业务概况模块展示开关
    state.showLogistics = firstData.showLogistics
    state.showBusiness = firstData.showBusiness
    // 待办事项各 tab 展示开关（接口可能下发 null，统一归一化：null 视为 false，隐藏对应 tab）
    state.showPayment = firstData.showPayment ?? false
    state.showPayAuth = firstData.showPayAuth ?? false
    state.showAuth = firstData.showAuth ?? false
    state.showWaybill = firstData.showWaybill ?? false
    // 物流概况 + 揽收概况
    state.moduleData.logisticsOverview = firstData.logisticsOverview?.logisticsOverviewVO
    state.moduleData.receivingOverview = firstData.logisticsOverview?.receivingOverviewVO
    // 业务概况 + 角色 tab / 下拉选项
    const businessData = Array.isArray(firstData.businessOverview) ? firstData.businessOverview : []
    state.moduleData.businessOverview = businessData
    const { activeTab: tab, labels } = parseBusinessOverview(businessData)
    state.activeTab = tab as '' | 1 | 2 | 3
    state.businessLables = labels
    // 待办事项 tab 定位：首次加载跟随接口 locateTo；
    // 再次进入重拉数据时，若当前 tab 在新数据中仍有待办且未被隐藏，则保持现状，否则回退接口定位
    const previousLocateTo = state.moduleData.pendingItems?.locateTo
    state.moduleData.pendingItems = firstData.pendingItems
    if (firstData.pendingItems) {
      if (hasLoadedPendingItems && previousLocateTo && canKeepPendingTab(firstData.pendingItems, previousLocateTo)) {
        firstData.pendingItems.locateTo = previousLocateTo
      }
      hasLoadedPendingItems = true
    }
    state.moduleData.activityList = firstData.activityList || []

    // ===== 次优先级数据 =====
    if (secondData.greeting) {
      // content 映射到 greetingDesc，问候卡片组件无需改动
      state.greetingData = secondData.greeting
    }
    // 关注公众号模块显隐：接口 subscribe 字段 0-未关注（展示）/ 1-已关注（隐藏）；
    // 仅在确认未关注（subscribe === 0）时展示，已关注或字段缺失均不展示
    state.isCandidate = secondData.subscribe !== 0
    // 了解跨越视频（数组，与 Apollo videoConfig 同构）
    state.aboutVideo = secondData.profile || []
    // 行业解决方案（接口下发 JSON 字符串，实际为 CMS 配置纯数组）
    if (secondData.solutionCmsConfig) {
      try {
        const parsed = JSON.parse(secondData.solutionCmsConfig)
        state.industryInfo = Array.isArray(parsed) ? parsed : []
      } catch (error) {
        state.industryInfo = []
      }
    }
    // 寄件模板 / 批量导入模板
    if (secondData.shippingTemplate) {
      state.shippingTemplate = secondData.shippingTemplate
    }
    if (secondData.batchImportTemplate) {
      state.batchImportTemplate = secondData.batchImportTemplate
    }
    // 最新消息
    state.moduleData.latestMessageList = secondData.userMessageList || []

    // ===== 轻应用数据 =====
    // 营销卡片
    state.marketingApplication = lightData.marketingApplication || []
    // 新客户推荐功能
    state.newCusomerApplication = lightData.newCustomerApplication || []
    // 常用功能：老客取老客轻应用，新客取新客轻应用
    state.moduleData.commonFunction = lightData.oldCustomerApplication || []
  }

  /** 根据运单统计子模块刷新业务概况/物流概况数据（不含模块信息重拉） */
  async function refreshOverview() {
    state.businessIsFail = false
    state.businessLoading = true
    // searchType=10 同时返回业务概况和物流概况，替代原来两个独立查询。
    const { data } = await getFirstPriorityData(FirstPrioritySearchType.OVERVIEW)
    state.businessLoading = false
    // 保留旧业务概况接口的空数组兜底，供角色选项解析使用。
    const businessData = Array.isArray(data.businessOverview) ? data.businessOverview : []
    const { activeTab, labels } = parseBusinessOverview(businessData)
    state.businessLables = labels
    state.activeTab = activeTab as '' | 1 | 2 | 3
    state.moduleData.businessOverview = businessData
    state.moduleData.logisticsOverview = data.logisticsOverview?.logisticsOverviewVO
    state.moduleData.receivingOverview = data.logisticsOverview?.receivingOverviewVO
  }

  /** 切换推荐配置 Tab 时仅刷新对应模板，空响应清除旧模板。 */
  async function refreshTemplate(searchType: SecondPrioritySearchType) {
    const { data } = await getSecondPriorityData(searchType)
    if (searchType === SecondPrioritySearchType.SHIPPING_TEMPLATE) {
      state.shippingTemplate = data.shippingTemplate ?? null
    } else {
      state.batchImportTemplate = data.batchImportTemplate ?? null
    }
  }

  async function refreshCouponList() {
    state.isFetchingCoupon = true
    try {
      const { data } = await apiGetCouponList()
      state.moduleData.activityList = data || []
    } finally {
      state.isFetchingCoupon = false
    }
  }

  async function fetchCommonFunction() {
    state.commonFunctionLoading = true
    const { data } = await apiGetCommonFunction()
    state.moduleData.commonFunction = data
    state.commonFunctionLoading = false
  }

  // ==================== actions ====================
  /** 加载首页模块数据 */
  async function getHomeModuleData() {
    const requestToken = getToken()
    const isLogin = !!requestToken && sessionStorage.getItem('homeReadyToken') !== requestToken
    const userStore = useUserStore()
    if (isLogin && userStore.isInitialized && !userStore.user) userStore.reset()
    try {
      // 已有缓存数据时不展示骨架屏，静默刷新
      state.isFetching = !hasModuleData
      state.isLoadFail = false
      report(ReportAppTimeEnum.moduleApiStartTime)
      // 模块数据由三个新首页接口（首屏高优先级/次优先级/轻应用）提供
      const [{ data: firstData }, { data: secondData }, { data: lightData }, user] = await Promise.all([
        getFirstPriorityData(),
        getSecondPriorityData(),
        getLightApplicationData(),
        isLogin ? userStore.init() : Promise.resolve(null),
      ])
      // 切换账号后，旧会话的迟到响应不得覆盖页面或写入新账号缓存。
      if (requestToken !== getToken()) return
      if (isLogin && !user) throw new Error('登录用户信息加载失败')
      report(ReportAppTimeEnum.moduleApiEndTime)
      // 应用新首页接口数据
      applyNewHomepageData(firstData, secondData, lightData)
      // 接口成功响应后写入缓存
      saveCache()
      if (requestToken) sessionStorage.setItem('homeReadyToken', requestToken)
      hasModuleData = true
      state.isFetching = false
      state.isLoadFail = false
    } catch (error) {
      if (requestToken !== getToken()) return
      report(ReportAppTimeEnum.moduleApiFailTime)
      state.isFetching = false
      // 已有缓存数据时刷新失败仍展示缓存，不进入失败态
      state.isLoadFail = !hasModuleData
    }
  }

  /** 获取顶部banner */
  async function getBannerData() {
    const { data } = await getAdvertisementDetails({
      channelCode: 'pc',
      pageCode: 'homePage_pc',
      adTypeList: ['10', '20', '70'],
      latestUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    })
    const bannerSource = data?.find((item) => item.areaStyleCode === 'PC_BANNER_008')?.detailsList.splice(0, 5) || []
    const bannerDatas = bannerSource.map((item) => {
      return {
        ...item.advertisementBannerDto,
        advertisementTitle: item.advertisementTitle,
        advertisementCode: item.advertisementCode,
      }
    })
    state.bannerData = bannerDatas
    // 精准通知弹窗（advertisementType 20）：供首页 MessagePopup 复用，避免单独再请求一次接口
    state.popupAdData = data?.find((item) => item.advertisementType === '20') || null
    // 悬浮广告（advertisementType 70）
    const floatAreas = (data || []).filter((item) => item.advertisementType === '70')
    state.floatAdData = floatAreas
      .flatMap((item) => item.detailsList || [])
      .filter((item) => !!item.advertisementFloatDto)
      .map((item) => ({
        advertisementCode: item.advertisementCode,
        pushToStyle: item.pushToStyle,
        advertisementFloatDto: item.advertisementFloatDto as AdvertisementFloatDto,
      }))
  }

  /** 刷新专属权益（优惠券） */
  async function updateCouponList() {
    await refreshCouponList()
  }

  /** 获取常用功能 */
  async function getCommonFunction() {
    await fetchCommonFunction()
  }

  /** 刷新常用功能 */
  async function refreshCommonFunction() {
    await fetchCommonFunction()
  }

  /** 获取待办事项；一级接口不传 searchType 时返回完整待办数据。 */
  async function getPendingItems() {
    state.todoIsLoading = true
    // 不传 searchType 会返回一级全量数据；这里只读取 pendingItems，不更新其他模块。
    const { data } = await getFirstPriorityData()
    state.todoIsLoading = false
    state.moduleData.pendingItems = data.pendingItems || undefined
    if (data.pendingItems) SessionStorageManager.save('todoTab', data.pendingItems.locateTo)
  }

  /** 刷新待办事项（保持历史 tab 定位） */
  async function refreshPendingItems() {
    state.todoIsLoading = true
    const { data } = await getFirstPriorityData()
    state.todoIsLoading = false
    state.moduleData.pendingItems = data.pendingItems || undefined
    if (!data.pendingItems) return
    const history = SessionStorageManager.get('todoTab')
    // 如果历史定位是费用支付，并且费用支付为空，则直接定位到接口提供的定位
    if (history === TodoTabEnum.PAYMENT && !data.pendingItems.paymentVO) {
      return
    } else {
      data.pendingItems.locateTo = history || data.pendingItems.locateTo
    }
  }

  /** 切换待办 tab 并加载对应数据 */
  async function updatePaddingItmesTab(tab: TodoTabEnum) {
    if (state.moduleData.pendingItems) {
      state.moduleData.pendingItems.locateTo = tab
    }
    SessionStorageManager.save('todoTab', tab)
    // 页面 Tab 值映射为后端场景编码：20 支付、30 付款授权、40 权限审批、50 运单审批。
    const searchTypes = {
      [TodoTabEnum.PAYMENT]: FirstPrioritySearchType.PAYMENT,
      [TodoTabEnum.PAY_AUTH]: FirstPrioritySearchType.PAY_AUTH,
      [TodoTabEnum.AUTH_APPROVAL]: FirstPrioritySearchType.AUTH_APPROVAL,
      [TodoTabEnum.WAYBILL_APPROVAL]: FirstPrioritySearchType.WAYBILL_APPROVAL,
    }
    const { data } = await getFirstPriorityData(searchTypes[tab])
    const pending = data.pendingItems
    let updateInfo: Partial<HomePagePendingCountVO> | undefined
    switch (tab) {
      case TodoTabEnum.PAYMENT: {
        updateInfo = { paymentVO: pending?.paymentVO || null }
        break
      }
      case TodoTabEnum.PAY_AUTH: {
        updateInfo = {
          payAuthList: pending?.payAuthList || null,
          payAuthCount: pending?.payAuthCount || 0,
        }
        break
      }
      case TodoTabEnum.AUTH_APPROVAL: {
        updateInfo = {
          authApprovalList: pending?.authApprovalList || null,
          authApprovalCount: pending?.authApprovalCount || 0,
        }
        break
      }
      case TodoTabEnum.WAYBILL_APPROVAL: {
        updateInfo = {
          wayBillApprovalList: pending?.wayBillApprovalList || null,
          wayBillApprovalCount: pending?.wayBillApprovalCount || 0,
        }
        break
      }
    }
    const oldPeddingItems = state.moduleData.pendingItems
    // 局部响应只含本分类数据，合并以保留其他分类和当前 Tab 定位。
    const newPeddingItems = {
      ...(oldPeddingItems ? oldPeddingItems : {}),
      ...updateInfo,
    }
    state.moduleData.pendingItems = newPeddingItems as HomePagePendingCountVO
  }

  /** 更新单个优惠券领取状态 */
  function updateCouponGetState(id: number, isGet: boolean) {
    const activityList = state.moduleData.activityList
    if (activityList) {
      const index = activityList.findIndex((item) => item.id === id)
      const active = activityList[index]
      if (index !== void 0 && active) {
        active.isGet = isGet
      }
    }
  }

  /** 切换业务概况角色 tab */
  function updateBusinessOverviewTab(tab: '' | 1 | 2 | 3) {
    state.activeTab = tab
  }

  return {
    // state（toRefs 摊平，消费方仍按单字段 ref 访问，与迁移前一致）
    ...toRefs(state),
    // getters
    homeStatus,
    pendingItems,
    couponData,
    latestMessageList,
    commonFunction,
    businessOverview,
    logisticsOverview,
    receivingOverview,
    isExclusive,
    // actions
    refreshOverview,
    refreshTemplate,
    getHomeModuleData,
    getBannerData,
    updateCouponList,
    getCommonFunction,
    refreshCommonFunction,
    getPendingItems,
    refreshPendingItems,
    updatePaddingItmesTab,
    updateCouponGetState,
    updateBusinessOverviewTab,
  }
})
