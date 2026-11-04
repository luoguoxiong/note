<template>
  <view
    :class="{
      'page-tab-order-page': true,
      'h5-tab-page-layout': isH5Env,
      'android-tab-page': !isIosEnv,
      greyTheme: themeConfig.isGrayTheme,
    }"
  >
    <ky-navbar :leftArrow="false" :title="title" v-if="isWxMiniApp && !isQwPC"></ky-navbar>
    <view class="page-tab-order-content">
      <AdvertiseBanner
        v-model="result.banner"
        :isFetching="isFetching"
        class="order-banner"
        :paginationOffset="60"
        pageName="order"
        :key="network.randowKey"
        :clickQT="{
          page_code: 'page_home_express',
          region_code: 'top_banner',
          event_code: 'clk_homepage_top_banner_v1',
        }"
        :changeQT="{
          page_code: 'page_home_express',
          region_code: 'top_banner',
          event_code: 'clk_homepage_top_banner_toggle_v1',
        }"
      />
      <view class="order-user-invite" v-if="isNew && !hasLeadCapture" @click="toInvitePage">
        <image
          id="order-user-invite-btn-exp"
          v-exposure
          :exposure-report="{
            eventCode: 'exp_home_express_service_v1',
            otherParams: {
              page_code: 'page_home_express',
              region_code: 'top_service',
              region_name: '专属服务',
              event_name: '移动端新版寄件页_获取专属服务方案_曝光',
              page_name: '主页_寄快递页',
            },
          }"
          class="img"
          :src="
            !hasLeadCaptureActivity
              ? 'https://ic-img.ky-express.com/netc/20260528_42178_!!1779952666745_1380_272.png'
              : 'https://ic-img.ky-express.com/netc/20260528_61427_!!1779952666742_1380_272.png'
          "
          alt=""
        ></image>
      </view>
      <view :class="['order-box', isNew && !hasLeadCapture && 'mt-440']">
        <view class="order-top-part">
          <AdvertiseNotice
            v-model="result.notice"
            :closeQT="{
              page_code: 'page_home_express',
              region_code: 'top_marquee',
              event_code: 'clk_homepage_top_marquee_close_v1',
            }"
            :clickQT="{
              page_code: 'page_home_express',
              region_code: 'top_marquee',
              event_code: 'clk_homepage_top_marquee_v1',
            }"
            class="order-notice-wrap"
            pageName="order"
            type="glost"
          />
          <view class="order-entry">
            <view class="order-entry-item" @click="toOrderPage">
              <network-image
                class="item-logo"
                src="https://ic-h5.kye-erp.com/intro/miniprogram/icon_home_order2.gif"
              ></network-image>
              <image
                :src="lightAppInfo.orderPage?.smallIcon"
                class="item-tip"
                v-if="lightAppInfo.orderPage?.smallIcon"
              ></image>
              <view class="item-title">快速寄件</view>
              <view class="item-desc">1小时上门取件</view>
            </view>
            <view class="order-entry-item" @click="handleScanQRCode">
              <network-image
                class="item-logo"
                src="https://ic-img.ky-express.com/netc/20251216_45138_!!1765888143414_720_540.gif"
              ></network-image>
              <view class="item-title">扫一扫</view>
              <view class="item-desc">二维码下单/查件</view>
            </view>
          </view>
        </view>

        <view class="order-bottom-part" v-if="lightAppInfo.showLight.length > 0">
          <view
            class="order-bottom-item"
            v-for="(item, index) in lightAppInfo.showLight"
            :key="item.menuCode"
            @click="openLightApp(item, index)"
          >
            <network-image class="order-bottom-icon" :src="item.menuIcon"></network-image>
            <view class="order-bottom-text">
              <view class="order-bottom-title">{{ item.menuName }}</view>
              <view class="order-bottom-subtitle">
                <view
                  :class="{
                    hasWaytingAuth: auditInfop.count > 0,
                  }"
                  v-if="item.menuCode === MenuCodeMap['寄件-下单审核']"
                  >{{ auditInfop.desc }}</view
                >
                <template v-else> {{ item.menuContent }} </template>
              </view>
            </view>
          </view>
        </view>

        <view
          class="order-driver"
          v-if="lightAppInfo.draiverInfo"
          @click="openLightApp(lightAppInfo.draiverInfo, lightAppInfo.showLight.length)"
        >
          <network-image
            src="https://ic-img.ky-express.com/netc/20250722_23632_!!1753152493834_192_160.png"
            class="order-driver-icon"
          ></network-image>
          <view class="order-driver-title">{{ isH5FSEnv ? lightAppInfo.draiverInfo.menuName : '预约司机' }}</view>
          <view class="order-driver-num">{{ isH5FSEnv ? auditInfop.desc : '待通知取货/已取消' }}</view>
          <network-image
            src="https://ic-img.ky-express.com/netc/20250722_93240_!!1753152951028_72_72.png"
            class="order-driver-arrow"
          ></network-image>
        </view>
      </view>
    </view>
    <Footer></Footer>
  </view>
  <AdvertisePopup
    v-model="result.popup"
    :isFetching="isFetching"
    qt-page-code="page_home_express"
    ref="popupRef"
    pageName="order"
  />
  <OrderQuestion></OrderQuestion>
  <!-- 版本更新弹窗 -->
  <VersionUpdatePopup v-if="appUpdatePopupShow"></VersionUpdatePopup>
  <AdvertiseFloatPanel v-model="result.floatPanel" :top-limit="navBarHeight"></AdvertiseFloatPanel>
</template>

<script setup lang="ts">
import {
  AdvertiseBanner,
  AdvertiseNotice,
  AdvertisePopup,
  splashManager,
  useFetchAdvertisDetail,
} from '@/public/components/business/advertise-center'
import kyeNavigate from '@public/utils/native/navigate'
import { scanQrcode } from '@public/utils/scan'
import { isH5Env, isH5FSEnv, isIosEnv, isQwPC, isWxMiniApp, report_CLK_event, report_pv_event } from '@/public/utils'
import Taro, { useDidShow, useTabItemTap } from '@tarojs/taro'
import OrderQuestion from '@/public/components/business/order-question/index.vue'
import { computed, ref, watch } from 'vue'
import { useThemeStore } from '@/store/theme'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useGetAreaLightApp } from '@/public/hooks/useGetAreaLightApp'
import { AreaCodePlatMap, MenuCodeMap } from '@/public/utils/application/constants'
import './index.scss'
import { getwaybillDraftStatistic } from '@/public/apis/order'
import { useApplication } from '@/public/utils/application/useApplication'
import { ApplicationItem } from '@/public/utils/application/applicationType'
import { useNetworkStore } from '@/store/useNetworkStore'
import { debounce } from 'lodash-es'
import { compareVersionNew, getEnvConfig } from '@/public/constants'
import { useLogin, useTabPageActive } from '@/public/hooks'
import { handleTabShowAsync } from '@public/appInit/initTabAsync'
import { useUserInfoChange } from '@/public/hooks/useUserInfoChange'
import { getAreasApplicationAndMarkers } from '@/public/utils/application/applicationService'
import { useThrottleAsync } from '@/public/hooks/useThrottleAsync'
import { fixIosPageHide } from '@/public/h5/init'
import {
  checkNeedShowForce,
  checkNeedShowThrottle,
  appUpdatePopupShow,
} from '@/public/components/business/version-update-popup/menager'
import { useRoleFlags } from '../home/hooks'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import VersionUpdatePopup from '@/public/components/business/version-update-popup/index.vue'
import Footer from '@/public/components/base/footer/index.vue'
import { useNewUserActivity } from '@/store/useNewUserActivity'
import { useGetSystemNavbar } from '@/public/hooks/useGetSystemNavbar'
import { AdvertiseFloatPanel } from '@/public/components/business/advertise-center'
import { getVersionAsHeader } from '@public/constants/version'
import { trackClick } from '@public/utils/report/reportPerformance'

useExposureReport(['order-user-invite-btn-exp'])

const { isNew, hasLeadCapture, hasLeadCaptureActivity, activityParams } = useRoleFlags()
const network = useNetworkStore()

const { themeConfig } = useThemeStore()

const userActivity = useNewUserActivity()

const { autoLoginHook } = useAutoLogin()

const { isLogin } = useLogin()

const { navigateApplication, navigateApplicationWithCode } = useApplication()

const popupRef = ref()

const auditInfop = ref({
  waybillAuditShow: false,
  desc: '',
  count: 0,
})

const openLightApp = debounce(
  (lightInfo: ApplicationItem, index) => {
    if (lightInfo.menuCode === MenuCodeMap['寄件-下单审核']) {
      checkH5Version(lightInfo)
    } else {
      navigateApplication(lightInfo)
    }
    report_CLK_event('clk_home_express_card_second_button_v1', {
      event_code: 'clk_home_express_card_second_button_v1',
      page_code: 'page_home_express',

      event_name: '主页_寄快递页_副卡片点击_控件名称_点击',
      button_name: lightInfo.menuName,
      ranking_number: index + 1,
    })
  },
  100,
  { trailing: false, leading: true },
)

//检查下单审核的H5版本号，如果低于灰度放量的线上版本号，则写死，为了处理放量过程中，版本不一致的问题,调价全量后删除即可
// TODO: 集成上线的时候检查版本
const checkH5Version = (lightInfo: ApplicationItem) => {
  const { isProd } = getEnvConfig()
  const normalUrl = isProd
    ? 'https://ic-h5.kye-erp.com/h5-offline/netc-h5-order-offline/'
    : 'https://ic-h5-uat.kye-erp.com/h5-offline/netc-h5-order-offline/'
  const targetVersion = isProd ? '1.487.173' : '1.13.1403'
  const noMatchVersion = compareVersionNew(lightInfo.versionNumber || '', targetVersion) === -1
  if (noMatchVersion) {
    lightInfo.loadAddress = normalUrl
  }
  navigateApplication(lightInfo)
}

const { getDetailDataForce, result, isFetching } = useFetchAdvertisDetail({ pageName: 'order' })
const { navBarHeight } = useGetSystemNavbar()

const getAuthNum = async () => {
  try {
    if (!isLogin.value) {
      auditInfop.value = {
        waybillAuditShow: false,
        desc: '',
        count: 0,
      }
      return
    }
    const res = await getwaybillDraftStatistic()
    auditInfop.value = res.data
  } catch (error) {
    auditInfop.value = {
      waybillAuditShow: false,
      desc: '',
      count: 0,
    }
    console.error('getAuthNum', error)
  }
}

const title = computed(() => {
  return Taro.getEnv() === Taro.ENV_TYPE.ALIPAY ? ' ' : '寄快递'
})

const toOrderPage = () => {
  report_CLK_event('clk_home_express_card_first_button_v1', {
    event_code: 'clk_home_express_card_first_button_v1',
    page_code: 'page_home_express',

    event_name: '主页_寄快递页_主卡片点击_控件名称_点击',
    button_name: '快速寄件',
  })

  if (getEnvConfig().isApp) {
    kyeNavigate.navigateBefore('navigateTo', {
      url: '/modules/order-build/pages/order/index',
      needLogin: true,
    })
    return
  }
  Taro.navigateTo({
    url: '/modules/order-build/pages/order/index',
  })
}

const handleScanQRCode = () => {
  report_CLK_event('clk_home_express_card_first_button_v1', {
    event_code: 'clk_home_express_card_first_button_v1',
    page_code: 'page_home_express',
    event_name: '主页_寄快递页_主卡片点击_控件名称_点击',
    button_name: '扫一扫',
  })
  scanQrcode()
}

const { lightApps: otherServiceUsedApp } = useGetAreaLightApp(AreaCodePlatMap.寄件页)

const lightAppInfo = computed(() => {
  let apps = otherServiceUsedApp.value

  const orderPage = apps.filter((item) => item.menuCode === MenuCodeMap['下单原生入口'])

  apps = apps.filter((item) => item.menuCode !== MenuCodeMap['下单原生入口'])

  if (!auditInfop.value.waybillAuditShow) {
    apps = apps.filter((item) => item.menuCode !== MenuCodeMap['寄件-下单审核'])
  }
  // 展会下单本地兜底菜单（后端未下发时注入，仅保留类型必填、渲染与跳转必需字段）
  const exhibitionMenu: ApplicationItem = {
    menuCode: 'M6309',
    applicationCode: 'H5_ORDER_EXHIBITION_MINI_V1',
    customParam: '',
    accessMode: 1,
    loadAddress: '/modules/order-build-sub-pages/pages/order-exhibition/index',
    menuName: '展会下单',
    menuContent: '撤展/来展更便捷',
    menuIcon: 'https://hongbao-1257092428.cos.ap-guangzhou.myqcloud.com/light_app_icon/3ca20b7ca4d24e48a3f2d492a3d9a37d.png',
  }
  const hasExhibition = apps.some((item) => item.menuCode === MenuCodeMap['寄件-展会下单'])
  // 后端未下发时本地兜底注入：长度足够固定在第三个位置，不足则排在末尾
  if (!hasExhibition) {
    apps.splice(2, 0, exhibitionMenu)
  }
  // 飞书临时处理
  if (isH5FSEnv) {
    return {
      orderPage: orderPage?.[0],
      showLight: [],
      draiverInfo: apps.find((item) => item.menuCode === MenuCodeMap['寄件-下单审核']),
    }
  }

  const isEven = apps.length % 2 === 0

  if (isEven) {
    return {
      orderPage: orderPage?.[0],
      showLight: apps,
      draiverInfo: undefined,
    }
  }

  return {
    orderPage: orderPage?.[0],
    showLight: apps.filter((item) => item.menuCode !== MenuCodeMap['寄件-预约司机']),
    draiverInfo: apps.find((item) => item.menuCode === MenuCodeMap['寄件-预约司机']),
  }
})

const { isChanged, resetChange } = useUserInfoChange()

const getOrderPageData = async () => {
  getAreasApplicationAndMarkers([AreaCodePlatMap.寄件页])
  getDetailDataForce({
    adTypeList: ['10', '20', '30', '70'],
  })
}

const { run, forceRun } = useThrottleAsync(getOrderPageData)

useDidShow(async () => {
  fixIosPageHide()
  try {
    await autoLoginHook()
  } finally {
    getAuthNum()
    isChanged.value ? await forceRun() : await run()
    if (isLogin.value) {
      isChanged.value ? checkNeedShowForce() : checkNeedShowThrottle()
    }
    userActivity.getNewCustomerInfo(false)
    resetChange()
    handleTabShowAsync()
    report_pv_event('page_home_express')
  }
  splashManager.forceCloseSplash()
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
  trackClick()
  report_CLK_event('clk_home_button_name', {
    event_code: 'clk_home_button_name',
    page_code: 'page_homepage_v1',
    region_code: 'functional_area',
    event_name: '移动端新版首页_底部tab_点击',
    region_name: '底部tab',
    pageName: '寄件',
  })
})

const toInvitePage = () => {
  report_CLK_event('clk_home_express_service_v1', {
    event_code: 'clk_home_express_service_v1',
    page_code: 'page_home_express',
    region_code: 'top_service',
    region_name: '专属服务',
    event_name: '移动端新版寄件页_获取专属服务方案_点击',
    page_name: '主页_寄快递页',
  })
  navigateApplicationWithCode({
    ...ApplicationCodeMap['首页-申请专属商务'],
    queryParams: {
      express_type: '寄件页',
      sendCouponSource: 80,
      backSence: 10,
      ...activityParams.value,
    },
  })
}
</script>
