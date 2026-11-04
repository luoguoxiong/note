<template>
  <ky-redirct :url="init()" needLogin />
</template>

<script lang="tsx" setup>
import { urlContact } from '@/public/utils'
import { useRouter } from '@tarojs/taro'

const { params } = useRouter()

const paramsToQueryString = (params: Record<string, any>) => {
  return Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')
}

const init = () => {
  return urlContact(`/modules/scan/pages/webview/index?${paramsToQueryString(params)}`)
}
</script>
