<template>
  <view :class="['flow-bind-code', isH5FSEnv && 'is-fs']" v-if="showBindCode">
    <ky-lazy-image
      :delay="1000"
      class="close-icon"
      src="https://ic-img.ky-express.com/netc/20260408_6171_!!1775649765170_32_32.svg+xml"
      alt=""
      @click="closeBindCode"
    />
    <view class="flow-bind-code-content">
      <view class="flow-bind-code-content__title">已有企业客户编码？</view>
      <view class="flow-bind-code-content__desc">立即绑定，畅享企业专属服务</view>
    </view>
    <ky-button class="flow-bind-code-btn" @click="handleBindCode"> 去绑码 </ky-button>
  </view>

  <view class="follow-wechat" v-if="showWechat">
    <ky-lazy-image
      :delay="1000"
      src="https://ic-img.ky-express.com/netc/20260211_13787_!!1770773076952_64_64.png"
      @tap="closeWeChat"
    ></ky-lazy-image>
    <view class="follow-wechat__text">关注公众号，实时接收物流消息</view>
    <ky-button class="follow-wechat__button" type="primary" @click="handleFollow">去关注</ky-button>
  </view>
</template>
<script lang="ts" setup>
import './index.scss'
import { useLogin, useUserInfo } from '@/public/hooks'
import { setStorageWithExpiration, getStorageWithExpiration } from '@/public/utils/storageWithExpiration'
import { computed, ref, toRefs, watch } from 'vue'
import { useHomeStore } from '@/layout/pages/home/store'
import { openURL } from '@/modules/webview/utils'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { useApplication } from '@/public/utils/application/useApplication'
import { report_CLK_event, report_EXP_event } from '@/public/utils/reportUtil'
import { useRoleFlags } from '../../hooks'
import { isH5FSEnv, isWechatNotAppEnv } from '@/public/utils'

const { userInfo } = useUserInfo()

const bindCodeExpireKey = 'BindcodeExpire'

const weChatxpireKey = 'WeChatxpire'

const { isLogin } = useLogin()

const homeStore = useHomeStore()

const { navigateApplicationWithCode } = useApplication()

const { activityParams } = useRoleFlags()

const { data } = toRefs(homeStore)

const showWxFlag = computed(() => data.value.follow.showWxFlag)

const showBindCodeStatus = ref(!getStorageWithExpiration(bindCodeExpireKey))

const showWxFlagStatus = ref(!getStorageWithExpiration(weChatxpireKey))

const showBindCode = computed(() => {
  return (
    isLogin.value &&
    !userInfo.value.customerCode &&
    showBindCodeStatus.value &&
    `${userInfo.value?.isOldCustomer}` !== '1' &&
    !data.value.hasLeadCapture
  )
})

const showWechat = computed(() => {
  if (`${userInfo.value?.isOldCustomer}` !== '1') {
    return isLogin.value && showWxFlag.value && !showBindCode.value && showWxFlagStatus.value && isWechatNotAppEnv
  } else {
    return isLogin.value && showWxFlag.value && showWxFlagStatus.value && isWechatNotAppEnv
  }
})

watch(
  () => showBindCode.value,
  (val) => {
    if (val) {
      report_EXP_event('exp_homepage_customer_code_v1', {
        page_code: 'page_homepage_v1',
        region_code: 'customer_code',
        region_name: '绑码',
        event_name: '移动端新版首页_关闭_曝光',
        page_name: '移动端新版首页',
        customer_code: '关闭',
      })
      report_EXP_event('exp_homepage_customer_code_v1', {
        page_code: 'page_homepage_v1',
        region_code: 'customer_code',
        region_name: '绑码',
        event_name: '移动端新版首页_去绑码_曝光',
        page_name: '移动端新版首页',
        customer_code: '去绑码',
      })
    }
  },
)

const closeBindCode = () => {
  report_CLK_event('clk_homepage_customer_code_v1', {
    event_code: 'clk_homepage_customer_code_v1',
    page_code: 'page_homepage_v1',
    region_code: 'customer_code',
    region_name: '绑码',
    event_name: '移动端新版首页_关闭_点击',
    page_name: '移动端新版首页',
    customer_code: '关闭',
  })
  showBindCodeStatus.value = false
  setStorageWithExpiration(bindCodeExpireKey, true, 60 * 24)
}

const closeWeChat = () => {
  showWxFlagStatus.value = false
  setStorageWithExpiration(weChatxpireKey, true, 60 * 24)
  homeStore.closeFlollow()
}

const handleFollow = () => {
  openURL('https://mp.weixin.qq.com/s/L7uNt7nXE4g5fYkKtiArgw')
}

const handleBindCode = () => {
  report_CLK_event('clk_homepage_customer_code_v1', {
    event_code: 'clk_homepage_customer_code_v1',
    page_code: 'page_homepage_v1',
    region_code: 'customer_code',
    region_name: '绑码',
    event_name: '移动端新版首页_去绑码_点击',
    page_name: '移动端新版首页',
    customer_code: '去绑码',
  })
  const { areaCode, menuCode } = ApplicationCodeMap['绑码组件']
  navigateApplicationWithCode({
    areaCode,
    menuCode,
    queryParams: {
      express_type: '首页',
      ...activityParams.value,
    },
  })
}
</script>
