import Taro from '@tarojs/taro'
import { computed, inject, provide, reactive } from 'vue'
import {
  api,
  WebUserApplicationIndexLinkSearchOut,
  WebUserApplicationIndexSearchIn,
  WebUserApplicationIndexSearchOut,
} from './api'
import { openURL } from '../webview/utils'
import { getEnvConfig, getSearchChannelCode } from '@/public/config'
import { isAmapMiniApp, isAliMiniApp, isH5FSEnv, report_CLK_event, report_other_event, uuid, isWxAppEnv } from '@/public/utils'
import { showDialog } from '@kye-netc/kye-miniui'
import { WAYBILL_TYPE } from '../waybill-build/constants/waybillSearch'
import { getInternationalDetailUrl } from '../waybill-build/constants/externalLink'
import { useApplication } from '@/public/utils/application/useApplication'
import { GRAY_HEADER_USER_CENTER } from '@public/utils/grayHeader/userCenter'
import { FILTER_APP_CODE } from './config'

const InjectKey = Symbol ? Symbol('search-page-context') : 'search-page-context'

type SearchIntentItem = {
  keyword?: string
  keywordName?: string
  keywordDescription?: string
  keywordType?: string
  keywordCode?: string
  applicationCode?: string
  loadAddress?: string
  routePath?: string
  recoType?: number
  intentType?: number
  menuName?: string
}

const specialSearchIntentCodes = new Set(['contact', '95324', 'waybill', 'H5_FREIGHT_PRESCRIPTION'])

const getSearchIntentUrl = ({ loadAddress = '', routePath = '' }: SearchIntentItem) => `${loadAddress}${routePath}`

const waybillKeywordTypes = new Set(['10', '20', '30', '40', '50', '60', '70', '80', '90', '120', '130', '131', '140'])

const searchIntertionCodeMap = new Map([
  ['NATIVE_LOCATION_NEW_MINI_V1', '网点查询'],
  ['NATIVE_LOCATION_NEW', '网点查询'],
  ['H5_CONTRABAND_MINI_V1', '违禁品查询'],
  ['H5_CONTRABAND', '违禁品查询'],
  ['H5_FMS_ONLINE_SETTLEMENT', '支付开票'],
  ['contact', '联系商务'],
  ['95324', '人工客服'],
  ['waybill', '查件'],
  ['H5_FREIGHT_PRESCRIPTION', '运费时效'],
  ['H5_FREIGHT_PRESCRIPTION_MINI_V1', '运费时效'],
  ['H5_REALNAME_AUTH_MINI_V1', '实名认证'],
  ['H5_AUTHENTICATION_MINI_V1', '实名认证'],
  ['H5_ORDER_DEFAULT_MINI_V1', '下单'],
])

const getSearchIntertion = (list: SearchIntentItem[] = []) => {
  const hitCode = list
    .map((item) => item.keywordCode || item.applicationCode)
    .find((code) => code && searchIntertionCodeMap.has(code))
  if (hitCode) {
    return searchIntertionCodeMap.get(hitCode)
  }

  if (list.some((item) => item.keywordType && waybillKeywordTypes.has(item.keywordType))) {
    return '查件'
  }
  return '其他意图'
}

export function createSearchContext() {
  const state = reactive({
    keyword: '',
    history: [] as Array<{ id?: string; searchKey?: string }>,
    loading: false,
    recommendLoading: false,
    recommendLoadingText: '搜索中',
    timer: null,
    search: {
      application: null as null | Required<WebUserApplicationIndexSearchOut>['applicationInfoList'],
      waybill: null as null | Required<WebUserApplicationIndexSearchOut>['orderPagination']['rows'],
    },

    waybill: {
      total: 0,
      page: 1,
      pageSize: 10,
    },

    recommend: [] as WebUserApplicationIndexLinkSearchOut,

    // 专门用来存储城市联系的type
    keywordType: '',

    activeTab: 0,
    visitorRoute: {
      visitorFlag: 0,
      internationalFlag: false,
      status: 0,
      waybillNumber: '',
    },
    workId: '',

    intelligentRecognitionData: {
      cliboardText: '',
      cliboardList: [] as Array<{ content: string; type: number }>,
      enabled: false, // 是否开启智能识别功能
      noRemindDays: 7,
      noRemindDesc: '7天内不再提醒',
      showIntelligentRecognition: false,
    },

    searchFromAi: false,
    finishAiSearch: false,
  })

  const waybillHasMore = computed(() => {
    return state.waybill.total > (state.search.waybill?.length || 0) || false
  })

  const context = {
    state,

    waybillHasMore,

    async fetchResult() {
      try {
        const keyword = state.keyword.trim()
        if (!keyword) {
          return false
        }

        let smallQuery = { conditionInput: [state.keyword], conditionType: '30' }

        // 如果这里是搜索城市的话，需要更换 conditionType ， conditionType 从联想的接口获取
        console.log('如果这里是搜索城市的话，需要更换 conditionType : ', state.keywordType)
        if (state.keywordType) {
          smallQuery = {
            ...smallQuery,
            conditionType: state.keywordType || '30',
          }
        }

        const params = {
          generalQuery: {},
          queryMode: 20,
          smallQuery: [{ ...smallQuery }],
          page: state.waybill.page,
          pageSize: state.waybill.pageSize,
          clientType: 20,
          mobileType: 10,
          mobileSource: 1,
          channelCode: getSearchChannelCode(),
          keyword,
          waybillNumber: keyword,
          searchHistory: {
            searchKey: keyword,
            clientType: 20,
            mobileType: 10,
            searchType: state.keywordType || '30',
          },
          waybillCustomerSource: [10, 20, 30],
          waybillStatus: [20, 30, 40],
        } as WebUserApplicationIndexSearchIn

        if (state.searchFromAi) {
          params.scene = '10'
        }

        const result = await api('web.user.application.indexSearch.v1', params, { extraHeader: GRAY_HEADER_USER_CENTER })

        state.visitorRoute.visitorFlag = result.data?.visitorRoute?.visitorFlag || 0
        state.visitorRoute.internationalFlag = result.data?.visitorRoute?.internationalFlag || false
        state.visitorRoute.status = result.data?.visitorRoute?.status || 0
        state.visitorRoute.waybillNumber = result.data?.visitorRoute?.waybillNumber || ''

        state.search.application = isH5FSEnv ? [] : result.data?.applicationInfoList || []
        
        if (isWxAppEnv) {
          state.search.application = state.search.application?.filter(i => !FILTER_APP_CODE.includes(i.keywordCode!)) || []
        }

        const waybill = result.data.orderPagination?.rows || []

        state.search.waybill =
          state.waybill.page === 1 || !state.search.waybill?.length ? waybill : [...state.search.waybill, ...waybill]

        state.waybill.total = result.data.orderPagination?.rowTotal || 0
        return true
      } catch (error) {
        console.log('请求失败:, ', error)
        return false
      } finally {
        // 重置
        // state.keywordType = ''
      }
    },

    async refreshAll() {
      const page = state.waybill.page
      const pageSize = state.waybill.pageSize
      const calcPageSize = page * pageSize
      state.waybill.page = 1
      state.waybill.pageSize = calcPageSize

      await context.fetchResult().finally(() => {
        state.waybill.page = page
        state.waybill.pageSize = pageSize
      })
    },

    async onLoadMore() {
      if (state.loading || !waybillHasMore.value) {
        return
      }

      Taro.showLoading({ title: '加载中...' })
      state.loading = true
      state.waybill.page += 1

      await context.fetchResult().finally(() => {
        state.loading = false
        Taro.hideLoading()
      })
    },

    checkValidate(toast = '请输入运单号') {
      const keyword = state.keyword.trim()
      if (!keyword) {
        Taro.showToast({ title: toast, icon: 'none', duration: 2000 })
        return false
      }
      return true
    },

    async onSearch(isBindCode?: boolean, callback?: Function, autoJump = true) {
      try {
        if (!context.checkValidate(isBindCode ? '请输入运单信息/应用信息' : '请输入运单号')) {
          return false
        }
        if (state.loading) {
          return false
        }
        state.loading = true
        state.waybill.page = 1
        const fetchSuccess = await context.fetchResult()
        if (!fetchSuccess) {
          return false
        }
        // 请求成功之后
        context.unshiftHistory(state.keyword, state.keywordType)
        console.log(state.visitorRoute)
        const resLen = (state.search.application || []).length + (state.search.waybill || []).length
        if (resLen > 1 || (resLen === 0 && !state.visitorRoute.waybillNumber)) {
          callback && callback()
        }
        if (autoJump) {
          await context.afterSearchJump()
        }
        return true
      } catch (searchErr) {
        console.log('搜索错误:: searchErr', searchErr)
        return false
      } finally {
        state.loading = false
        Taro.hideLoading()
        if (state.searchFromAi) {
          state.searchFromAi = false
          state.keyword = ''
        }
      }
    },

    async onSearchByAi(isBindCode?: boolean, callback?: Function, autoJump = true) {
      try {
        if (!context.checkValidate(isBindCode ? '请输入运单信息/应用信息' : '请输入运单号')) {
          return
        }
        if (state.loading) {
          return
        }
        state.loading = true
        state.waybill.page = 1
        state.keywordType = '131'
        await context.fetchResult()
        if ((state.search.waybill || []).length === 0) {
          state.keywordType = '130'
          await context.fetchResult()
        }
        // 请求成功之后
        context.unshiftHistory(state.keyword, state.keywordType)
        const resLen = (state.search.application || []).length + (state.search.waybill || []).length
        if (resLen > 1 || (resLen === 0 && !state.visitorRoute.waybillNumber)) {
          callback && callback()
        }
        if (autoJump) {
          await context.afterSearchJump()
        }
      } catch (searchErr) {
        console.log('搜索错误:: searchErr', searchErr)
      } finally {
        state.loading = false
        Taro.hideLoading()
        if (state.searchFromAi) {
          state.searchFromAi = false
          state.keyword = ''
        }
      }
    },

    async afterSearchJump() {
      const appLen = state.search.application?.length || 0
      const waybillLen = state.search.waybill?.length || 0

      if ((appLen && waybillLen) || (!appLen && !waybillLen)) {
        state.activeTab = 0
        if (state.visitorRoute.waybillNumber) {
          context.handleApiJump(state.visitorRoute.waybillNumber)
        }
        return
      }
      if (appLen === 0 && waybillLen > 0) {
        state.activeTab = 1

        if (waybillLen !== 1) return
        // 为什么要延时，因为有tab切换的动画
        // await new Promise((resolve) => setTimeout(resolve, 0))
        // 跳转整车详情
        if (state.search.waybill?.[0]?.otherInfo?.vehicleToken) {
          const { orderNumber, waybillNumber } = state.search.waybill?.[0]?.waybill?.baseInfo || {}
          const vehicleToken = state.search.waybill?.[0]?.otherInfo?.vehicleToken || ''
          if (vehicleToken) {
            const { isProd } = getEnvConfig()
            let link = ''
            if (isProd) {
              link = 'https://vts-public-h5.kyslb.com/vts-zc-h5/#/pages/sub-order/detail/index'
            } else {
              link = 'https://vts-uat-public-h5.kyslb.com/vts-zc-h5/#/pages/sub-order/detail/index'
            }
            link += `?vehicleToken=${vehicleToken}&actionType=routerReplace&waybillNumber=${waybillNumber}`
            if (orderNumber) {
              link += `&demandOrderCode=${orderNumber}`
            }
            openURL(link, {
              needLogin: true,
            })
            return
          }
        }
        // 国际件跳转
        if (state.search.waybill?.[0]?.waybill?.baseInfo?.waybillBusinessRange === WAYBILL_TYPE.国际件) {
          const link = getInternationalDetailUrl()
          openURL(
            `${link}/#/waybill-details?waybillNo=${state.search.waybill?.[0]?.waybill?.baseInfo?.waybillNumber}`,
            { needLogin: true },
          )
          return
        }
        if (state.search.waybill?.[0]?.waybill?.baseInfo?.waybillNumber) {
          context.handleApiJump(state.search.waybill?.[0]?.waybill?.baseInfo?.waybillNumber)
          return
        }
        if (state.search.waybill?.[0]?.waybill?.baseInfo?.orderNumber) {
          context.handleApiJump(state.search.waybill?.[0]?.waybill?.baseInfo?.orderNumber, 'order')
        }
      } else if (waybillLen === 0 && appLen > 0) {
        state.activeTab = 2

        if (appLen !== 1) return

        const appInfo = state.search.application?.[0]
        if (appInfo) {
          if (context.isSpecialSearchIntent(appInfo)) {
            return context.handleSpecialSearchIntent(appInfo)
          }
          // 为什么要延时，因为有tab切换的动画
          // await new Promise((resolve) => setTimeout(resolve, 0))
          try {
            return useApplication().navigateApplication({ menuName: appInfo.menuName || appInfo.keyword || '', ...appInfo } as unknown as any)
          } catch (err) {
            // ignore
            console.error(err)
          }
          openURL(appInfo.loadAddress + appInfo.routePath, { needLogin: true })
        }
      }
    },

    async onRecommend() {
      context.setWorkId()
      state.recommendLoading = true
      state.recommendLoadingText = '搜索中'
      clearTimeout(state.timer)
      state.timer = setTimeout(() => {
        state.recommendLoadingText = '正在努力搜索中...'
      }, 3000)
      const result = await api(
        'web.user.application.indexLinkSearch',
        {
          clientType: '20',
          keyword: state.keyword,
          pageSize: '10',
          channelCode: getSearchChannelCode(),
        },
        { extraHeader: GRAY_HEADER_USER_CENTER },
      )
 
      const searchIntertion = getSearchIntertion(result.data || [])
      report_other_event('other_homepage_search_keyword', {
        page_code: 'page_home_head_v1',
        event_code: 'other_homepage_search_keyword',
        region_code: 'search_bar',
        event_name: '移动端首页_搜索框_输入关键字',
        region_name: '搜索栏',
        search_keyword: state.keyword,
        search_intention: searchIntertion,
        work_id: state.workId,
      })
      state.recommendLoading = false
      clearTimeout(state.timer)
      state.timer = null
      if (isH5FSEnv) {
        state.recommend = (result.data || []).filter((item) => item.keywordType !== '100')
      } else if (isWxAppEnv) {
        /**
         * 面签
         * H5_SIGN_IN
         * H5_SIGN_IN_MINI_V1
         * SIGN_IN_MINI_V1
         * 消息订阅
         * MESSAGE_SUBSCRIPTION
         */ 
        state.recommend = (result.data || []).filter((item) => !FILTER_APP_CODE.includes(item.keywordCode || ''))
      } else {
        state.recommend = result.data || []
      }
      if (state.recommend.length) {
        report_other_event('clk_home_searchfor_v1', {
          page_code: 'page_home_head_v1',
          event_code: 'clk_home_searchfor_v1',
          region_code: 'search_bar',
          event_name: '移动端首页_首页搜索栏搜索结果_查看',
          region_name: '搜索栏',
          search_result: state.recommend
            .slice(0, 5)
            .map((item) => item.keyword)
            .join(','),
          type_name: '猜你想找',
          search_keyword: state.keyword,
        })
      }
    },

    getCurrentSearchIntertion(searchType?: string) {
      return getSearchIntertion([...(state.search.application || []), { keywordType: searchType }])
    },

    async readHistory() {
      const { data: list } = await api(
        'web.query.searchHistory.limit',
        {
          clientType: 20,
          mobileType: 10,
        },
        { appkey: 55262 },
      )
      state.history = list || []
    },

    async unshiftHistory(keyword: string, searchType: string) {
      if (!keyword) {
        return
      }
      // await api('web.query.searchHistory.save', {
      //   searchKey: keyword,
      //   clientType: 20,
      //   mobileType: 10,
      //   searchType: searchType || '30',
      // })
      await context.readHistory()
    },

    async clearHistory() {
      state.history = []
      await api('web.query.searchHistory.delete', { clientType: 20, isAll: 1, mobileType: 10 })
      report_CLK_event('clk_home_delete_reconrd_v1', {
        event_code: 'clk_home_delete_reconrd_v1',
        page_code: 'page_home_head_v1',
        region_code: 'search_bar',
        event_name: '主页_首页搜索历史标签_清空_点击',
        region_name: '搜索栏',
      })
    },

    async removeHistory(id: string) {
      const searchKey = state.history.find((item) => item.id === id)?.searchKey
      state.history = state.history.filter((item) => item.id !== id)
      // isAll的值 1-是 2-否
      let isAll: number = 2
      // console.log('state.history >>> ', state.history)
      // if (state.history && state.history?.length === 0) {
      //   isAll = 1
      // }
      await api('web.query.searchHistory.delete', { id, clientType: 20, mobileType: 10, isAll })

      report_CLK_event('clk_home_search_close_v1', {
        page_code: 'page_home_head_v1',
        event_code: 'clk_home_search_close_v1',
        region_code: 'search_bar',
        event_name: '主页_首页搜索历史标签_删除_点击',
        region_name: '搜索栏',
        clk_content: searchKey,
      })
    },

    updateWaybillData(waybill: { waybillNumber?: string; orderNumber?: string; [key: string]: any }) {
      const target = state.search.waybill?.find(
        (item) => item.waybillNumber === waybill.waybillNumber || item.orderNumber === waybill.orderNumber,
      )
      Object.assign(target || {}, waybill)
    },

    cancelOrd(orderNumber: string) {
      console.log('取消订单', state.search.waybill, orderNumber)
      const filterWaybill = state.search.waybill?.filter((item) => item?.waybill?.baseInfo?.orderNumber !== orderNumber)
      state.search.waybill = filterWaybill
    },

    // 跳转
    handleApiJump(waybillNumber, type = 'waybill') {
      /** clientType 来源 10 客户端 20 移动端 */
      // judgeIsVisitorRoute({ clientType: '20', waybillNumber })
      //   .then(async (res) => {
      //     console.log('judgeIsVisitorRoute ------ ', res)
      //     if (res?.data?.internationalFlag) {
      //       console.log('国际件')
      //       return
      //     }

      //     if (+res?.data?.waybillStatus === 40 && +res?.data?.visitorFlag !== 1) {
      //       Taro.navigateTo({
      //         url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${res.data.waybillNumber}&fromExternal=0`,
      //       })
      //       return
      //     }
      //     Taro.navigateTo({
      //       url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${res.data.waybillNumber}&visitorFlag=${
      //         +res.data.visitorFlag === 1
      //       }&fromExternal=0`,
      //     })
      //   })
      //   .catch((error) => {
      //     console.log('judgeIsVisitorRoute error >>> ', error)
      //   })
      if (state.visitorRoute.internationalFlag) {
        return
      }
      if (type === 'order') {
        Taro.navigateTo({
          url: `/modules/waybill-build/pages/waybill-route/index?orderNumber=${waybillNumber}&fromExternal=0`,
        })
        return
      }
      if (state.visitorRoute.status === 40 && state.visitorRoute.visitorFlag !== 1) {
        Taro.navigateTo({
          url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${state.visitorRoute.waybillNumber || waybillNumber}&fromExternal=0`,
        })
        return
      }
      Taro.navigateTo({
        url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${state.visitorRoute.waybillNumber || waybillNumber}&visitorFlag=${
          +state.visitorRoute.visitorFlag === 1
        }&fromExternal=0`,
      })
    },

    updateTab(tab) {
      state.activeTab = tab
      report_CLK_event('clk_home_search_view_more_v1', {
        page_code: 'page_home_head_v1',
        region_code: 'search_bar',
        event_code: 'clk_home_search_view_more_v1',
        region_name: '搜索栏',
        event_name: '主页_首页搜索栏搜索结果_查看更多_点击',
        search_card: +tab === 1 ? '运单' : '应用',
      })
    },

    getWorkId() {
      return state.workId
    },

    setWorkId() {
      state.workId = uuid()
    },

    isSpecialSearchIntent(item: SearchIntentItem) {
      return Boolean((item.keywordCode && specialSearchIntentCodes.has(item.keywordCode)) || item.recoType === 2)
    },

    // 命中特殊搜索意图
    handleSpecialSearchIntent(item: SearchIntentItem) {
      const { keywordCode } = item
      const openSearchIntentUrl = () => {
        const url = getSearchIntentUrl(item)
        try {
          return useApplication().navigateApplication({ menuName: item.menuName || item.keyword || '', ...item } as unknown as any)
        } catch (err) {
          console.error(err)
          // ignore
        }
        if (!url) {
          return Taro.showToast({ title: '暂无可跳转地址', icon: 'none' })
        }
        return openURL(url, { needLogin: true })
      }

      if (keywordCode === 'contact') {
        // 联系商务
        Taro.setStorageSync('mineParams', 'contactSales')
        return Taro.switchTab({
          url: '/layout/pages/mine/index',
        })
      } else if (keywordCode === '95324') {
        if (isAliMiniApp || isAmapMiniApp) {
          return Taro.showToast({
            title: '请联系95324或前往app内联系在线客服',
            icon: 'none',
          })
        }
        return Taro.navigateTo({
          url: '/packages/webview/onlineService',
        })
      } else if (keywordCode === 'waybill') {
        return Taro.switchTab({
          url: '/layout/pages/waybill/index',
        })
      } else if (keywordCode === 'H5_FREIGHT_PRESCRIPTION') {
        return openSearchIntentUrl()
      }
      return openSearchIntentUrl()
    },
    async getClipboardPermission(cliBoardKey) {
      return new Promise(async (resolve, reject) => {
        const cliBoardValue = Taro.getStorageSync(cliBoardKey)
        // 私有内容 _
        if (cliBoardValue !== '') {
          const _cliBoardContent = cliBoardValue === true ? (await Taro.getClipboardData())?.data || '' : ''
          resolve(_cliBoardContent)
        } else {
          showDialog({
            parentClassName: 'common-search-page',
            zIndex: 1000,
            title: `“跨越速运” 需要剪贴板权限`,
            message: '需要获取您的剪贴板权限，用于首页搜索粘贴功能',
            confirmButtonText: '好',
            cancelButtonText: '不允许',
            showCancelButton: true,
          })
            .then(async () => {
              Taro.setStorage({ key: cliBoardKey, data: true })
              const _cliBoardContent = (await Taro.getClipboardData())?.data || ''
              resolve(_cliBoardContent)
            })
            .catch(() => {
              Taro.setStorage({ key: cliBoardKey, data: false })
              reject('')
            })
        }
      })
    },

    // 获取剪切板内容
    async parsingCliboard() {
      try {
        state.finishAiSearch = false
        state.intelligentRecognitionData.showIntelligentRecognition = false
        state.intelligentRecognitionData.cliboardList = []
        // 第一次查不传内容，获取当前是否不再提醒智能识别
        const previewRes = await api('web.tool.aiClipboard.parse', { content: '', source: 20 })
        if (previewRes.code === 0) {
          if (previewRes.data.enabled) {
            // 开启智能识别
            const word = await this.getClipboardPermission('clipboard-permission')
            if (word) {
              const res = await api('web.tool.aiClipboard.parse', { content: word, source: 20 })
              console.log(res)
              if (res.code === 0) {
                state.intelligentRecognitionData.noRemindDays = res.data.noRemindDays
                state.intelligentRecognitionData.noRemindDesc = res.data.noRemindDesc
                state.intelligentRecognitionData.enabled = res.data.enabled
                state.intelligentRecognitionData.cliboardList = res.data.parsedItems
                  .filter((item) => {
                    if (item.type === 10 || item.type === 20) {
                      return item
                    }
                  })
                  .map((item) => ({ content: item.content, type: item.type }))
                state.intelligentRecognitionData.cliboardText = word
                if (state.intelligentRecognitionData.cliboardList.length && state.intelligentRecognitionData.enabled) {
                  state.intelligentRecognitionData.showIntelligentRecognition = true
                }
              }
            }
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        state.finishAiSearch = true
      }
    },

    // 不再提醒
    async noRemind() {
      const params = {
        noRemind: true,
        days: context.state.intelligentRecognitionData.noRemindDays,
      }
      await api('web.tool.aiClipboard.remindSetting', params)
    },
  }

  provide(InjectKey, context)

  return context
}

export function useSearchContext() {
  return inject(InjectKey) as ReturnType<typeof createSearchContext>
}
