import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type {
  BannerData,
  HomeGreetingVO,
  HomePageActivityVO,
  HomePageBusinessProfileVO,
  HomePagePendingCountVO,
  LightApplicationInfoListVO,
  LogisticsOverviewVO,
  ReceivingOverviewVO,
  UserMessageVO,
} from '@/apis/home/types'
import { useHomeStore as useHomePiniaStore, type HomeStatus, type KeyInfo } from '@/stores/home'

/**
 * 首页 store 组合式封装。
 * 底层为 pinia 的 useHomeStore（由 vuex home module 迁移而来）。
 * 对外保持迁移前 hooks/useHomeStore 的用法：解构出的 state/getter 均为响应式 ref，
 * 动作可直接通过返回的 store 调用。
 *
 * 说明：迁移前该封装的类型将部分字段（如 pendingItems、keyInfo、业务/物流/揽收概况）视作非空；
 * 对应模块在渲染时数据必然已加载，故这里继续沿用该约定，避免改动组件内部取值逻辑。
 */
export const useHomeStore = () => {
  const store = useHomePiniaStore()

  return {
    ...storeToRefs(store),
    // 与迁移前 hooks 返回类型保持一致（数据在对应模块渲染时必然已加载）
    bannerData: computed<BannerData[]>(() => store.bannerData),
    homeStatus: computed<HomeStatus>(() => store.homeStatus),
    pendingItems: computed<HomePagePendingCountVO>(() => store.pendingItems as HomePagePendingCountVO),
    couponData: computed<HomePageActivityVO[]>(() => store.couponData),
    isFetchingCoupon: computed<boolean>(() => store.isFetchingCoupon),
    latestMessageList: computed<UserMessageVO[]>(() => store.latestMessageList),
    commonFunction: computed<LightApplicationInfoListVO[]>(() => store.commonFunction),
    businessOverview: computed<HomePageBusinessProfileVO[]>(() => store.businessOverview || []),
    logisticsOverview: computed<LogisticsOverviewVO>(() => store.logisticsOverview as LogisticsOverviewVO),
    receivingOverview: computed<ReceivingOverviewVO>(() => store.receivingOverview as ReceivingOverviewVO),
    keyInfo: computed<KeyInfo>(() => store.keyInfo as KeyInfo),
    greetingData: computed<HomeGreetingVO | undefined>(() => store.greetingData),
    isExclusive: computed(() => store.isExclusive),
    updateCouponGetState: store.updateCouponGetState,
    updateBusinessOverviewTab: store.updateBusinessOverviewTab,
    updatePaddingItmesTab: store.updatePaddingItmesTab,
    store,
  }
}
