<template>
  <view />
</template>

<script setup lang="tsx">
import { urlContact } from '@/public/utils'
import Taro from '@tarojs/taro'

const props = defineProps<{
  url: string
  needLogin: boolean
}>()

const navigate = () => {
  const pages = Taro.getCurrentPages()
  const params: Record<string, string> = { url: props.url }

  if (props.needLogin) {
    params.needLogin = 'true'
  }

  const finalUrl = urlContact('/modules/webview/pages/webview/index', params)

  const navigator = pages.length > 1 ? Taro.redirectTo : Taro.reLaunch

  navigator({ url: finalUrl })
}

navigate()
</script>
