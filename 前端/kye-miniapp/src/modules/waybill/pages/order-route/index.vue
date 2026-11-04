<template>
  <view>
    <KyWebView :id="`order-route-${webViewId}`" :src="webviewSrc" @message="onMessage" />
  </view>
</template>

<script>
import { ref } from 'vue'
import KyWebView from '@public/components/business/webview/index.vue'
import Taro from '@tarojs/taro'
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
  setup(parmas) {
    const webviewSrc = ref('')
    const queryParams = ref({})
    const webViewId = ref(0)

    const getWebviewSrc = () => {
      webViewId.value = webViewId.value + 1
      const src = getApplicationFullUrlAsync('A5007', 'M5010')?.replace('#/waybill-search', '#/order-route')
      webviewSrc.value = urlContact(src, { ...queryParams.value, token: getToken() })
    }

    const setWebviewSrc = (src) => {
      webviewSrc.value = src
    }

    const onMessage = () => {}

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
