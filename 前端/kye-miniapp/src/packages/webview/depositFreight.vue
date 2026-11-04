<!--
  预存 - WebView页面
  加载预存运费的H5页面
-->
<template>
  <view>
    <ky-webview v-if="src" :src="src" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { refreshWebviewCheck } from './utils/webviewUtils'
import KyWebview from '@public/components/business/webview/index.vue'
import WebviewAPI from './api/depositFreight'
import { useLogin, useUserInfo } from '@/public/hooks'

defineOptions({ name: 'DepositFreight' })

// 声明全局变量
declare const process: any
declare const getCurrentPages: any

const { autoLoginHook } = useAutoLogin()
const { token } = useLogin()

const src = ref('')

const BaseH5URL = process.env.TARO_APP_HTTP_URL || 'https://ic-h5.kye-erp.com'

// 获取路由参数
const getRouteParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.options || {}
}

// 初始化函数
const init = async () => {
  const params = getRouteParams()
  const scene = decodeURIComponent(params.scene || '').split(',')

  try {
    // 调用 prestoreCheckParam API
    await WebviewAPI.prestoreCheckParam({
      scene: scene[0] || '',
      type: scene[1] || '',
    })

    src.value = `${BaseH5URL}/deposit-freight.html#/?sign=${scene[0] || ''}&type=${scene[1] || ''}&token=${token.value}`
  } catch (err: any) {
    Taro.showToast({
      title: err.msg || '网络错误',
      icon: 'none',
    })
  }
}

const { userInfo } = useUserInfo()
const isLogin = computed(() => !!userInfo.value?.phone)

useDidShow(async () => {
  await autoLoginHook({ needLogin: true })

  if (!isLogin.value) {
    return
  }

  // 刷新webview
  await refreshWebviewCheck(src.value, (newSrc: string) => {
    src.value = newSrc
  })

  const params = getRouteParams()
  console.log(params.scene, 'params.scene')

  init()
})
</script>

<style lang="scss" scoped>
// 样式可以根据需要添加
</style>
