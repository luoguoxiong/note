<template>
  <MatchModal
    v-if="isMismatch && !forceAgree && Boolean(token)"
    title="温馨提示"
    ok-text="返回APP"
    cancel-text="留在当前页面"
    :content="misMatchMessage"
    ok-button-type="launchApp"
    @ok="handleMisMatchOk"
    @cancel="handleMisMatchCancel"
  />
  <KyWebView v-else-if="onLoaded" :id="`webview-${webviewId}`" :src="webviewSrc" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDidShow } from '@tarojs/taro'
import KyWebView from '@public/components/business/webview/index.vue'
import MatchModal from './components/modal/modal.vue'
import { urlContact } from '@public/utils/url'
import { refreshWebviewCheck, webviewParamsDefault } from '@public/utils/webview'
import { useLogin } from '@/public/hooks'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useMatch } from './hooks/useMatchPhone'
import { getToken } from '@/public/storage'

declare const process: any
const BaseH5URL = process.env.TARO_APP_HTTP_URL || 'https://ic-h5.kye-erp.com'

defineOptions({ name: 'CommonWebview' })

const { token } = useLogin()

const { autoLoginHook } = useAutoLogin()

useDidShow(async () => {
  try {
    await autoLoginHook({ needLogin: true })

    if (!onLoaded.value) {
      onLoaded.value = true
      getWebviewSrc()
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

const webviewSrc = ref('')
const webviewId = ref(0)
const onLoaded = ref(false) // 是否已执行初始化

// 使用手机号匹配 hook
const { forceAgree, isMismatch, misMatchMessage, handleMisMatchOk, handleMisMatchCancel } = useMatch()

const getWebviewSrc = async () => {
  webviewId.value = webviewId.value + 1
  /* 需要登录，不存在token场景 不渲染 */
  if (!token.value) {
    return
  }

  webviewSrc.value = urlContact(`${BaseH5URL}/bonus.html#/withdraw-wx?token=${getToken()}`, {
    xForm: webviewParamsDefault?.xForm,
  })
}

const onRefresh = async () => {
  webviewSrc.value = ''
  setTimeout(() => {
    getWebviewSrc()
  }, 300)
}
</script>
