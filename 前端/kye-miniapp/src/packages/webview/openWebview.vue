<template>
  <ky-redirct :url="init()" needLogin />
</template>

<script lang="tsx" setup>
import { encodeURLSafe, urlContact } from '@/public/utils'
import { useRouter } from '@tarojs/taro'

const { params } = useRouter()

const paramsToQueryString = (params: Record<string, any>) => {
  const qs = Object.keys(params)
    .map((key) => `${key}=${key === 'url' ? encodeURLSafe(params[key]) : params[key]}`)
    .join('&')

  return qs
}

const init = () => {
  return urlContact(`/modules/webview/pages/webview/index?${paramsToQueryString(params)}`)
}
</script>
