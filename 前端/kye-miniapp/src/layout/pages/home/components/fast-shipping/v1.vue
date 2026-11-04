<template>
  <view
    :class="['fast-shipping', { ['fast-shipping--notice']: waitNoticeNum > 0 }]"
    id="fast-shipping-exp"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_send_mail_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'send_mail',
        event_name: '移动端新版首页_下单核心业务区_菜单入口曝光',
        region_name: '下单核心业务区',
        access_name: waitNoticeNum > 0 ? '快速寄件,扫一扫,预约司机' : '快速寄件,扫一扫',
      },
    }"
  >
    <view class="fast-shipping__left">
      <view class="fast-shipping__item" @click="handClick">
        <ky-lazy-image
          :delay="500"
          :key="waitNoticeNum"
          class="fast-shipping__item_bg"
          :src="
            waitNoticeNum == 0
              ? 'https://ic-img.ky-express.com/netc/20250721_6138_!!1753063830048_760_336.gif'
              : 'https://ic-img.ky-express.com/netc/20250721_70563_!!1753063825797_760_504.gif'
          "
          :placeholder="waitNoticeNum == 0 ? a1Png : b1Png"
          @load="handleImg(0)"
        ></ky-lazy-image>
        <ky-lazy-image :src="doubleIntegralImg" v-if="doubleIntegralImg" class="fast-shoppping__tip"></ky-lazy-image>
        <view class="shipping__item__text" v-if="loadImg[0]">
          <view class="fast-shipping__item__title">快速寄件</view>
          <view class="fast-shipping__item__desc">1小时上门取件</view>
        </view>
      </view>
    </view>

    <view class="fast-shipping__right">
      <view class="fast-shipping__item" @click="handleScanQrcode">
        <ky-lazy-image
          :delay="500"
          class="fast-shipping__item_bg"
          :key="waitNoticeNum"
          :src="
            waitNoticeNum == 0
              ? 'https://ic-img.ky-express.com/netc/20250710_11065_!!1752139793254_310_168.png'
              : 'https://ic-img.ky-express.com/netc/20250710_75620_!!1752139793250_310_120.png'
          "
          :placeholder="waitNoticeNum == 0 ? a1Png : b2Png"
          @load="handleImg(1)"
        ></ky-lazy-image>
        <view class="shipping__item__text" v-if="loadImg[1]">
          <view class="fast-shipping__item__title">扫一扫</view>
          <view class="fast-shipping__item__desc">二维码下单查件</view>
        </view>
      </view>
      <view class="fast-shipping__item" v-if="waitNoticeNum" @click="handleNavigateWithParams">
        <ky-lazy-image
          :delay="500"
          class="fast-shipping__item_bg"
          src="https://ic-img.ky-express.com/netc/20250710_23950_!!1752139793251_310_120.png"
          :placeholder="c1Png"
          @load="handleImg(2)"
        ></ky-lazy-image>
        <view class="shipping__item__text" v-if="loadImg[2]">
          <view class="fast-shipping__item__dot">{{ waitNoticeNum > 99 ? '99+' : waitNoticeNum }}单待通知</view>
          <view class="fast-shipping__item__title">预约司机</view>
          <view class="fast-shipping__item__desc">待通知取货/已取消</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { scanQrcode } from '@public/utils/scan'
import kyeNavigate from '@public/utils/native/navigate'
import './v1.scss'
import { useHomeStore } from '../../store'
import { computed, ref } from 'vue'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { navigateWithParams } from '../../hooks'
import a1Png from './assets/a1.png'
import b1Png from './assets/b1.png'
import b2Png from './assets/b2.png'
import c1Png from './assets/c1.png'
import Taro from '@tarojs/taro'
import { getEnvConfig } from '@/public/constants'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { reportClickBtnName, reportFastShipEntry } from '../../report'
defineOptions({ name: 'fast-shipping-v1' })

useExposureReport(['fast-shipping-exp'])

const homeStore = useHomeStore()

const waitNoticeNum = computed(() => {
  return homeStore.data.waitNoticeNum || 0
})

const doubleIntegralImg = computed(() => {
  return homeStore.data.doubleIntegralImg
})

const loadImg = ref([false, false, false])

const handleImg = (index) => {
  loadImg.value[index] = true
}

const handClick = () => {
  reportFastShipEntry('快速寄件')
  reportClickBtnName('快速寄件')

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

const handleScanQrcode = () => {
  scanQrcode()
  reportClickBtnName('扫一扫')
  reportFastShipEntry('扫一扫')
}

const handleNavigateWithParams = () => {
  navigateWithParams(ApplicationCodeMap['首页-预约司机取货'])
  reportClickBtnName('预约取货')
  reportFastShipEntry('预约取货')
}
</script>
