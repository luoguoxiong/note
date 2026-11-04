<template>
  <view v-if="netework.isConnected">
    <web-view
      :id="id"
      :src="buildUrl(src)"
      @message="onMessage"
      @load="onLoad"
      @error="onError"
      v-if="src && !isH5Env"
    />
    <webviewH5 :src="buildUrl(src)" v-if="src && isH5Env" @message="onMessage"></webviewH5>
  </view>
  <NetworkError v-else @refresh="onRefresh"></NetworkError>
</template>

<script setup lang="ts">
import { getQueryObject, isH5Env, urlContact } from '@/public/utils'
import webviewH5 from './h5.vue'
import { handleAliApiOnWebviewMsg } from './index.alipay'
import { handleAliApiOnWebviewNewMsg } from './alipay-native'
import { WebviewMessage } from './index.type'
import NetworkError from '@/public/components/base/network-error/index.vue'
import { useNetworkStore } from '@/store/useNetworkStore'
import { onMounted } from 'vue'
import { useRouter } from '@tarojs/taro'
import { getXenvId } from '@public/appxenv'

const netework = useNetworkStore()

const router = useRouter()

const routerParmas = (router.params || {}) as any

const emit = defineEmits(['message', 'load', 'error', 'refresh'])

const props = defineProps<{ id?: string; src: string }>()

const handleMsg = async (e: any) => {
  const msg = e.detail as WebviewMessage
  if (msg.plateform === 'alipay') {
    const data = msg.taskKey ? await handleAliApiOnWebviewNewMsg(e.detail) : await handleAliApiOnWebviewMsg(e.detail)
    const webviewContext = getAliWebviewContext()
    if (!webviewContext) {
      console.error('webviewContext empty...')
      return
    }
    webviewContext.postMessage({
      ...msg,
      data: data,
    })
  }
}

onMounted(() => {
  document.title = routerParmas.title ? decodeURIComponent(routerParmas.title) : '跨越寄件'
  netework.getNeteWorkStatus()
})

const onRefresh = () => {
  netework.getNeteWorkStatus()
}

const onMessage = (e) => {
  emit('message', e)
  handleMsg(e)
}

const onLoad = (e) => {
  emit('load', e)
}

const onError = (e) => {
  emit('error', e)
}

const getAliWebviewContext = () => {
  return my.createWebViewContext(props.id)
}

const buildUrl = (src: string) => {
  if (!src) return src

  try {
    const { needRefreshTime } = getQueryObject(src)

    const query = needRefreshTime
      ? {
          _kyt: Date.now().toString(),
        }
      : {}

    const finalUrl = urlContact(src, {
      isMiniApp: 1,
      xEnvid: getXenvId(),
      ...query,
    })

    return finalUrl
  } catch (e) {
    return urlContact(src, {
      isMiniApp: 1,
      xEnvid: getXenvId(),
    })
  }
}

defineExpose({ getAliWebviewContext })
</script>
