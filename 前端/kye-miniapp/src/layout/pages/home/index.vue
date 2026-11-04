<template>
  <!-- 新客 -->
  <template v-if="showHomePage">
    <CustomerNew
      v-if="!isLogin || isNew"
      @showContactBusiness="showContactBusiness"
      :refreshing="refreshing"
      @scroll="handleScroll"
      @refresh="onRefresh"
    ></CustomerNew>
    <!-- 老客 -->
    <CustomerOld
      v-if="!isNew && isLogin"
      :isFetching="isFetching"
      v-model:banner="result.banner"
      v-model:notice="result.notice"
      :refreshing="refreshing"
      @scroll="handleScroll"
      @refresh="onRefresh"
    ></CustomerOld>
  </template>
  <!-- 游客类弹窗 -->
  <view>
    <!-- 广告浮窗 -->
    <FloatPanel :is-hide="isScroll" v-model="result.floatPanel" :topLimit="floatPlaneTop"></FloatPanel>
    <!-- 隐私协议 -->
    <PrivacePopup
      v-if="!isAgree"
      :show="!isAgree"
      :isWeixinApp="false"
      :isQuickyLogin="false"
      :offset-bottom="isH5Env ? 50 : 0"
      @confirm="agreePrivace"
      @cancel="cancelAgree"
    ></PrivacePopup>
    <!-- 广告中心弹窗 -->
    <AdvertisePopup
      v-model="result.popup"
      qt-page-code="page_homepage_v1"
      ref="popupRef"
      pageName="home"
      :isFetching="isFetching"
    />
    <!-- 版本升级弹窗 -->
    <VersionManagePopup touchLocation="10" ref="versionPopupRef"></VersionManagePopup>
    <!-- 底部banner 营销活动 -->
    <CrmActivity></CrmActivity>
    <!-- 开票页 -->
    <Splash @close="showHome" @willClose="showHome" v-if="isApp"></Splash>
    <!-- 新客未留资绑码引导/公众号底部浮块 -->
    <FlowBottom></FlowBottom>
    <!-- 快捷入口引导气泡（点击"..."添加至我的小程序/电脑桌面） -->
    <QuickEntryGuide></QuickEntryGuide>
  </view>
  <view v-if="isLogin">
    <!-- 生日弹窗 -->
    <PopupBirthday v-if="showBirthdayPopup"></PopupBirthday>
    <!-- 总裁信箱弹窗 -->
    <PopupHotel v-if="showHotline"></PopupHotel>
    <!-- 幸运客户弹窗 -->
    <PopupLucky v-if="showLuckPopup"></PopupLucky>
    <!-- 优惠券过期弹窗 -->
    <PopupCoupon v-if="showCoupon"></PopupCoupon>
    <!-- 下单问卷 -->
    <OrderQuestion></OrderQuestion>
    <!-- 联系商务弹窗 -->
    <ContactBusiness
      v-model:show="contactBusinesStatus.show"
      :showType="contactBusinesStatus.showType"
      :phone="userInfo?.phone"
      :offset-bottom="isH5Env ? 50 : 0"
    />
    <!-- 版本更新弹窗 -->
    <VersionUpdatePopup v-if="appUpdatePopupShow"></VersionUpdatePopup>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import Taro, { useDidShow, useTabItemTap, useShareAppMessage } from '@tarojs/taro'
import { report_clk_home_tab, reportHomePagePerfence } from '@/layout/report/home'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { useRoleFlags } from './hooks'
import FloatPanel from './components/float-panel/index.vue'
import './index.scss'
import { useHomeStore } from './store'
import { usePrivacePopup } from '@/public/hooks/usePrivacePopup'
import CrmActivity from './components/crm-activity/index.vue'
import OrderQuestion from '@/public/components/business/order-question/index.vue'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import VersionManagePopup from '@/public/components/business/version-manage-popup/index.vue'
import { useUserInfo, useTabPageActive } from '@/public/hooks'
import { report_CLK_event, sleep, isH5Env, uuid } from '@/public/utils'
import { getEnvConfig } from '@/public/config'
import { reportHomePageUv } from './report'
import { useThrottleAsync } from '@/public/hooks/useThrottleAsync'
import { useUserInfoChange } from '@/public/hooks/useUserInfoChange'
import { handleTabShowAsync } from '@public/appInit/initTabAsync'
import {
  useFetchAdvertisDetail,
  AdvertisePopup,
  Splash,
  splashManager,
} from '@/public/components/business/advertise-center'
import { useFloatPlane } from './hooks/useFloatPlane'
import { fixIosPageHide } from '@/public/h5/init'
import {
  checkNeedShowForce,
  checkNeedShowThrottle,
  appUpdatePopupShow,
} from '@/public/components/business/version-update-popup/menager'
import { VersionUpdatePopup } from '@/public/components/business/version-update-popup'
import CustomerNew from '@/layout/pages/home/components/customer-new/index.vue'
import CustomerOld from '@/layout/pages/home/components/custimer-old/index.vue'
import FlowBottom from './components/flow-bottom/index.vue'
import QuickEntryGuide from './components/quick-entry-guide/index.vue'
import { useShowPopup } from './hooks/useShowPopup'
import PopupHotel from '@/layout/pages/home/components/popup-hotline/index.vue'
import PopupBirthday from '@/layout/pages/home/components/popup-birthday/index.vue'
import PopupLucky from '@/layout/pages/home/components/popup-lucky/index.vue'
import PopupCoupon from '@/layout/pages/home/components/popup-coupon/index.vue'
import { PrivacePopup } from '@/layout/pages/home/asyncComponents/index'
import { getAreasApplicationAndMarkers } from '@/public/utils/application/applicationService'
import { AreaCodePlatMap } from '@/public/utils/application/constants'
import { useNewUserActivity } from '@/store/useNewUserActivity'
const { showHotline, showLuckPopup, showBirthdayPopup, showCoupon } = useShowPopup()

defineOptions({ name: 'home-page' })

const userActivity = useNewUserActivity()

// ========= 基础 =========
const homeStore = useHomeStore()
const { userInfo } = useUserInfo()
const { autoLoginHook } = useAutoLogin()
const { isAgree, agreePrivace, cancelAgree, waitForAgree } = usePrivacePopup()

// ========= 环境/状态 =========
const isApp = getEnvConfig().isApp
// 是否展示首页内容
const showHomePage = ref(!isApp)
const isScroll = ref(false)
const refreshing = ref(false)

const contactBusinesStatus = ref({
  show: false,
  showType: 'phone',
})

// ========= store 数据解构 =========
const { init, data, delayFetchBusinessPopup } = toRefs(homeStore)

const homeVersionPopupShow = computed(() => data.value.homeVersionPopup?.show)

// ========= 登录状态 =========
const { isLogin, isNew } = useRoleFlags()

// ========= ref 组件 =========
const versionPopupRef = ref()
const popupRef = ref()

let isRequestIng = false

const { isChanged, resetChange } = useUserInfoChange()

// 防抖封装
let scrollTimer: any = null
const handleScroll = () => {
  isScroll.value = true
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => (isScroll.value = false), 150)
}

const showContactBusiness = (type: 'phone' | 'qrCode') => {
  contactBusinesStatus.value.show = true
  contactBusinesStatus.value.showType = type
}

const showHome = () => {
  showHomePage.value = true
  getHomePageData(false, false)
}

useDidShow(async () => {
  reportHomePageUv()
  fixIosPageHide()
  try {
    await getHomePageData(!isChanged.value, false)
    resetChange()
  } finally {
    handleTabShowAsync()
  }
})

const onRefresh = async () => {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await getHomePageData(false, true)
  } finally {
    refreshing.value = false
  }
}

const { run: delayFetchTaskThrottle, forceRun: delayFetchTask } = useThrottleAsync(homeStore.delayFetchTask)

const { run: getHomeApplicationThrottle, forceRun: getHomeApplication } = useThrottleAsync(homeStore.getHomeApplication)

const getNewOrNoLoginApplication = useThrottleAsync(async () =>
  getAreasApplicationAndMarkers([AreaCodePlatMap.新客首页]),
)

const { getDetailDataForce, getDetailDataThrottle, result, isFetching } = useFetchAdvertisDetail({
  pageName: 'home',
  popupCallback: async (isShowPopup) => {
    if (!isShowPopup && !homeVersionPopupShow.value) {
      await sleep(3000)
      delayFetchBusinessPopup.value()
    }
  },
})

const { floatPlaneTop } = useFloatPlane()

const getCustomerNewDataThrottle = useThrottleAsync(async (isNewAndhasLeadCapture: boolean) => {
  // 行业解决方案
  homeStore.getCMSConfigJson()
  await sleep(1000)
  // 企微二维码、营销底部活动、公众号状态
  homeStore.delayFetchTask(isNewAndhasLeadCapture)
})

const getNoLoginDatahrottle = useThrottleAsync(async () => {
  homeStore.getCMSConfigJson()
})

// 广告数据拉取：未同意隐私政策时挂起，同意后补发
const fetchDetailWithConsent = (params: any, needThrottle: boolean) => {
  waitForAgree(
    () => (needThrottle ? getDetailDataThrottle(params) : getDetailDataForce(params)),
    () => (isFetching.value = false),
  )
}

// 获取新客数据
const getNewCustomerData = async (needThrottle: boolean, isRefresh = false) => {
  // 轻应用
  needThrottle ? getNewOrNoLoginApplication.run() : getNewOrNoLoginApplication.forceRun()
  // 新客信息
  const hasLeadCapture = await userActivity.getNewCustomerInfo(isRefresh)
  // 获取广告
  const adTypeList = homeVersionPopupShow.value ? ['70'] : ['20', '70']
  const params: any = { adTypeList }
  fetchDetailWithConsent(params, needThrottle)
  needThrottle ? getCustomerNewDataThrottle.run(hasLeadCapture) : getCustomerNewDataThrottle.forceRun(hasLeadCapture)
}

// 获取未登录数据
const getNoLoginData = async (needThrottle: boolean) => {
  // 轻应用
  needThrottle ? await getNewOrNoLoginApplication.run() : await getNewOrNoLoginApplication.forceRun()
  // 获取广告
  const adTypeList = homeVersionPopupShow.value ? ['70'] : ['20', '70']
  const params: any = { adTypeList }
  fetchDetailWithConsent(params, needThrottle)
  // 行业解决方案
  needThrottle ? getNoLoginDatahrottle.run() : getNoLoginDatahrottle.forceRun()
}

// 获取老客数据
const getOldCustomerData = async (needThrottle: boolean) => {
  const adTypeList = homeVersionPopupShow.value ? ['10', '30', '70'] : ['10', '20', '30', '70']
  const params: any = { adTypeList }

  fetchDetailWithConsent(params, needThrottle)

  needThrottle ? getHomeApplicationThrottle() : getHomeApplication()
  await sleep(500)
  await homeStore.asyncFetchTask()
  if (isLogin.value) {
    needThrottle ? checkNeedShowThrottle() : checkNeedShowForce()
  }
  await sleep(1000)
  needThrottle ? delayFetchTaskThrottle(false) : delayFetchTask(false)
}

// 获取首页数据主逻辑
const getHomePageData = async (needThrottle = true, isRefresh = false) => {
  if ((!showHomePage.value && isApp) || isRequestIng) return
  isRequestIng = true
  try {
    await autoLoginHook()
  } finally {
    await versionPopupRef.value?.getThrottleData()
    if (!isLogin.value) {
      await getNoLoginData(needThrottle)
    } else if (isNew.value) {
      await getNewCustomerData(needThrottle, isRefresh)
    } else {
      await getOldCustomerData(needThrottle)
    }
    isRequestIng = false
  }
}

useTabItemTap(() => {
  report_clk_home_tab()
  report_CLK_event('clk_home_button_name', {
    event_code: 'clk_home_button_name',
    page_code: 'page_homepage_v1',
    event_name: '移动端新版首页_底部tab_点击',
    region_name: '底部tab',
    region_code: 'functional_area',
    pageName: '首页',
  })
})

const pageIsActive = useTabPageActive()

watch([appUpdatePopupShow, homeVersionPopupShow, pageIsActive], ([updateShow, updateShow2, isActive]) => {
  if (isActive && showHomePage.value) {
    splashManager.onHide(() => {
      if (updateShow || updateShow2) {
        Taro.hideTabBar()
        setTimeout(() => {
          popupRef.value.closePopup()
          homeStore.closeExtraPopup()
          agreePrivace()
        }, 1000)
      } else if (isAgree.value) {
        Taro.showTabBar()
      }
    })
  }
})

onMounted(() => {
  reportHomePagePerfence.reportHomePagePerfence()
})

init.value()

useShareAppMessage(() => {
  const mid = uuid()
  return {
    title: '货急找跨越，跨省最快8小时',
    path: `layout/pages/home/index?mi=wechat_share_${mid}`,
    imageUrl: 'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png',
  }
})
</script>
