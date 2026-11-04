<template>
  <ky-popup
    v-model:show="appUpdatePopupShow"
    :closeOnClickOverlay="false"
    position="center"
    class="vp-content"
    :z-index="2000"
  >
    <view class="vp-body">
      <image
        class="vp-header"
        src="https://ic-img.ky-express.com/netc/20260205_14439_!!1770258476166_1200_452.png"
      ></image>
      <view class="vp-box">
        <view class="vp-title">版本更新提醒</view>
        <view class="vp-desc"
          >我们发布了一个重要的更新，修复了问题并带来了新功能。但检测到您的运行环境版本较低，无法兼容此更新。
          <text class="vp-desc-bold" v-if="!isApp"
            >您可点击【立即更新】退出小程序，并重新在微信中搜索打开【跨越寄件】</text
          >
          <text class="vp-desc-bold" v-else>您可退出APP，并清除APP进程后重新在手机桌面打开【跨越速运】</text>
          ，即可自动更新至最新版本。
        </view>
        <view class="vp-btn" @click="toUpdate">{{ isApp ? '我知道了' : '立即更新' }}</view>
      </view>
      <image
        class="vp-close"
        v-if="!appIsForceUpdate"
        @tap="closePopup"
        src="https://ic-img.ky-express.com/netc/20260205_21985_!!1770259227095_148_148.png"
      ></image>
    </view>
  </ky-popup>
</template>
<script lang="ts" setup>
import './index.scss'
import { getEnvConfig } from '@/public/config'
import { appUpdatePopupShow, appIsForceUpdate } from './menager'
import Taro from '@tarojs/taro'

const toUpdate = () => {
  const { isApp } = getEnvConfig()
  if (isApp) {
    closePopup()
  } else {
    Taro.getUpdateManager()?.applyUpdate()
  }
}

const closePopup = () => {
  appUpdatePopupShow.value = false
  Taro.showTabBar()
}

const { isApp } = getEnvConfig()
</script>
