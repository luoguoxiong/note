<template>
  <view v-if="netework.isConnected">
    <KyWebView
      v-if="webviewSrc"
      :id="`webview-${webviewId}`"
      :src="webviewSrc"
      @message="onMessage"
      @refresh="onRefresh"
    />
  </view>
  <NetworkError v-else></NetworkError>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDidShow, useLoad } from '@tarojs/taro'
import KyWebView from '@public/components/business/webview/index.vue'
import { refreshWebviewCheck } from '@public/utils/webview'
import { useLogin } from '@/public/hooks'
import { useNetworkStore } from '@/store/useNetworkStore'
import NetworkError from '@/public/components/base/network-error/index.vue'
import { urlContact } from '@/public/utils'

defineOptions({ name: 'CommonWebview' })

const emits = defineEmits(['message'])

const props = defineProps({
  src: String,
  needLogin: Boolean,
})

const webviewSrc = ref('')

const netework = useNetworkStore()

const { token } = useLogin()

const onMessage = (e) => {
  emits('message', e)
}

useLoad(() => {
  openWebviewUrl()
})

const openWebviewUrl = () => {
  const parmas = props.needLogin ? { token } : {}
  const url = props.src || ''
  webviewSrc.value = urlContact(url, parmas)
}

useDidShow(() => {
  if (refreshWebviewCheck(webviewSrc.value)) {
    onRefresh()
    return
  }
})

const webviewId = ref(0)

const onRefresh = () => {
  webviewSrc.value = ''
  setTimeout(() => {
    openWebviewUrl()
  }, 300)
}
</script>
