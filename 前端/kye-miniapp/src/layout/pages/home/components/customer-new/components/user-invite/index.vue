<template>
  <view :class="['user-invite', isLogin && 'user-invite-bg']">
    <view class="user-invite-content">
      <view class="user-invite-title">{{ titleText }}</view>
      <view class="user-invite-desc" v-show="!isLogin">登录后，解锁更多企业专属服务</view>
      <view class="user-invite-desc" v-show="isLogin && hasLeadCapture">
        商务将尽快与您联系，您可通过以下方式主动咨询
      </view>
      <view class="user-invite-desc-wrap" v-show="isLogin && !hasLeadCapture">
        <view class="user-invite-item">7x24小时响应</view>
        <view class="user-invite-item mid-item">企业专属报价</view>
        <view class="user-invite-item">全程管家式服务</view>
      </view>
      <ky-button class="user-invite-btn" type="primary" @click="handleClick" v-show="!hasLeadCapture || !isLogin">
        <ky-lazy-image
          :delay="1000"
          v-show="isLogin && hasLeadCaptureActivity"
          :class="['hb-icon', !isIosEnv && 'bottom-0']"
          src="https://ic-img.ky-express.com/netc/20260424_584_!!1777014612413_290_214.png"
          alt=""
        />
        <view
          v-if="isLogin"
          id="user-invite-btn-exp"
          v-exposure
          :exposure-report="{
            eventCode: 'exp_homepage_service_v1',
            otherParams: {
              page_code: 'page_homepage_v1',
              region_code: 'top_service',
              region_name: '专属服务',
              event_name: '移动端新版首页_获取专属服务方案_曝光',
              page_name: '移动端新版首页',
            },
          }"
        >
          获取专属服务方案
        </view>
        <view v-else>登录 / 注册</view>
        <ky-lazy-image
          :delay="1000"
          v-show="isLogin"
          class="arrow-icon"
          src="https://ic-img.ky-express.com/netc/20260408_17096_!!1775641449552_14_18.svg+xml"
          alt=""
        />
        <ky-lazy-image
          v-show="isLogin && hasLeadCaptureActivity"
          class="flag-icon"
          :delay="1000"
          src="https://ic-img.ky-express.com/netc/20260408_45648_!!1775641050779_176_40.svg+xml"
          alt=""
        />
      </ky-button>
      <view class="user-invite-btn-wrap" v-if="isLogin && hasLeadCapture">
        <ky-button
          :class="['half-btn', 'user-invite-btn-contact', hasBusinessQrcode && 'contact-btn']"
          type="primary"
          :plain="hasBusinessQrcode"
          id="user-invite-contact-exp"
          v-exposure
          :exposure-report="{
            eventCode: 'exp_homepage_customer_button_v1',
            otherParams: {
              page_code: 'page_homepage_v1',
              region_code: 'customer_code',
              region_name: '联系商务',
              event_name: '移动端新版首页_新客按钮_曝光',
              page_name: '移动端新版首页',
              access_name: '联系商务',
            },
          }"
          @click="openBusinessPopup"
        >
          联系商务
        </ky-button>
        <ky-button
          v-if="hasBusinessQrcode"
          class="half-btn user-invite-btn-add"
          id="user-invite-add-exp"
          v-exposure
          :exposure-report="{
            eventCode: 'exp_homepage_customer_button_v1',
            otherParams: {
              page_code: 'page_homepage_v1',
              region_code: 'customer_code',
              region_name: '联系商务',
              event_name: '移动端新版首页_新客按钮_曝光',
              page_name: '移动端新版首页',
              access_name: '添加企微',
            },
          }"
          @click="addWxWork"
        >
          添加企微
        </ky-button>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { computed, watch } from 'vue'
import { useApplication } from '@/public/utils/application/useApplication'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import './index.scss'
import { useLogin } from '@/public/hooks'
import { useRoleFlags } from '@/layout/pages/home/hooks/use-role-flags'
import { report_CLK_event } from '@/public/utils/reportUtil'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { isIosEnv } from '@/public/utils/device'

// ========= 登录状态 =========
const { isLogin } = useLogin()

const emits = defineEmits(['show-contact-business'])

const { navigateApplicationWithCode } = useApplication()

const { hasLeadCapture, hasLeadCaptureActivity, activityParams, hasBusinessQrcode } = useRoleFlags()

const titleText = computed(() => {
  if (isLogin.value) {
    if (hasLeadCapture.value) {
      return '您的专属服务方案申请已提交成功'
    } else {
      return '1v1商务为您定制服务方案'
    }
  } else {
    return '您尚未登录'
  }
})

watch(
  () => isLogin.value,
  (val) => {
    if (val) {
      if (!hasLeadCapture.value) {
        useExposureReport(['user-invite-btn-exp'])
      } else {
        useExposureReport(['user-invite-contact-exp'])
        if (hasBusinessQrcode.value) {
          useExposureReport(['user-invite-add-exp'])
        }
      }
    }
  },
  { immediate: true },
)

// 登录/申请专属商务
const handleClick = () => {
  if (isLogin.value) {
    report_CLK_event('clk_homepage_service_v1', {
      event_code: 'clk_homepage_service_v1',
      page_code: 'page_homepage_v1',
      region_code: 'top_service',
      region_name: '专属服务',
      event_name: '移动端新版首页_获取专属服务方案_点击',
      page_name: '移动端新版首页',
    })
    navigateApplicationWithCode({
      ...ApplicationCodeMap['首页-申请专属商务'],
      queryParams: {
        express_type: '首页',
        ...activityParams.value,
      },
    })
  } else {
    report_CLK_event('clk_homepage_top_login_v1', {
      region_code: 'top_login',
      region_name: '登录区域',
      event_code: 'clk_homepage_top_login_v1',
      event_name: '移动端新版首页_登录_点击',
      page_code: 'page_homepage_v1',
      page_name: '移动端新版首页',
    })
    Taro.navigateTo({
      url: '/modules/user/pages/login/index?delta=2&needNewUserGuide=true&backPage=home&express_type=首页',
    })
  }
}

// 添加企微
const addWxWork = () => {
  report_CLK_event('clk_homepage_customer_button_v1', {
    event_code: 'clk_homepage_customer_button_v1',
    page_code: 'page_homepage_v1',
    region_code: 'customer_code',
    region_name: '联系商务',
    event_name: '移动端新版首页_新客按钮_点击',
    page_name: '移动端新版首页',
    access_name: '添加企微',
  })
  emits('show-contact-business', 'qrcode')
}

const openBusinessPopup = () => {
  report_CLK_event('clk_homepage_customer_button_v1', {
    event_code: 'clk_homepage_customer_button_v1',
    page_code: 'page_homepage_v1',
    region_code: 'customer_code',
    region_name: '联系商务',
    event_name: '移动端新版首页_新客按钮_点击',
    page_name: '移动端新版首页',
    access_name: '联系商务',
  })
  emits('show-contact-business', 'phone')
}
</script>
