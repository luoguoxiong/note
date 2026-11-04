<template>
  <CommonWebview
    v-if="onLoaded"
    :id="`CommonWebviewr-${webViewId}`"
    :query="queryParams"
    :src="src"
    @message="onMessage"
  ></CommonWebview>
</template>
<script lang="ts" setup>
import CommonWebview from '@public/components/business/webview/index.vue'
import { ref } from 'vue'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro'
import { isAliMiniApp, isWxMiniApp, urlContact } from '@public/utils'
import { useLogin } from '@public/hooks'
import { loginSuccess } from '@modules/user/pages/login/service'
import { onStorageSwitchUserChange, triggerSwitchUserChange } from '@public/storage'

const webViewId = ref('change-login')
const onLoaded = ref(false) // 是否已执行初始化
const src = ref('')
const queryParams = ref<any>({})

const { params } = useRouter()
const { autoLoginHook } = useAutoLogin()
const { token } = useLogin()

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

const onMessage = async (e: any) => {
  let postMessage = e.detail.data
  if (isWxMiniApp) {
    postMessage = e.detail.data[e.detail.data.length - 1]
  } else if (isAliMiniApp) {
    postMessage = e.detail.data
  }
  console.log('[log] changeLogin message', postMessage)
  // 切换登录手机号-刷新登录的用户信息
  if (postMessage && postMessage.loginInfo) {
    await loginSuccess(postMessage.loginInfo, { forceClear: true })
    /* 全局通知执行了切换用户 */
    triggerSwitchUserChange(postMessage.loginInfo)
  }
}

const setSrc = (value) => {
  const { needLogin } = queryParams.value
  const deviceId = Taro.getStorageSync('app_device_id') || ''
  const params = {
    deviceId,
    ...(needLogin ? { token: token.value } : {}),
  }
  src.value = urlContact(value, params)
}

useLoad((query) => {
  onLoaded.value = true
  queryParams.value = query
})

useDidShow(async () => {
  console.log('params', params)
  if (params.customParams) {
    const decoreUrl = decodeURIComponent(params.customParams as string)

    let customParam = JSON.parse(decoreUrl)

    const { needLogin } = customParam
    if (needLogin) {
      await autoLoginHook({ needLogin: true })
    }
  }
  const { url } = params
  console.log('url>>> 0000', url)
  const decodeSrc = deepDecodeURIComponent(url as string)
  setSrc(decodeSrc)
})
</script>
