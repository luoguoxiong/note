<template>
  <ky-redirct :url="init()" needLogin />
</template>

<script lang="tsx" setup>
import { useRouter } from '@tarojs/taro'

defineOptions({ name: 'ScanLogin' })

const { params } = useRouter()

const paramsToQueryString = (params: Record<string, any>) => {
  return Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')
}

const init = () => {
  return `/modules/user/pages/scanLogin/index?${paramsToQueryString(params)}`
}
</script>
