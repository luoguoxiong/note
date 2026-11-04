<template>
  <KyWebView :src="webviewSrc" id="webview-barcode" v-if="webviewSrc"></KyWebView>
</template>
<script setup lang="tsx">
import { useDidShow, useRouter } from '@tarojs/taro'
import KyWebView from '@public/components/business/webview/index.vue'
import { urlContact } from '@/public/utils'
import { ref } from 'vue'
import { useLogin } from '@/public/hooks'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { refreshWebviewCheck } from '@/public/utils/webview'
import { getAppletQrcodeParameter } from '@/public/utils/scan/api'

const { params } = useRouter()

const { scene } = (params || {}) as any

const { autoLoginHook } = useAutoLogin()

const webviewSrc = ref()

const { token } = useLogin()

const updateWebview = (src) => {
  webviewSrc.value = src
}

const getWebview = async () => {
  const scenes = decodeURIComponent(scene as string).split(',')
  const { data } = await getAppletQrcodeParameter({
    appletId: scenes[0],
    appletMd5: scenes[1],
  })

  const urlParameter = (data.urlParameter || []).reduce((prev, cur) => {
    prev[cur.key] = cur.value
    return prev
  }, {})
  webviewSrc.value = urlContact(data.qrCodeUrl, { token: token.value, ...urlParameter })
}

const onRefresh = () => {
  updateWebview('')
  setTimeout(() => {
    getWebview()
  }, 300)
}

let isLoad = false

useDidShow(async () => {
  try {
    await autoLoginHook({ needLogin: true })
    if (!isLoad) {
      isLoad = true
      getWebview()
    } else {
      if (refreshWebviewCheck(webviewSrc.value)) {
        onRefresh()
        return
      }
    }
  } catch (error) {
    console.error(error)
  }
})
</script>
