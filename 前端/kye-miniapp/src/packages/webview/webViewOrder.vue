<template>
  <ky-redirct-webview :url="buildWebviewUrl()" needLogin />
</template>

<script setup lang="ts">
import { urlContact } from '@/public/utils'
import { useRouter } from '@tarojs/taro'

const router = useRouter()
const params = router.params || {}

function buildWebviewUrl() {
  const url = decodeURIComponent(params.url || '')

  const query = {
    sourcePage: params.sourcePage || '',
    sourceAction: params.sourceAction || '',
  }

  const webviewSrc = urlContact(url, query)
  return webviewSrc
}
</script>
