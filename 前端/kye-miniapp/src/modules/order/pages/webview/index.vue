<template>
  <view>
    <KyWebView
      :id="`order-webview-${webviewId}`"
      :src="webviewSrc"
      :query="queryParams"
      @message="onMessage"
      @refresh="onRefresh"
    />
  </view>
</template>

<script>
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import native from '@public/utils/native/index'
import { getToken } from '@public/storage/user'
import { urlContact } from '@public/utils/url'
import { handleLoginControl } from '@modules/user/pages/login/service/index'
import KyWebView from '@public/components/business/webview/index.vue'
import { useSetPreloadInnervalTask } from '@public/apis/order'

export default {
  components: { KyWebView },

  onLoad(query) {
    this.queryParams = query

    this.getWebviewSrc()

    // 隐藏页面分享按钮
    Taro.hideShareMenu()
  },
  setup() {
    const webviewSrc = ref('')
    const queryParams = ref({})
    const webviewId = ref(0)

    const onMessage = (e) => {
      if (e?.actionType === 'UPDATE_STORAGE_ORDER_CONFIG' && e?.data?.forceRefresh) {
        useSetPreloadInnervalTask()
      }
    }

    const getWebviewSrc = () => {
      webviewId.value = webviewId.value + 1
      const { needLogin, url } = queryParams.value
      webviewSrc.value = urlContact(url, needLogin ? { token: getToken() } : {})
    }

    const onRefresh = () => {
      webviewSrc.value = ''
      setTimeout(() => {
        getWebviewSrc()
      }, 300)
    }

    return { webviewSrc, onMessage, queryParams, webviewId, getWebviewSrc }
  },
}
</script>
