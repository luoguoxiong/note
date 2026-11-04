<template>
  <KyWebView v-if="src" :src="src" @message="onMessage" />
</template>

<script setup>
import Taro from '@tarojs/taro'
import { ref, onMounted } from 'vue'
import { getToken } from '@/public/storage'
import KyWebView from '@public/components/business/webview/index.vue'
import urlLists from '@/public/constants/h5-config'

defineOptions({ name: 'PaymentAuth' })

// 响应式状态
const src = ref('')
let shareText = {}

// 生命周期 - 页面显示时执行
onMounted(async () => {
  const webviewSrc = urlLists.paymentAuth.url + `home?token=${getToken()}`
  src.value = webviewSrc
})

// 分享功能
Taro.useShareAppMessage(() => {
  console.log(shareText, 'shareText')
  return {
    title: shareText.title,
    path: shareText.programPath,
    imageUrl: shareText.imgUrl,
  }
})

// 页面显示时的处理
Taro.useDidShow(async () => {
  const webviewSrc = urlLists.paymentAuth.url + `home?token=${getToken()}`
  src.value = webviewSrc
})

// WebView消息处理
const onMessage = (e) => {
  shareText = e.detail.data[e.detail.data.length - 1]
}
</script>
