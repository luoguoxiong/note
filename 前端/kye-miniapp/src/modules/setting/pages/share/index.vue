<template>
  <view class="setting-page">
    <view class="setting-page-share">
      <view class="setting-page-share-item" @click="shareTo(0)">
        <image
          class="setting-page-share-item-icon"
          src="https://ic-img.ky-express.com/netc/20251126_82569_!!1764144725220_96_96.png"
        ></image>
        <view class="setting-page-share-item-text">微信好友</view>
      </view>
      <view class="setting-page-share-item" @click="shareTo(1)">
        <image
          class="setting-page-share-item-icon"
          src="https://ic-img.ky-express.com/netc/20251126_46216_!!1764144725223_96_96.png"
        ></image>
        <view class="setting-page-share-item-text">朋友圈</view>
      </view>
    </view>
    <view class="setting-page-qr" v-if="!isIphone">
      <image
        class="setting-page-qr-image"
        src="https://ic-img.ky-express.com/netc/20251126_78038_!!1764144881193_544_544.png"
      ></image>
      <view class="setting-page-qr-text">扫描二维码下载跨越速运APP</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { getEnvConfig } from '@/public/constants'
import './index.scss'

const isIphone = computed(() => {
  return getEnvConfig().systemType.toLowerCase() === 'ios'
})

// 用于跟踪分享意图
const shareIntent = ref(false)
const getShareInfo = async (scene: number) => {
  const imgUrl = 'https://ic-img.ky-express.com/netc/20251126_68335_!!1764147858382_216_216.png'
  const imagePath = await Taro.downloadFile({ url: imgUrl })
  const params = {
    title: scene === 1 ? '货急找跨越，跨省最快8小时，寄件、查件、下载app便捷加倍！' : '跨越速运',
    description: '货急找跨越，跨省最快8小时，寄件、查件、下载app便捷加倍！',
    thumbPath: imagePath.tempFilePath,
    webpageUrl: 'https://a.app.qq.com/o/simple.jsp?pkgname=com.oxbix.spanlogistics',
    scene: scene, // 1:分享到朋友圈，0:分享给朋友
  }
  return params
}

const shareTo = async (scene: number) => {
  const res = await new Promise((success, fail) => {
    wx.miniapp.hasWechatInstall({ success, fail })
  }).catch(() => ({ hasWechatInstall: false }))
  if (res?.hasWechatInstall) {
    const shareParams = await getShareInfo(scene)
    try {
      // 记录分享意图
      wx.miniapp.shareWebPageMessage(shareParams)
      shareIntent.value = true
    } catch (e) {
      // 分享调用失败，清除分享意图
      shareIntent.value = false
      Taro.showToast({
        title: '分享失败，请重试',
        icon: 'none',
      })
    }
  } else {
    Taro.showToast({
      title: '请先安装微信',
      icon: 'none',
    })
  }
}

// 页面显示时检查分享意图
useDidShow(() => {
  if (shareIntent.value) {
    // 显示分享成功提示
    Taro.showToast({
      title: '分享成功',
      icon: 'none',
    })
    // 重置分享意图
    shareIntent.value = false
  }
})
</script>
