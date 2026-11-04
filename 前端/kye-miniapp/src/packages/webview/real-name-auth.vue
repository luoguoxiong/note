<template>
  <ky-redirct-webview :url="src" needLogin />
</template>

<script setup>
import { computed } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'
import urlLists from '@/public/constants/h5-config'
const router = useRouter()
const params = router.params

const src = computed(() => {
  if (params.iconfrom) {
    const url = params.url ? decodeURIComponent(params.url) : ''
    if (!url) {
      const queryString = `shellVersion=${params.shellVersion}&channelCode=wechatApplet&menuCode=${params.menuCode}&openid=${Taro.getStorageInfoSync('openId')}`
      return `${urlLists.transferPage.url}?${queryString}`
    }
    return url
  } else {
    return urlLists.realNameAuth.url
  }
})
</script>
