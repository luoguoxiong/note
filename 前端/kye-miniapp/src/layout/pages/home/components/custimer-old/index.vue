<template>
  <view
    id="home-page"
    :style="{
      paddingTop: appHeaderHeight + 'px',
      backgroundImage: `url(${urlContact(themeConfig.config.home_background)})`,
    }"
    :class="{
      'home-page': true,
      'h5-tab-page-layout': isH5Env,
      greyTheme: themeConfig.isGrayTheme,
    }"
  >
    <!-- 背景图Logo -->
    <ky-lazy-image
      :delay="500"
      v-if="(isWxMiniApp || isAliMiniApp || isAmapMiniApp) && !isWxAppEnv"
      :style="{
        top: logoOffsetTop + 'px',
        left: logoOffsetLeft + 'px',
      }"
      src="https://ic-img.ky-express.com/netc/20250719_35916_!!1752921342762_189_40.png"
      class="home-logo"
    ></ky-lazy-image>
    <!-- 搜索区 -->
    <Search />

    <view class="home-page-content">
      <ky-list :refreshing="refreshing" :isEmpty="true" disabledLoad @refresh="onRefresh" @scroll="handleScroll">
        <!-- 广告Banner、跑马灯 -->
        <view class="layout-pad24">
          <AdvertiseBanner
            v-model="banner"
            :isFetching="isFetching"
            class="home-page-banner"
            pageName="home"
            :changeQT="{
              page_code: 'page_homepage_v1',
              region_code: 'top_banner',
              event_code: 'clk_homepage_top_banner_toggle_v1',
            }"
            :clickQT="{
              page_code: 'page_homepage_v1',
              region_code: 'top_banner',
              event_code: 'clk_homepage_top_banner_v1',
            }"
          />

          <AdvertiseNoticeNew
            v-model="notice"
            :closeQT="{
              page_code: 'page_homepage_v1',
              region_code: 'top_marquee',
              event_code: 'clk_homepage_top_marquee_close_v1',
            }"
            :clickQT="{
              page_code: 'page_homepage_v1',
              region_code: 'top_marquee',
              event_code: 'clk_homepage_top_marquee_v1',
            }"
            class="notice-wrap"
            pageName="home"
            :has-close="true"
          />
        </view>

        <view class="bg-content">
          <FastShipping />
          <!-- 轻应用金刚区 -->
          <LightApp />
          <!-- 绑码引导 -->
          <BindCode v-if="isNoBindCode" />
          <!-- 专属权益 -->
          <CouponPackage v-if="couponVisible && !(isAliMiniApp || isAmapMiniApp)" />
          <!-- 营销专区 -->
          <MarketArea v-if="isWxMiniApp" @sign-success-new="handleSignSuccessNew" />
        </view>
        <!-- 唯品会、运单信息、待办事项 -->
        <view class="bg-content">
          <TodoList @show-barcode="handleShowBarcode" />
        </view>

        <view class="bg-content">
          <!-- 每日任务 -->
          <DailyTask @sign-success="handleSignSuccessNew" />
        </view>
        <Footer />
        <view class="ad-place" v-if="crmActivityShow"></view>
      </ky-list>
    </view>
    <BarcodePopup ref="barcodePopupRef" />
    <!-- 新版签到弹窗 -->
    <SignSuccessNew v-if="signGifVisible" :integralAmount="integralAmount" @close="signGifVisible = false" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, onMounted } from 'vue'
import BindCode from '@/layout/pages/home/components/bind-code/index.vue'
import LightApp from '@/layout/pages/home/components/light-app/index.vue'
import DailyTask from '@/layout/pages/home/components/daily-task/index.vue'
import MarketArea from '@/layout/pages/home/components/market-area/index.vue'
import CouponPackage from '@/layout/pages/home/components/coupon-package/index.vue'
import Search from '@/layout/pages/home/components/search/index.vue'
import TodoList from '@/layout/pages/home/components/todo-list/index.vue'
import { useHomeStore } from '../../store'
import { useThemeStore } from '@/store/theme'
import FastShipping from '@/layout/pages/home/components/fast-shipping/v1.vue'
import BarcodePopup from '@/public/components/business/barcode-popup/index.vue'
import Footer from '@/public/components/base/footer/index.vue'
import { AdvertiseBanner, AdvertiseNoticeNew } from '@/public/components/business/advertise-center'
import SignSuccessNew from '@/layout/pages/home/components/sign-success-new/index.vue'
import {
  isAliMiniApp,
  isWxMiniApp,
  urlContact,
  isAmapMiniApp,
  report_CLK_event,
  isWxAppEnv,
  isH5Env,
} from '@/public/utils'
import { IBannerProp } from '@/public/components/business/advertise-center/banner/type'
import { INoticeProp } from '@/public/components/business/advertise-center/notice/type'
import { useRoleFlags } from '../../hooks'
import { initGlobalClickListener } from '@public/utils/report/reportPerformance'

defineOptions({ name: 'home-page' })

const props = defineProps<{ banner: IBannerProp; notice: INoticeProp; refreshing: boolean; isFetching: boolean }>()

const emit = defineEmits(['update:banner', 'update:notice', 'scroll', 'refresh'])

// ========= 登录状态 =========
const { isNoBindCode } = useRoleFlags()

const banner = computed({
  get: () => props.banner,
  set: (val) => emit('update:banner', val),
})

const notice = computed({
  get: () => props.notice,
  set: (val) => emit('update:notice', val),
})

const homeStore = useHomeStore()

const { themeConfig } = useThemeStore()

const signGifVisible = ref(false)

const integralAmount = ref(0)

const { appHeaderHeight, data, logoOffsetTop, logoOffsetLeft } = toRefs(homeStore)

const crmActivityShow = computed(() => data.value.crmActivity.show)

const couponVisible = computed(() => !!data.value.couponCardList?.length)

const barcodePopupRef = ref<InstanceType<typeof BarcodePopup>>()

const handleScroll = () => {
  emit('scroll')
}

const onRefresh = async () => {
  emit('refresh')
}

const handleShowBarcode = (waybillNumber: string) => {
  barcodePopupRef.value?.openPopup(waybillNumber)
  report_CLK_event('clk_homepage_latest_waybill_code_v1', {
    page_code: 'page_homepage_v1',
    region_code: 'waybill_todo_list',
  })
}

const handleSignSuccessNew = (value: number) => {
  integralAmount.value = value
  signGifVisible.value = true
}
onMounted(() => {
  initGlobalClickListener({ pageId: 'home-page' })
})
</script>
