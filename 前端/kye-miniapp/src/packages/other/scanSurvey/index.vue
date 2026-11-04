<template>
  <ky-redirct-webview :url="src" needLogin />
</template>
<script setup lang="tsx">
import { useRouter } from '@tarojs/taro'

const { params } = useRouter()

const base_url = process.env.TARO_APP_HTTP_URL

const src = `${base_url}/h5/survey/?p=${params?.scene}&sourceKey=50&pageKey=510`
</script>
