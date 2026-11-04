<template>
  <!-- 飞书环境 -->
  <view
    v-if="isH5FSEnv"
    class="app-entry app-entry-h5"
    id="light-app-exp"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_functional_area_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'functional_area',
        region_name: '金刚区',
        event_name: '移动端新版首页_金刚区_曝光',
        page_name: '移动端新版首页',
        access_name: lightApp.map((item) => item.menuName).join('、'),
        customer_name: '新客',
      },
    }"
  >
    <view v-for="app in lightApp" :key="app.menuCode" class="app-entry-item-h5" @click="handleAppClick(app)">
      <view class="app-entry-item-h5-left">
        <ky-lazy-image
          :delay="1000"
          :placeholder="placeholder"
          class="app-entry-item-h5-left__icon"
          :src="app.menuIcon"
        ></ky-lazy-image>
        <view class="app-entry-item-h5-left__text">{{ app.menuName }}</view>
        <ky-lazy-image
          :delay="1000"
          v-if="isLogin && (hasShippingExpiredActivity || hasLeadCaptureActivity) && app.menuName === '运费时效查询'"
          class="act-icon"
          src="https://ic-img.ky-express.com/netc/20260424_73965_!!1776996800931_116_60.png"
        ></ky-lazy-image>
      </view>
      <ky-lazy-image
        delay="1000"
        class="app-entry-item-h5-right"
        src="https://ic-img.ky-express.com/netc/20260413_9446_!!1776060377686_24_24.svg+xml"
      ></ky-lazy-image>
    </view>
  </view>
  <!-- 其他端 -->
  <view
    v-else
    class="app-entry"
    id="light-app-exp"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_functional_area_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'functional_area',
        region_name: '金刚区',
        event_name: '移动端新版首页_金刚区_曝光',
        page_name: '移动端新版首页',
        access_name: lightApp.map((item) => item.menuName).join('、'),
        customer_name: '新客',
      },
    }"
  >
    <view v-for="app in lightApp" :key="app.menuCode" class="app-entry-item" @click="handleAppClick(app)">
      <ky-lazy-image :placeholder="placeholder" class="app-entry-item__icon" :src="app.menuIcon"></ky-lazy-image>
      <view class="app-entry-item__text">
        <view class="app-entry-item__text__left">{{ app.menuName }}</view>
        <ky-lazy-image
          :delay="1000"
          class="app-entry-item__text__right"
          src="https://ic-img.ky-express.com/netc/20260413_9446_!!1776060377686_24_24.svg+xml"
        ></ky-lazy-image>
      </view>
      <ky-lazy-image
        :delay="1000"
        v-show="isLogin && (hasShippingExpiredActivity || hasLeadCaptureActivity) && app.menuName === '运费时效查询'"
        class="act-icon"
        src="https://ic-img.ky-express.com/netc/20260424_73965_!!1776996800931_116_60.png"
      ></ky-lazy-image>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { useRoleFlags } from '@/layout/pages/home/hooks'
import { useGetAreaLightApp } from '@/public/hooks/useGetAreaLightApp'
import { AreaCodePlatMap } from '@/public/utils/application/constants'
import { computed } from 'vue'
import './index.scss'
import { debounce } from 'lodash-es'
import { useApplication } from '@/public/utils/application/useApplication'
import { isH5FSEnv } from '@/public/utils/device'
import { report_CLK_event } from '@/public/utils/reportUtil'
import placeholder from '@/layout/assets/images/placeholder.png'
import { useLogin } from '@/public/hooks'
import { useExposureReport } from '@/public/hooks/useExposureReport'

useExposureReport(['light-app-exp'])

// ========= 登录状态 =========
const { isLogin } = useLogin()

const { hasShippingExpiredActivity, hasLeadCaptureActivity, activityParams } = useRoleFlags()

const { navigateApplicationExtra } = useApplication()

const lightApp = computed(() => {
  return useGetAreaLightApp(AreaCodePlatMap['新客首页']).lightApps.value || []
})

const handleAppClick = debounce((item) => {
  report_CLK_event('clk_homepage_functional_area_button_v1', {
    event_code: 'clk_homepage_functional_area_button_v1',
    page_code: 'page_homepage_v1',
    region_code: 'functional_area',
    region_name: '金刚区',
    event_name: '移动端新版首页_金刚区_点击',
    page_name: '移动端新版首页',
    access_name: item.menuName,
    customer_name: '新客',
  })
  navigateApplicationExtra(item, activityParams.value)
}, 100)
</script>
