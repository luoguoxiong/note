<template>
  <view
    :class="{
      'page-waybill': true,
      'page-waybill-native': true,
      'page-waybill-h5': isH5,
      greyTheme: themeConfig.isGrayTheme,
    }"
  >
    <PageWaybillSearch :isRoot="true" />
    <!-- 全局Toast -->
    <TaroToast id="page-waybil-toast-id" />
  </view>
</template>

<script setup lang="ts">
import { handleTabShowAsync } from '@public/appInit/initTabAsync'

defineOptions({ name: 'WaybillPage' })

import './index.scss'
import { PageWaybillSearch } from '@/layout/pages/home/asyncComponents'
import { useThemeStore } from '@/store/theme'
import TaroToast from '@public/components/base/toast/toast.vue'
import Taro, { useDidShow, useShareAppMessage, useTabItemTap } from '@tarojs/taro'
import { report_CLK_event } from '@/public/utils'
import { getNotifyReceiveShareWx } from '@/public/hooks/useNotifyReceiveShare'
import { getOnlineH5Url } from '@/modules/waybill-build/constants/externalLink'
import { splashManager } from '@/public/components/business/advertise-center'
import { fixIosPageHide } from '@/public/h5/init'
import { trackClick } from '@public/utils/report/reportPerformance'

// 判断当前是否是h5的环境
const isH5: boolean = Taro.getEnv() === Taro.ENV_TYPE.WEB

const { themeConfig } = useThemeStore()

useDidShow(() => {
  fixIosPageHide()
  splashManager.forceCloseSplash()
  handleTabShowAsync()
})

useShareAppMessage((res) => {
  // TODO: 点击分享按钮先存waybillNumber 再获取
  const params = {
    onlineH5Url: getOnlineH5Url(),
  }
  const obj = getNotifyReceiveShareWx(res, params)
  return obj
})
useTabItemTap(() => {
  trackClick()
  report_CLK_event('clk_home_button_name', {
    event_code: 'clk_home_button_name',
    page_code: 'page_homepage_v1',
    region_code: 'functional_area',
    event_name: '移动端新版首页_底部tab_点击',
    region_name: '底部tab',
    pageName: '查件',
  })
})
</script>
