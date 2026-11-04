<template>
  <view class="crm-esig"></view>
</template>

<script setup>
import { onMounted } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'

// 我的页面
const MY_PAGE = '/pages/mypage/index'
// 腾讯电子签章首页
const TX_ESIG_HOME = 'pages/home/index'
// 腾讯电子签章 appId
const TX_APPID = {
  prd: 'wxa023b292fd19d41d', // 线上
  demo: 'wx371151823f6f3edf', // demo
}

const { params } = useRouter()
let exist = true

// 页面展示时触发
useDidShow(() => {
  if (!exist) {
    Taro.switchTab({ url: MY_PAGE })
  }
})

onMounted(() => {
  exist = false
  Taro.showModal({
    title: '提示',
    content: '确认打开“腾讯电子签”小程序吗？',
    success: (res) => {
      if (res.confirm) {
        clickFn()
      } else if (res.cancel) {
        Taro.navigateBack()
      }
    },
  })
})

/** 打开电子签小程序 */
function clickFn() {
  const url = decodeURIComponent(params.url || TX_ESIG_HOME)
  Taro.navigateToMiniProgram({
    appId: TX_APPID.prd, // 电子签 appId; 联调时可使用 demo appId
    path: url, // 跳转目标页路径
    envVersion: 'release', // 正式或 demo 小程序都传 release
    fail: () => {
      Taro.switchTab({ url: MY_PAGE })
    },
  })
}
</script>
