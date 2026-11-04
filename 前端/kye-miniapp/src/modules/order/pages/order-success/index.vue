<template>
  <view>
    <KyWebView :id="`waybill-route-${webViewId}`" :src="webviewSrc" @message="onMessage" />
  </view>
</template>

<script>
import { ref } from 'vue'
import KyWebView from '@public/components/business/webview/index.vue'
import Taro from '@tarojs/taro'
import native from '@/public/utils/native/index'
import { getApplicationFullUrlAsync } from '@/public/utils/applicationUtil'
import { getToken } from '@/public/storage/user'
import { urlContact, getQueryObject } from '@/public/utils/url'
import { refreshWebviewCheck } from '@/public/utils/webview'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'

export default {
  components: { KyWebView },

  onLoad(query) {
    // 隐藏页面分享按钮
    Taro.hideShareMenu()

    this.queryParams = query

    this.getWebviewSrc()

    // 因为此页面可能从外部直接打开，所以需要处理自动登录场景
    const { autoLoginHook } = useAutoLogin()
    autoLoginHook({ needLogin: true }).then((data) => {
      this.refreshWebview()
    })
  },

  onShow() {
    if (this.isLoadWebview(this.webviewSrc)) {
      this.refreshWebview()
      return
    }

    if (refreshWebviewCheck(this.webviewSrc)) {
      this.refreshWebview()
    }
  },
  setup() {
    const webviewSrc = ref('')
    const queryParams = ref({})
    const webViewId = ref(0)

    const getWebviewSrc = () => {
      webViewId.value = webViewId.value + 1
      const src = getApplicationFullUrlAsync('A5006', 'M5050')?.replace('#/order', '#/order-success')
      webviewSrc.value = urlContact(src, { token: getToken() })
      console.log(webviewSrc.value)
    }

    const setWebviewSrc = (src) => {
      webviewSrc.value = src
    }

    const onMessage = (e) => {
      const data = e.detail.data
      // 调用原生方法
      if (data.method) {
        native(data, `waybill-route-${webViewId.value}`)
      }
    }

    const isLoadWebview = (src) => {
      const currentToken = getToken()
      const { token } = getQueryObject(src)
      return !token && currentToken
    }

    const refreshWebview = () => {
      setWebviewSrc('')
      setTimeout(() => {
        getWebviewSrc()
      }, 300)
    }

    return {
      webviewSrc,
      onMessage,
      getWebviewSrc,
      setWebviewSrc,
      queryParams,
      refreshWebview,
      webViewId,
      isLoadWebview,
    }
  },
}
</script>
