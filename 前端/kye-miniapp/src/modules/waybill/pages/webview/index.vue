<template>
  <view>
    <KyWebView
      :id="`waybill-webview-${webviewId}`"
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
import useRefreshSearch from '@/modules/waybill/hooks/useRefreshSearch'

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

    const { setIsRefresh } = useRefreshSearch() // 触发页面刷新
    const onMessage = (e) => {
      const data = e.detail.data
      // 调用原生方法
      if (data.method) {
        native(data, 'waybill-webview')
      }

      if (data.refresh) {
        setIsRefresh(true)
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
