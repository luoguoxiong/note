<template>
  <KyWebView
    v-if="onLoaded"
    :id="`webview-${webviewId}`"
    :src="webviewSrc"
    @message="onMessage"
    :query="queryParams"
    @refresh="onRefresh"
  />
</template>

<script setup lang="ts">
import Taro, { useDidShow, useLoad, useDidHide, useRouter } from '@tarojs/taro'
import KyWebView from '@public/components/business/webview/index.vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { getQueryObject, urlContact } from '@public/utils/url'
import { refreshWebviewCheck, webviewParamsDefault } from '@public/utils/webview'
import { useLogin } from '@/public/hooks'
import { useApplication } from '@public/utils/application/useApplication'
import { addAppGrayHeader } from '@/modules/webview/pages/webview/utils'
import { getEventChannel } from './helper'

defineOptions({ name: 'EventChannel' })

const router = useRouter()

const channel = computed(() => {
  return router.params.channelId ? getEventChannel(router.params.channelId) : null
})

const { token } = useLogin()

const isFirstEnter = ref(true)

const onMessage = (e) => {
  channel.value?.emit('message', e)
}

useLoad((options) => {
  onLoaded.value = true
  queryParams.value = options?.query || {}
  queryParams.value.url = options.url
  getWebviewSrc(true)
})

useDidShow(() => {
  checkLoginBack()
  if (isLoadWebview(webviewSrc.value)) {
    onRefresh()
    return
  }

  if (refreshWebviewCheck(webviewSrc.value)) {
    onRefresh()
    return
  }
})

useDidHide(() => {
  isFirstEnter.value = false
})

onBeforeUnmount(() => {
  channel.value?.emit('__destroy__')
})

const webviewSrc = ref('')
const queryParams = ref<any>({})
const webviewId = ref(0)
const onLoaded = ref(false) // 是否已执行初始化
const { getApplicationSingleAsync } = useApplication()

const getWebviewSrc = async (renderCheck: boolean = false) => {
  webviewId.value = webviewId.value + 1
  const { url, menuCode } = queryParams.value
  const needLogin = queryParams.value.needLogin || url?.includes('needLogin') || menuCode
  /* 需要登录，不存在token场景 不渲染 */
  if (renderCheck && needLogin && needLogin !== 'false' && !token.value) {
    return
  }

  let grayLink = addAppGrayHeader(decodeURIComponent(url))
  /* 不存在url, 存在指定轻应用menuCode */
  if (!url && menuCode) {
    grayLink = await getApplicationSingleAsync({ menuCode })
  }

  const defaultParams = {}
  if (!url?.includes('isMiniApp')) {
    defaultParams['isMiniApp'] = 1
  }

  if (needLogin && !url?.includes('xForm')) {
    defaultParams['xForm'] = webviewParamsDefault?.xForm
  }

  const params = {
    ...defaultParams,
    ...(needLogin ? { token: token.value } : {}),
  }

  webviewSrc.value = urlContact(grayLink, params)
}

const onRefresh = () => {
  webviewSrc.value = ''
  setTimeout(() => {
    getWebviewSrc(true)
  }, 300)
}

const isLoadWebview = (src) => {
  const url = getQueryObject(src)
  return !url.token && token
}

// 检测非首次进入场景
const checkLoginBack = () => {
  const { needLogin } = queryParams.value
  // 非首次进入该页面 & 需要登录且无token 且已经跳转过登录页
  if (!isFirstEnter.value && needLogin && needLogin !== 'false' && !token.value) {
    Taro.nextTick(() => {
      Taro.navigateBack()
    })
    Taro.navigateBack()
  }
}
</script>
