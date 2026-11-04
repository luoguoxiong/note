<template>
  <view
    class="page-mine-scroll"
    :class="{
      'h5-tab-page-layout': isH5Env,
    }"
  >
    <ky-list v-model:refreshing="isRefresh" :isEmpty="true" disabledLoad @refresh="onRefresh">
      <view
        :class="{
          'h5-tab-page-layout': isH5Env,
          'page-mine': true,
          greyTheme: themeConfig.isGrayTheme,
        }"
      >
        <!-- 背景占位 -->
        <view class="page-mine-top">
          <image :src="themeConfig.config.mine_background"></image>
        </view>
        <!-- 背景占位 -->
        <view
          class="page-mine-middle"
          :class="{
            'page-mine-middle-fs': isH5Env,
          }"
        ></view>

        <!-- 内容区域 -->
        <view
          class="page-mine-content"
          :class="{ 'h5-tab-page-layout': isH5Env }"
          :style="{
            paddingTop: navBarHeight + 'px',
          }"
        >
          <!-- 头部-用户信息 -->
          <view class="page-mine-header">
            <MineHeader
              :flagImage="flagImage"
              :realName="realName"
              :newCustomerFlag="newCustomerFlag"
              :isOldCustomer="isOldCustomer"
              :isShowPsdTip="isShowPsdTip"
              @customerClick="onShowCustomerBindDialog"
              @show-contact-business="openBusinessPopup"
            />
          </view>
          <!-- <view @click="onShowCustomerBindDialog">绑码组件弹窗</view> -->
          <!-- 营销区 -->
          <view class="page-mine-market">
            <MarketItem
              v-for="item in marketAreaLightAppFilter"
              :key="item.menuCode"
              :data="item"
              @click="handleOpenLightApp(item, 'first')"
            />
          </view>
          <!-- 跑马灯 -->
          <AdvertiseNotice
            v-model="result.notice"
            :closeQT="{
              page_code: 'page_home_mine',
              region_code: 'top_marquee',
              event_code: 'clk_homepage_top_marquee_close_v1',
            }"
            :clickQT="{
              page_code: 'page_home_mine',
              region_code: 'top_marquee',
              event_code: 'clk_homepage_top_marquee_v1',
            }"
            class="page-mine-notice"
            pageName="mine"
            @getMoney="toGetMoney"
            :has-close="true"
          />
          <!-- 专属商务 -->
          <!-- <view class="page-mine-businesser" v-if="isLogin && newCustomerFlag && !isNew">
            <ContactBusinessWrap
              :newCustomerFlag="newCustomerFlag"
              :hasSaleFlag="hasSaleFlag"
              @show-contact-business="openBusinessPopup"
            />
          </view> -->
          <!-- 商城、福利专区 -->
          <view class="page-mine-buystock" v-if="buyStockLightApp.length > 0 && !isNew">
            <BuyStockItem
              v-for="item in buyStockLightApp"
              :key="item.menuCode"
              :data="item"
              @click="handleOpenLightApp(item, 'second')"
            />
          </view>
          <!-- 新客引导 -->
          <UserInvite v-if="isNew && !hasLeadCapture"></UserInvite>
          <!-- 商务卡片 -->
          <BusinessCard
            v-if="isNew && hasLeadCapture && businessName && !isH5Env"
            @showContactBusiness="openBusinessPopup"
          ></BusinessCard>
          <!-- 了解跨越 -->
          <AboutKye v-if="isLogin && isNew"></AboutKye>
          <view class="page-mine-light-app" v-if="lightApp.length > 0">
            <!-- 轻应用一 -->
            <view class="page-mine-card" v-for="app in lightApp" :key="app.areaName">
              <view class="page-mine-card-title">{{ app.areaName }}</view>
              <view class="page-mine-app-wrap">
                <AppItem
                  v-for="item in app.apps.filter(
                    (item) => !(isNew && item.applicationCode === 'H5_CONTACT_BUSINESS_MINI_V1'),
                  )"
                  :key="item.menuCode"
                  :data="item"
                  @click="handleOpenLightApp(item, app.areaName)"
                />
              </view>
            </view>
          </view>
          <Footer></Footer>
        </view>
      </view>
    </ky-list>
    <!-- 联系商务 -->
    <ContactBusiness
      v-model:show="showBussiness"
      :showType="showType"
      :phone="userInfo?.phone || ''"
      :hideNeedClose="false"
      :offset-bottom="isH5Env ? 50 : 0"
    ></ContactBusiness>

    <!-- 广告弹窗 -->
    <AdvertisePopup
      v-model="result.popup"
      :isFetching="isFetching"
      qt-page-code="page_home_mine"
      pageName="mine"
      ref="popupRef"
    />
    <!-- 一键切回自己的账号 -->
    <BackToMyAccount :backMyAccountCallBack="backMyAccount"></BackToMyAccount>
    <!-- 浮窗广告 -->
    <AdvertiseFloatPanel
      v-model="result.floatPanel"
      :top-limit="navBarHeight"
      :expQt="{
        event_code: 'exp_homepage_advertising_space_v1',
        page_code: 'page_home_mine',
        region_code: 'advertising_space',
        region_name: '侧边广告位',
        event_name: '移动端新版我的页_侧边广告位_入口曝光',
      }"
      :clkQt="{
        event_code: 'clk_homepage_advertising_space_button_v1',
        page_code: 'page_home_mine',
        region_code: 'advertising_space',
        event_name: '移动端新版我的页_侧边广告位_入口点击',
        region_name: '侧边广告位',
      }"
    ></AdvertiseFloatPanel>
    <!-- 版本更新弹窗 -->
    <VersionUpdatePopup v-if="appUpdatePopupShow"></VersionUpdatePopup>
    <FollowWechat
      v-if="isWechatEnv && followWechatShow && showWxFlag && isLogin"
      @close="getFollowWechatShow"
    ></FollowWechat>
    <!-- 绑码组件弹窗 -->
    <CustomerBindDialog
      :express-type="customerBindExpressType"
      v-model:visible="isShowCustomerBindDialog"
    ></CustomerBindDialog>
  </view>
</template>
<script setup lang="ts">
import { useGetSystemNavbar } from '@/public/hooks/useGetSystemNavbar'
import Footer from '@/public/components/base/footer/index.vue'
import {
  AdvertiseNotice,
  AdvertisePopup,
  useFetchAdvertisDetail,
  AdvertiseFloatPanel,
  splashManager,
} from '@/public/components/business/advertise-center'
import { useThemeStore } from '@/store'
import AppItem from './components/app-item-new/index.vue'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import './index.scss'
import { useLogin, useTabPageActive, useUserInfo } from '@/public/hooks'
import { useDidShow, useTabItemTap, stopPullDownRefresh, useRouter } from '@tarojs/taro'
import { isH5Env, report_CLK_event, report_pv_event, isWechatEnv, getQueryObject } from '@/public/utils'
import { report_clk_home_tab } from '@/layout/report/mine'
import BuyStockItem from './components/buystock-item/index.vue'
import MarketItem from './components/market-item/index.vue'
import BackToMyAccount from './components/back-to-my-account/index.vue'
import ContactBusinessWrap from './components/contact-business-wrap/index.vue'
import MineHeader from './components/mine-header/index.vue'
import FollowWechat from '../home/components/follow-wechat/index.vue'
import UserInvite from './components/user-invite/index.vue'
import BusinessCard from './components/business-card/index.vue'
import AboutKye from './components/about-kye/index.vue'
import { useMergeUserInfo } from './hooks/useMergeUserInfo'
import { useLightApp } from './hooks/useLightApp'
import { useThrottleAsync } from '@/public/hooks/useThrottleAsync'
import { useUserInfoChange } from '@/public/hooks/useUserInfoChange'
import { handleTabShowAsync } from '@public/appInit/initTabAsync'
import { useContactBuisness } from './hooks/useContactBuisness'
import { ApplicationCodeMap, MenuCodeMap } from '@/public/utils/application/constants'
import { useApplication } from '@/public/utils/application/useApplication'
import {
  checkNeedShowForce,
  checkNeedShowThrottle,
  appUpdatePopupShow,
} from '@/public/components/business/version-update-popup/menager'
import { VersionUpdatePopup } from '@/public/components/business/version-update-popup'
import { ref, onMounted, computed, toRefs, watch } from 'vue'
import Taro from '@tarojs/taro'
import { fixIosPageHide } from '@/public/h5/init'
import { useHomeStore } from '../home/store'
import { getStorageWithExpiration, setStorageWithExpiration } from '@/public/utils/storageWithExpiration'
import CustomerBindDialog from '@/modules/user/pages/customer-code/customer-code-popup/index.vue'
import { useRoleFlags } from '../home/hooks/index'
import { useNewUserActivity } from '@/store/useNewUserActivity'
import kyeNavigate from '@public/utils/native/navigate'

const { userInfo } = useUserInfo()
const { isLogin } = useLogin()
const { themeConfig } = useThemeStore()
const { navBarHeight } = useGetSystemNavbar()
const router = useRouter()

const popupRef = ref()

const { event } = router.params

/* switchTab 无法携带 query 参数，扫码跳转 tab 页时参数经由 storage 中转（见 scan/help.ts），消费后需立即移除 */
const consumeScanCodeQuery = () => {
  const queryStr = Taro.getStorageSync('scanCodeQuery')
  if (!queryStr) return
  Taro.removeStorageSync('scanCodeQuery')
  const scanQuery = getQueryObject(queryStr)
  if (scanQuery?.scanEvent === 'contactSales') {
    // 需要登录但没有 token
    kyeNavigate.ensureLogin(() => {
      openBusinessPopup()
    })
  }
}

const homeStore = useHomeStore()

// ========= 登录状态 =========
const { isNew, hasLeadCapture, businessName, isOldCustomer } = useRoleFlags()

const { realName, newCustomerFlag, flagImage, getMinePageData } = useMergeUserInfo()

const {
  lightApp,
  marketAreaLightApp,
  buyStockLightApp,
  throttleRun,
  forceRun,
  openLightApp,
  getMoneyMarks,
  clearMoneyMark,
} = useLightApp()

const userActivity = useNewUserActivity()

const { openBusinessPopup, showBussiness, showType } = useContactBuisness()

const { run: getMinePageDataThrottle, forceRun: getMinePageDataForce } = useThrottleAsync(getMinePageData)

const { getDetailDataForce, getDetailDataThrottle, result, isFetching } = useFetchAdvertisDetail({ pageName: 'mine' })

const { run: delayFetchFollowThrottle, forceRun: delayFetchFollow } = useThrottleAsync(homeStore.getFollow)

const { isChanged, resetChange } = useUserInfoChange(() => {
  clearMoneyMark()
})

const { data } = toRefs(homeStore)

const toGetMoney = () => {
  useApplication().navigateApplicationWithCode(ApplicationCodeMap['我的-奖励金'])
}

const isShowPsdTip = ref(false) // 是否展示设置密码提示
const isRefresh = ref(false)

const followWechatShow = ref(!getStorageWithExpiration('WeChatxpire'))
const isShowCustomerBindDialog = ref(false) // 是否展示绑码组件弹窗
const customerBindExpressType = ref('我的') // 绑码弹窗埋点场景：头部绑定入口=我的，预存运费入口=预存运费

const showWxFlag = computed(() => data.value.follow.showWxFlag)

const marketAreaLightAppFilter = computed(() => {
  if (isNew.value && !isH5Env) {
    return marketAreaLightApp.value.slice(1)
  }
  return marketAreaLightApp.value
})

const getFollowWechatShow = () => {
  followWechatShow.value = false
  setStorageWithExpiration('WeChatxpire', true, 60 * 24)
  homeStore.closeFlollow()
}

const onRefresh = async () => {
  try {
    isRefresh.value = true
    await refreshMinePage(false, true)
  } finally {
    isRefresh.value = false
    stopPullDownRefresh()
  }
}

const refreshMinePage = async (needThrottle = true, isRefresh = false) => {
  getMoneyMarks()
  needThrottle ? await getMinePageDataThrottle() : await getMinePageDataForce()
  needThrottle
    ? await getDetailDataThrottle({ adTypeList: ['10', '20', '30', '70'], isHasMoney: !isH5Env })
    : await getDetailDataForce({ adTypeList: ['10', '20', '30', '70'], isHasMoney: !isH5Env })
  needThrottle ? throttleRun() : forceRun()
  if (isLogin.value) {
    needThrottle ? checkNeedShowThrottle() : checkNeedShowForce()
    needThrottle ? delayFetchFollowThrottle() : delayFetchFollow()
  }
  if (isNew.value) {
    const hasLeadCapture = await userActivity.getNewCustomerInfo(isRefresh)
    if (hasLeadCapture) {
      homeStore.getBusinessQrCode()
    }
  }
}

const backMyAccount = () => {
  refreshMinePage(false)
}

const onShowCustomerBindDialog = () => {
  customerBindExpressType.value = '我的'
  isShowCustomerBindDialog.value = true
}

const checkOpenContactBuisness = () => {
  const mineParams = Taro.getStorageSync('mineParams')
  if (mineParams) {
    openBusinessPopup()
    Taro.removeStorageSync('mineParams')
  }
}

useDidShow(() => {
  fixIosPageHide()
  splashManager.forceCloseSplash()
  report_pv_event('page_home_mine')
  const storeTip = Taro.getStorageSync('is_show_psd_setting_tip')
  isShowPsdTip.value = !!storeTip
  refreshMinePage(!isChanged.value, false)
  resetChange()
  handleTabShowAsync()
  checkOpenContactBuisness()
})
const pageIsActive = useTabPageActive()

watch([appUpdatePopupShow, pageIsActive], ([updateShow, isActive]) => {
  if (isActive) {
    splashManager.onHide(() => {
      if (updateShow) {
        Taro.hideTabBar()
        setTimeout(() => {
          popupRef.value.closePopup()
        }, 1000)
      } else {
        Taro.showTabBar()
      }
    })
  }
})

useTabItemTap(() => {
  report_clk_home_tab()
  report_CLK_event('clk_home_button_name', {
    event_code: 'clk_home_button_name',
    page_code: 'page_homepage_v1',
    region_code: 'functional_area',
    event_name: '移动端新版首页_底部tab_点击',
    region_name: '底部tab',
    pageName: '我的',
  })
})

const handleOpenLightApp = (applicationItem, areaName = '') => {
  let jump = true
  if (applicationItem.applicationCode === 'H5_CONTACT_BUSINESS_MINI_V1') {
    openBusinessPopup()
    jump = false
  }
  // 未绑码点击「预存运费」菜单：拉起绑码半屏弹窗，不跳转（埋点照常上报）
  // MenuCodeMap['我的预存运费'] 仅微信端有值，非微信端按 menuName 兜底匹配
  const isPredepositEntry =
    applicationItem.menuName === '预存运费' ||
    (MenuCodeMap['我的预存运费'] && applicationItem.menuCode === MenuCodeMap['我的预存运费'])
  if (jump && isPredepositEntry && !userInfo.value.customerCode) {
    openLightApp(applicationItem, areaName, false)
    customerBindExpressType.value = '预存运费'
    isShowCustomerBindDialog.value = true
    return
  }
  openLightApp(applicationItem, areaName, jump)
}

onMounted(() => {
  if (event === 'contactSales') {
    openBusinessPopup()
  }
  // console.log('跳转路由数据：', lightApp.value)
})

useDidShow(() => {
  /* 识别到小程序码: 联系商务（switchTab 参数经 storage 中转，tab 页可能已加载，须在 onShow 消费） */
  consumeScanCodeQuery()
})
</script>
