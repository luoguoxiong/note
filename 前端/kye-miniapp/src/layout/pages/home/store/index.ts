import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import * as Apis from '../apis'
import { isAliMiniApp, isH5FSEnv, px2real, sleep } from '@/public/utils'
import { getDailyTaskChannel } from '../components/daily-task/constants'
import { PaymentState, ThirdOrderState, TodoListState, WaybillState } from './types'
import { HomepageCouponCard, MenuItem, WebHomepagePendingItemOut } from '../apis/types'
import { getSystemInfo } from '@/public/utils/getSystemInfo'
import { getToken } from '@/public/storage'
import { getEnvConfig } from '@/public/config'
import { getCache, setCache } from '../utils'
import { useUpdateSomeUserInfoV1 } from '@/public/hooks/useUpdateSomeUserInfoV1'
import { fetchApplicationMarks, gethHomePageLightApp } from '@/public/utils/application/applicationService'
import { ApplicationItem } from '@/public/utils/application/applicationType'
import { menuCodeMap, MenuCodeMap } from '@/public/utils/application/constants'
import { getTodoSubTabAndSelecter, getTodoTabsSelecter } from '../utils/todoHelp'
import { useUserInfo } from '@/public/hooks'
import { config } from '@/layout/pages/home/config'
import { getMarketVirtualContact } from '@/public/components/business/contact-business/api'
import { useUserGlobalStore } from '@/store/user'

const defaultData = {
  /** 有无留资 */
  hasLeadCapture: false,
  /** 有无运费时效活动 */
  hasShippingExpiredActivity: false,
  /** 是否存在留资类活动 */
  hasLeadCaptureActivity: false,
  /** 有没有匹配销售 */
  hasSale: false,
  /** 有没有预约司机取货数据 */
  waitNoticeNum: 0,
  /** 有没有签到 */
  isSign: false,
  /** 签到积分 **/
  givingIntegral: 0,
  /** 待办事项tab选项 */
  selectedTab: 'latest_waybill',
  // 待办事项subTab选项
  selectedSubTab: '40',
  /** 第三方运单数据  */
  thirdOrderInfo: { count: 0, itemDetail: null } as ThirdOrderState,
  /** 最新运单信息 */
  newestWaybillInfo: { count: 0, itemDetail: null } as WaybillState,
  /** 费用支付信息 */
  paymentInfo: { count: 0, itemDetail: null } as PaymentState,
  /** 双倍积分卡角标图片 */
  doubleIntegralImg: '',
  /** 代办事项 */
  todoList: {
    /** 待办事项总数 */
    total: 0,
    /** 付款授权 */
    paymentApproval: null,
    /** 权限审批 */
    permissionApproval: null,
    /** 运单审批 */
    waybillApproval: null,
    /** 调价审核 */
    adjustPriceApproval: null,
  } as TodoListState,

  /** 券卡片有序列表（task 接口 couponCardList，后端已排序/合并/截断） */
  couponCardList: [] as HomepageCouponCard[],
  /** 领券卡本地状态（接口无领取/失效字段，按卡 id 覆盖） */
  couponLocalStatus: {} as Record<number, { isGet?: boolean; invalidated?: boolean }>,
  /** 每日任务 */
  taskList: [],
  /** 生日弹窗 */
  birthdayPopupInfo: {
    isNeedPopUp: false,
    integral: 0,
  },
  /** 总裁信箱弹窗 */
  hotlinePopupInfo: {
    showHotline: false,
    fbId: '',
    rewardType: '1',
    rewardAmount: '0',
    count: 0,
    url: '',
  },
  /** 幸运用户弹窗 */
  luckyPopup: {
    show: false,
    integralAmount: 0,
  },
  couponPopup: {
    show: false,
    count: 0,
  },
  crmActivity: {
    show: false,
    imageUrl: '',
    url: '',
  },
  follow: {
    showWxFlag: false,
  },
  /* 首页-升级弹窗 */
  homeVersionPopup: {
    show: false,
  },
  /** 轻应用 */
  lightAppData: [],
  /** 行业解决方案 */
  industryInfo: [],
  // 每日签到的 taskId
  dailyAttendanceTaskId: 0,
  // 绑码相关数据
  relationAuth: {} as any,
  /** 有无商务二维码 */
  hasBusinessQrcode: true,
  /** 有无商务名称 */
  businessName: '',
  /** 新客留资活动 */
  newCustomerActivity: {
    receiveSource: 31,
    activityId: 0,
    couponCount: 0,
  },
  /*** 运费时效活动 */
  waybillActivity: {
    receiveSource: 32,
    activityId: 0,
    couponCount: 0,
  },
}

export const useHomeStore = defineStore('home', {
  state: () => ({
    data: { ...defaultData },
    appHeaderHeight: 60,
    logoOffsetTop: 20,
    logoOffsetLeft: px2real(32),
    _initPromise: null as null | Promise<void>,
    _isReady: false,
    /** 是否命中本地缓存（区分首次无缓存场景） */
    _hasCacheData: false,
  }),

  actions: {
    async getDefaultMenus() {
      if (isH5FSEnv) {
        const { fsDefaultLightApp } = await import('@/public/asyncData/home')
        return fsDefaultLightApp as any
      }
      const { defaultProdLightApp } = await import('@/public/asyncData/home')
      return defaultProdLightApp as any
    },
    storageKey: () => {
      const userinfo = Taro.getStorageSync('USER_INFO')
      const { isProd } = getEnvConfig()

      // 生成当前缓存键
      const currentCacheKey = userinfo.phone
        ? `${userinfo.phone}_${isProd ? 'prod' : 'uat'}_homeCache_v2`
        : `${isProd ? 'prod' : 'uat'}_homeCache_v2`

      // 清除其他homeCache结尾的存储
      const allKeys = Taro.getStorageInfoSync().keys
      const homeCacheKeys = allKeys.filter((key) => key.includes('_homeCache') && key !== currentCacheKey)

      homeCacheKeys.forEach((key) => {
        Taro.removeStorageSync(key)
        console.log(`已清除缓存: ${key}`)
      })

      return currentCacheKey
    },

    // 页面布局信息
    async getLayoutInfo() {
      const { windowWidth, navBarHeight, menuButtonInfo, statusBarHeight } = await getSystemInfo()
      this.appHeaderHeight = navBarHeight
      this.logoOffsetTop = menuButtonInfo.top + menuButtonInfo.height / 2 - px2real(20)

      if (isAliMiniApp) {
        const res = my.getLeftButtonsBoundingClientRect()
        const { left, width } = res.backButtonIcon
        this.logoOffsetLeft = left + width
      }
    },

    // 更新全局数据
    async updateData(newData: Partial<typeof defaultData>) {
      // 等初始化完成
      if (!this._isReady) {
        await this.loadFromStorage()
      }

      this.data = {
        ...this.data,
        ...newData,
      }

      this.saveToStorage()
    },

    // 保存数据到缓存
    saveToStorage() {
      Taro.setStorageSync(this.storageKey(), this.data)
    },

    // 初始化缓存数据
    async loadFromStorage() {
      if (this._initPromise) return this._initPromise

      this._initPromise = (async () => {
        const saved = Taro.getStorageSync(this.storageKey())

        if (saved) {
          this._hasCacheData = true
          this.data = {
            ...this.data,
            ...defaultData,
            ...saved,
          }
          return
        }

        const [lightAppData, { industryDefaultInfo, defaultTaskList }] = await Promise.all([
          this.getDefaultMenus(),
          import('@/public/asyncData/home'),
        ])

        defaultData.lightAppData = lightAppData
        defaultData.industryInfo = industryDefaultInfo as any
        defaultData.taskList = defaultTaskList as any

        this.data = {
          ...this.data,
          ...defaultData,
        }

        this._isReady = true
      })()

      return this._initPromise
    },

    closeExtraPopup() {
      this.updateData({
        luckyPopup: {
          show: false,
        },
        hotlinePopupInfo: {
          showHotline: false,
        },
        birthdayPopupInfo: {
          isNeedPopUp: false,
        },
        couponPopup: {
          show: false,
        },
      })
    },
    // 延迟获取业务弹窗
    async delayFetchBusinessPopup() {
      const token = getToken()

      if (!token) return
      const res = await Apis.getHomePagePopup()
      const { birthdayPopUpVO, mailboxMsgTips, luckyCustomerPop, timeoutCouponCount } = res.data
      // 切换账号，可能导致其他弹窗已经打开，会出现两个弹窗，先全部关闭
      this.closeExtraPopup()
      if (luckyCustomerPop) {
        const lastLandomId = Taro.getStorageSync('luckPopup')
        const isShow = lastLandomId !== luckyCustomerPop.randomId
        Taro.setStorageSync('luckPopup', luckyCustomerPop.randomId)
        this.updateData({
          luckyPopup: {
            show: isShow,
            integralAmount: luckyCustomerPop.integralAmount,
          },
        })
      } else if (mailboxMsgTips) {
        this.updateData({
          hotlinePopupInfo: {
            showHotline: !!mailboxMsgTips,
            fbId: mailboxMsgTips?.fbId,
            rewardType: mailboxMsgTips?.rewardType,
            rewardAmount: mailboxMsgTips?.rewardAmount,
            count: mailboxMsgTips?.count,
            url: mailboxMsgTips?.url,
          },
        })
      } else if (birthdayPopUpVO?.isNeedPopUp) {
        this.updateData({
          birthdayPopupInfo: {
            isNeedPopUp: birthdayPopUpVO.isNeedPopUp,
            integral: birthdayPopUpVO.integral,
          },
        })
      } else {
        const userinfo = Taro.getStorageSync('USER_INFO')
        if (userinfo) {
          const cacheKey = `HOME-couponPopup-${userinfo?.phone || '001'}`
          const show = getCache(cacheKey)
          if (timeoutCouponCount > 0 && !show) {
            setCache(cacheKey, true)
            this.updateData({
              couponPopup: {
                show: true,
                count: timeoutCouponCount,
              },
            })
          }
        }
      }
    },

    async getCrmActivity() {
      try {
        const {
          data: { imageUrl, url, isShow },
          code,
        } = await Apis.getMarketActivity({ category: 10 })
        if (code === 0) {
          this.updateData({
            crmActivity: {
              show: isShow,
              imageUrl,
              url,
            },
          })
        } else {
          this.updateData({
            crmActivity: {
              show: false,
              imageUrl: '',
              url: '',
            },
          })
        }
      } catch (error) {
        console.error('getCrmActivity', error)
      }
    },

    async getFollow() {
      let showWxFlag = false
      try {
        const res = await Apis.getUserInfoByPhone({ source: 1 })
        console.log('getUserInfoByPhone', res)
        if (res.code === 0 && res.data) {
          showWxFlag = res.data.subscribe !== 1
        }
      } catch (error) {
        console.error('getFollow', error)
      } finally {
        this.updateData({
          follow: {
            showWxFlag,
          },
        })
      }
    },

    closeFlollow() {
      this.updateData({
        follow: {
          showWxFlag: false,
        },
      })
    },

    async getCouponAndSign() {
      // 未登录（手机号与客户编码均无）不调接口、不展示券区域
      const { phone, customerCode } = useUserGlobalStore()
      if (!phone && !customerCode) {
        this.updateData({ couponCardList: [], couponLocalStatus: {} })
        return
      }
      try {
        const { data: merged } = await Apis.getHomepageTask({ channel: config.channelCode })
        // 10 签到 20 未签
        const isSign = Number(merged.signInfo?.signStatus) === 10
        const givingIntegral = merged.signInfo?.givingIntegral || 0
        // 10 有 20没有专属商务
        const hasSale = merged?.userLabel?.bindSalesFlag === '10'

        const waitNoticeNum = merged?.waybillStat?.waitNoticeNum || 0
        this.updateData({
          couponCardList: merged.couponCardList || [],
          isSign,
          givingIntegral,
          hasSale,
          waitNoticeNum,
        })
      } catch (error) {
        console.error('getCouponAndSign', error)
      }
    },

    // 更新角标
    async updateHomeMenuMarks(menus: MenuItem[], waitNoticeNum: number) {
      try {
        if (!Array.isArray(menus) || menus.length === 0) return
        const menuCodes = menus.map((item) => item.menuCode)
        const markData = await fetchApplicationMarks([...menuCodes, MenuCodeMap.下单原生入口])
        const appCodeMap = new Map<string, any>()
        markData.forEach((app) => {
          if (app.menuCode) {
            appCodeMap.set(app.menuCode, app)
          }
        })
        const result = menus.map((item) => {
          const menuInfo = appCodeMap.get(item.menuCode)
          return {
            ...item,
            ...(menuInfo || {}),
            menuName: menuInfo?.menuName || item?.menuName,
          }
        })
        this.updateData({
          waitNoticeNum,
          lightAppData: result,
          doubleIntegralImg: appCodeMap.get(menuCodeMap.下单原生入口)?.smallIcon,
        })
      } catch (error) {
        console.error('updateHomeMenuMarks', error)
      }
    },
    // 获取首页轻应用
    async getHomeApplication() {
      try {
        let data = await gethHomePageLightApp()
        if (data) {
          let { menuList, waitNoticeNum } = data
          if (!menuList || (menuList && menuList?.length < 4)) {
            menuList = await this.getDefaultMenus()
          }
          // 首次无缓存时兜底图片可能仍在加载，直接替换可取消未完成的兜底请求，避免图片双次加载
          // 有缓存时图片 URL 与接口一致，保留延迟以避免首屏渲染抖动
          if (this._hasCacheData) {
            await sleep(3000)
          }
          this.updateHomeMenuMarks(menuList, waitNoticeNum)
        }
      } catch (error) {
        console.error('getHomeApplication', error)
      }
    },

    // 更新金刚区轻应用数据
    async updateHomeOneApplication(app: ApplicationItem) {
      const lightAppData: ApplicationItem[] = this.data.lightAppData
      const index = lightAppData.findIndex((item) => item.menuCode === app.menuCode)
      if (index !== -1) {
        const prevAppInfo = lightAppData[index]
        lightAppData[index] = {
          ...prevAppInfo,
          ...app,
          menuName: app?.menuName || prevAppInfo?.menuName,
          menuBackground: prevAppInfo.menuBackground,
          menuIconContent: prevAppInfo.menuIconContent,
          menuIconType: prevAppInfo.menuIconType,
          smallIcon: prevAppInfo.smallIcon,
          smallIconContent: prevAppInfo.smallIconContent,
          smallIconType: prevAppInfo.smallIconType,
        }
      }
    },

    // CMS配置数据
    async getCMSConfigJson() {
      try {
        const { data } = await Apis.getCMSConfigJson({
          moduleCode: 'solution_intro_new_v1',
          category: 'MOBILE_HOME_PAGE_CMS',
        })

        let industryInfo = []

        if (data.configs?.length) {
          data.configs.forEach(async (item) => {
            try {
              const { cmsContent, moduleCode } = item
              if (!cmsContent) return
              const parsedContent = JSON.parse(cmsContent)
              if (moduleCode === 'solution_intro_new_v1') {
                industryInfo = parsedContent
              }
            } catch (parseError) {
              industryInfo = []
            }
          })
        }

        if (industryInfo.length < 4) {
          const { industryDefaultInfo } = await import('@/public/asyncData/home')
          industryInfo = industryDefaultInfo as any
        }
        this.updateData({
          industryInfo,
        })
      } catch (error) {
        const { industryDefaultInfo } = await import('@/public/asyncData/home')
        this.updateData({
          industryInfo: industryDefaultInfo,
        })
      }
    },

    // 获取待办事项数据
    async getTabsData() {
      try {
        const { data } = await Apis.getHomepageTabs({ tabCode: 'all', channel: config.channelCode })

        const thirdOrderInfo: ThirdOrderState = {
          count: data.wpOrder?.messageCount || 0,
          show: Boolean(data.wpOrder?.messageCount || (data.wpOrder?.latestBatchInfo ? 1 : 0)),
          itemDetail: data.wpOrder?.latestBatchInfo || null,
        }

        const hasWaybill = !!data?.mobilePaymentResp?.waybillNumber

        const paymentInfo = {
          count: hasWaybill ? 1 : 0,
          itemDetail: hasWaybill ? data.mobilePaymentResp : null,
        }

        const newestWaybillInfo: WaybillState = {
          count: data.latestWaybill?.waybillNumber ? 1 : 0,
          itemDetail: data.latestWaybill || null,
        }

        const pendingItem = data.pendingItem?.details || []

        const todoList = this.changeTodoList(pendingItem)

        const { selectedTab } = getTodoTabsSelecter(
          {
            paymentInfo: paymentInfo.count || 0,
            thirdOrderInfo: thirdOrderInfo.count,
            newestWaybillInfo: newestWaybillInfo.count,
            total: todoList.total,
            thirdOrderShow: thirdOrderInfo.show,
          },
          this.data.selectedTab,
        )

        const { showSubTabs, selectedSubTab } = getTodoSubTabAndSelecter(todoList, this.data.selectedSubTab)

        const newValues: Record<string, unknown> = {
          thirdOrderInfo: thirdOrderInfo,
          newestWaybillInfo: newestWaybillInfo,
          paymentInfo,
          todoList,
          selectedTab,
          todoSubTabs: showSubTabs,
          selectedSubTab,
        }

        this.updateData(newValues)
      } catch (error) {
        console.error('getTabsData', error)
      }
    },

    async getHomepagePendingItem(itemCode?: string) {
      try {
        const { data } = await Apis.getHomepagePendingItem({ itemCode })
        const updateAllData = !itemCode || itemCode === 'all'
        const todoList = this.changeTodoList(data, updateAllData)
        const { showSubTabs, selectedSubTab } = getTodoSubTabAndSelecter(todoList, this.data.selectedSubTab)
        this.updateData({ todoList, selectedSubTab, todoSubTabs: showSubTabs })
      } catch (error) {
        console.error('getHomepagePendingItem', error)
      }
    },

    // 修改待办事项数据
    changeTodoList(pendingItems: WebHomepagePendingItemOut, replace = true) {
      const codeMap = {
        10: 'paymentApproval',
        20: 'permissionApproval',
        30: 'waybillApproval',
        50: 'adjustPriceApproval',
      }

      const update: Record<string, any> =
        pendingItems?.reduce((acc, item) => {
          const key = codeMap[item.itemCode!]
          if (!key) return acc

          acc[key] = item
          return acc
        }, {}) || {}

      const newValue = replace ? update : { ...this.data.todoList, ...update }
      const paymentApprovalCount = newValue.paymentApproval?.count || 0
      const permissionApprovalCount = newValue.permissionApproval?.count || 0
      const waybillApprovalCount = newValue.waybillApproval?.count || 0
      const adjustPriceApprovalCount = newValue.adjustPriceApproval?.count || 0

      newValue.total = paymentApprovalCount + permissionApprovalCount + waybillApprovalCount + adjustPriceApprovalCount

      return newValue
    },

    // 获取每日任务
    async getDailyTask() {
      try {
        const userinfo = Taro.getStorageSync('USER_INFO')
        const { data } = await Apis.getDailyTask({
          phone: userinfo?.phone || '',
          customerCode: userinfo?.customerCode || '',
          source: isAliMiniApp ? 6 : 7,
          channel: getDailyTaskChannel(),
          taskTypeCode: 'homePage',
        })
        this.updateData({
          taskList: data?.detailList || [],
        })
      } catch (error) {
        const { defaultTaskList } = await import('@/public/asyncData/home')
        this.updateData({
          taskList: defaultTaskList,
        })
        console.error('getDailyTask', error)
      }
    },

    // 异步获取的任务
    async asyncFetchTask() {
      try {
        const { userInfo } = useUserInfo()
        const { updateStorageUserRelationAuth } = useUpdateSomeUserInfoV1()

        if (userInfo.value.phone) {
          const tasks: Promise<any>[] = []

          // 待办事项
          tasks.push(this.getTabsData())
          // 优惠券及签到
          tasks.push(this.getCouponAndSign())
          // 每日任务
          tasks.push(this.getDailyTask())

          // 老客没有绑码时获取绑码关联关系
          if (!userInfo.value.customerCode) {
            tasks.push(updateStorageUserRelationAuth())
          }

          await Promise.allSettled(tasks)
        }
      } catch (error) {
        console.error('asyncFetchTask', error)
      }
    },

    async getBusinessQrCode() {
      try {
        const { userInfo } = useUserInfo()
        const plateForm = getEnvConfig().plateForm
        const channelMap = {
          alipay: 'alipay',
          amap: 'amap',
        }
        const { data } = await getMarketVirtualContact({
          userInputMobile: userInfo.value.phone,
          channel: channelMap[plateForm] || 'wechat',
          contactType: '20',
        })
        this.updateData({
          hasBusinessQrcode: !!data.qrcode,
          businessName: data.name,
        })
      } catch (error) {
        this.updateData({
          businessName: '',
          hasBusinessQrcode: false,
        })
      }
    },

    /** 延迟请求任务任务 */
    async delayFetchTask(isNewAndhasLeadCapture?: boolean) {
      try {
        const tasks = [this.getCrmActivity(), this.getFollow()]

        if (isNewAndhasLeadCapture) {
          tasks.push(this.getBusinessQrCode())
        }

        await Promise.all(tasks)
      } catch (error) {
        console.error('delayFetchTask', error)
      }
    },

    // 更新领券卡本地状态（接口无领取/失效字段，按卡 id 本地覆盖）
    updateLocalCouponStatus(activityId?: number, status?: { isGet?: boolean; invalidated?: boolean }) {
      if (activityId === undefined) return
      const prev = this.data.couponLocalStatus[activityId] || {}
      this.updateData({
        couponLocalStatus: { ...this.data.couponLocalStatus, [activityId]: { ...prev, ...status } },
      })
    },

    /* 更新首页弹窗展示状态 */
    updateHomeVersionStatus(isShow?: boolean) {
      this.updateData({
        homeVersionPopup: {
          show: isShow,
        },
      })
    },

    init() {
      this.getLayoutInfo()
      this.loadFromStorage()
    },
  },
})
