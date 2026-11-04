<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <KyWebView :id="`waybill-order-${webViewId}`" :src="webviewSrc" @message="onMessage" />
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import KyWebView from '@public/components/business/webview/index.vue'
import { hideShareMenu, useLoad, useDidShow } from '@tarojs/taro'
import native from '@/public/utils/native/index'
import { getApplicationFullUrlAsync } from '@/public/utils/applicationUtil'
import { getToken } from '@/public/storage/user'
import { urlContact, getQueryObject } from '@/public/utils/url'
import { refreshWebviewCheck } from '@/public/utils/webview'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { useSetPreloadInnervalTask } from '@public/apis/order'
const webviewSrc = ref('')
const queryParams = ref({})
const webViewId = ref(0)

/**
 * 获取下单对应轻应用地址
 */
const getWebviewSrc = () => {
  // webViewId.value = webViewId.value + 1
  // const src = 'http://10.32.49.234:8081/#/order?token=53E9D09D-499E-408E-BAFD-8288A759DD22_77114'
  // webviewSrc.value = src
  webViewId.value = webViewId.value + 1
  const src = getApplicationFullUrlAsync('A5006', 'M5050')

  webviewSrc.value = urlContact(src, { token: getToken() })
}

/**
 * 判断是否需要加载webview
 * @param src
 */
const isLoadWebview = (src) => {
  const currentToken = getToken()
  const { token } = getQueryObject(src) as { token: string }
  return !token && currentToken
}

/**
 * 设置webview加载地址
 * @param src
 */
const setWebviewSrc = (src) => {
  webviewSrc.value = src
}

/**
 * 刷新webview
 */
const refreshWebview = () => {
  setWebviewSrc('')
  setTimeout(() => {
    getWebviewSrc()
  }, 300)
}

const onMessage = (e: any) => {
  const data = e.detail.data
  // 调用原生方法
  if (data.method) {
    native(data, `order-${webViewId.value}`)
  }
}

useLoad((query) => {
  hideShareMenu()
  queryParams.value = query
  getWebviewSrc()
  // 因为此页面可能从外部直接打开，所以需要处理自动登录场景
  const { autoLoginHook } = useAutoLogin()
  autoLoginHook({ needLogin: true }).then(() => {
    refreshWebview()
  })
})

// 使用 useDidShow 钩子替代 onShow 生命周期方法
useDidShow(() => {
  if (isLoadWebview(webviewSrc.value)) {
    refreshWebview()
    return
  }

  if (refreshWebviewCheck(webviewSrc.value)) {
    refreshWebview()
  }
})

const onUnload = () => {
  useSetPreloadInnervalTask()
}

onUnmounted(() => {
  // 页面卸载时的操作
  onUnload()
})
</script>
