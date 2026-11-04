<template>
  <CommonWebview :id="`CommonWebviewr-${webViewId}`" :src="src" @message="onMessage" v-if="src"></CommonWebview>
</template>
<script setup lang="ts">
import { useDidShow, useRouter } from '@tarojs/taro'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { urlContact } from '@/public/utils'
import CommonWebview from '@/public/components/business/webview/index.vue'
import { ref } from 'vue'
import native from '@/public/utils/native'
import { getEnvConfig } from '@/public/config'
import { getToken } from '@/public/storage'

const webViewId = ref(1)

const src = ref('')

const { params } = useRouter()

const { autoLoginHook } = useAutoLogin()

function deepDecodeURIComponent(str: string): string {
  let prev: string
  do {
    prev = str
    try {
      str = decodeURIComponent(str)
    } catch (e) {
      break
    }
  } while (str !== prev)
  return str
}

const onMessage = (e: any) => {
  const data = e.detail.data
  if (data.method) {
    native(data, `CommonWebview-${webViewId.value}`)
  }
}

useDidShow(async () => {
  let decoreUrl = decodeURIComponent(params.customParams as string)

  let customParam = decoreUrl ? JSON.parse(decoreUrl) : {}

  const { needLogin } = customParam
  let token = getToken()
  const { url } = params
  if (needLogin && !token) {
    await autoLoginHook({ needLogin: true })

    token = getToken()
    if (!token) {
      return
    }
  }

  const desrc = deepDecodeURIComponent(url as string)

  const webviewUrl = urlContact(desrc, {
    token: needLogin ? token : '',
    xForm: getEnvConfig().xForm,
    isMiniApp: 1,
  })

  src.value = webviewUrl
})
</script>
