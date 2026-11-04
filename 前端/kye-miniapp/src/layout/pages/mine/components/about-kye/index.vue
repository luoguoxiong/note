<template>
  <view class="about-kye">
    <view class="header">
      <view class="title">了解跨越</view>
      <view class="btn" @click="toMore">
        <view class="text">查看更多</view>
        <image
          class="icon"
          src="https://ic-img.ky-express.com/netc/20260528_17198_!!1779940592019_48_48.png"
          alt=""
        ></image>
      </view>
    </view>
    <view
      class="wrap"
      id="about-kye-exp"
      v-exposure
      :exposure-report="{
        eventCode: 'exp_home_mine_information_v1',
        otherParams: {
          page_code: 'page_home_mine',
          region_code: 'top_information',
          region_name: '了解跨越',
          event_name: '移动端新版我的页_了解跨越_曝光',
          page_name: '移动端新版我的页',
          button_name: '查看更多、视频1实力领航、视频2时效领先、视频3科技护航',
        },
      }"
    >
      <view
        v-for="(item, index) in kyStyleInfo"
        :key="item.videoUrl"
        class="item"
        @click="clickVideo(item.videoUrl, item.title)"
      >
        <view class="header-text" v-if="loadIndex[index]">{{ item.title }}</view>
        <view class="sub-text" v-if="loadIndex[index]">{{ item.subTitle }}</view>
        <ky-lazy-image
          :delay="100"
          class="bg-img"
          :src="item.videoCover"
          alt=""
          :placeholder="placeholder"
          @load="handleLoad(index)"
        />
        <!-- <ky-lazy-image :delay="500" :placeholder="placeholder" class="placeholder" :src="''"></ky-lazy-image> -->
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import placeholder from '@/layout/assets/images/kystyle.png'
import { getEnvConfig } from '@/public/config'
import { openURL } from '@/modules/webview/utils'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { report_CLK_event } from '@/public/utils/reportUtil'
import './index.scss'
import { useNewUserActivity } from '@/store/useNewUserActivity'
import { computed, ref } from 'vue'

useExposureReport(['about-kye-exp'])

const { data } = useNewUserActivity()

const kyStyleInfo = computed(() => data.kyStyleInfo)

const loadIndex = ref({
  0: false,
  1: false,
  2: false,
})

const handleLoad = (index: number) => {
  loadIndex.value[index] = true
}

const toMore = () => {
  report_CLK_event('clk_home_mine_information_v1', {
    event_code: 'clk_home_mine_information_v1',
    page_code: 'page_home_mine',
    region_code: 'top_information',
    region_name: '了解跨越',
    event_name: '移动端新版我的页_了解跨越_点击',
    page_name: '移动端新版我的页',
    button_name: '查看更多',
  })
  const { isProd } = getEnvConfig()
  const url = isProd
    ? 'https://ic-h5.kye-erp.com/netc-h5-modules/kye-style/index.html#/?hideNav=true'
    : 'https://ic-h5-uat.kye-erp.com/netc-h5-modules/kye-style/index.html#/?hideNav=true'
  openURL(url, { needLogin: true })
}

const clickVideo = (url, title) => {
  report_CLK_event('clk_home_mine_information_v1', {
    event_code: 'clk_home_mine_information_v1',
    page_code: 'page_home_mine',
    region_code: 'top_information',
    region_name: '了解跨越',
    event_name: '移动端新版我的页_了解跨越_点击',
    page_name: '移动端新版我的页',
    button_name: title,
  })
  openURL(url, {
    needLogin: true,
  })
}
</script>
