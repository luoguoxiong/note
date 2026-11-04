<template>
  <KyWebView :src="webviewSrc" id="webview-modifyPrice" v-if="webviewSrc"></KyWebView>
</template>
<script setup lang="tsx">
import { useDidShow, useRouter } from '@tarojs/taro'
import KyWebView from '@public/components/business/webview/index.vue'
import { urlContact } from '@/public/utils'
import { useApplication } from '@/public/utils/application/useApplication'
import { addAppGrayHeader } from '@/modules/webview/pages/webview/utils'
import { ref } from 'vue'
import { useLogin } from '@/public/hooks'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { refreshWebviewCheck } from '@/public/utils/webview'

const { params } = useRouter()

const { getApplicationSingleAsync } = useApplication()

const { autoLoginHook } = useAutoLogin()

const webviewSrc = ref()

const { token } = useLogin()

const updateWebview = (src) => {
  webviewSrc.value = src
}

const getWebview = async () => {
  const grayLink = await getApplicationSingleAsync({ menuCode: 'M6303' })

  if (grayLink) {
    const src = addAppGrayHeader(grayLink)
    updateWebview(urlContact(src, { ...params, token: token.value }))
  }
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
