<template>
  <ky-container class="batch-scan-wait-container">
    <view class="scan-container">
      <!-- 扫码区域 -->
      <camera
        class="scan-camera"
        mode="scanCode"
        device-position="back"
        :flash="flashStatus"
        @error="error"
        @scancode="onScanCode"
      />
      <view class="top"></view>
      <view v-if="showGuide" class="guide" @click="closeGuide">
        <image src="https://ic-img.ky-express.com/default/20250819_98014_!!1755572915998_1372_744.png"></image>
      </view>
      <!-- 自定义扫描框样式 -->
      <view class="scan-frame">
        <view class="scan-left"> </view>
        <view class="scan-center">
          <!-- 左上角 -->
          <view class="corner top-left"></view>
          <!-- 右上角 -->
          <view class="corner top-right"></view>
          <!-- 左下角 -->
          <view class="corner bottom-left"></view>
          <!-- 右下角 -->
          <view class="corner bottom-right"></view>
        </view>
        <view class="scan-right"> </view>
      </view>

      <!-- 右上角自定义按钮 -->
      <!-- 右上角自定义按钮 -->
      <view class="custom-top-right" @click="handleCustomAction">
        <text>已扫码({{ count }})</text>
        <image src="https://ic-img.ky-express.com/default/20250818_54461_!!1755516330570_64_64.png"></image>
      </view>

      <!-- 底部操作栏 -->
      <view class="scan-footer">
        <View class="tips">将条码，二维码放入框内，即可自动扫描</View>
        <view class="scan-footer-btn">
          <view @click="chooseImage" class="btn">
            <image src="https://ic-img.ky-express.com/default/20250818_79528_!!1755515163506_240_240.png"></image>
            <text>相册</text>
          </view>
          <view @click="switchFlash" class="btn">
            <image src="https://ic-img.ky-express.com/default/20250818_81031_!!1755515158394_240_240.png"></image>
            <text>{{ flashStatus === 'on' ? '关灯' : '开灯' }}</text>
          </view>
        </view>
      </view>
    </view>
  </ky-container>
</template>

<script setup lang="ts">
import './index.scss'
import { ref } from 'vue'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
// import { openURL } from '@modules/webview/utils'
// import { checkScanWaybillNumber } from '../../apis/waybill-route/index'
import { View } from '@tarojs/components'

const router = useRouter()
const flashStatus = ref('off')
const count = ref(router?.params?.count || 0)
// const noticeId = ref(router?.params?.noticeId || '')
const showGuide = ref(false)
const switchFlash = () => {
  flashStatus.value = flashStatus.value === 'off' ? 'on' : 'off'
}

let scaning = false // 识别中

const chooseImage = () => {
  Taro.showToast({
    title: '请期待',
    icon: 'none',
    duration: 2000,
  })
}
const onScanCode = async () => {
  try {
  } catch (error) {
    Taro.showToast({
      title: error.msg || error.message || '网络错误',
      icon: 'none',
      duration: 2000,
    })
    setTimeout(() => {
      Taro.hideLoading()
      scaning = false
    }, 2000)
  }
}
const error = (err) => {
  console.log('error', err)
}

const handleCustomAction = () => {}
const closeGuide = () => {
  Taro.setStorageSync('hide-batch-scan-guide', true)
  showGuide.value = false
}
// 页面触发刷新
useDidShow(() => {
  console.log(router)
  showGuide.value = !Taro.getStorageSync('hide-batch-scan-guide')
})
</script>
