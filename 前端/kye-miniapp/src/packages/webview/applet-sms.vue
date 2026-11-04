<template>
  <ky-redirct-webview v-if="src" :url="src" needLogin />
</template>
<script setup lang="tsx">
import { ref } from 'vue'
import { useRouter } from '@tarojs/taro'
import { urlContact } from '@/public/utils'
import Taro from '@tarojs/taro'
import { getRedirectUrl } from '@public/hooks/useRedirectH5ToNative'
const { params } = useRouter()
const src = ref('')
const { url } = (params || {}) as any
const decodeURI = (str: string) => {
  if (str?.startsWith(encodeURIComponent('http://')) || str?.startsWith(encodeURIComponent('https://'))) {
    return decodeURIComponent(str)
  } else {
    return str
  }
}

const init = async () => {
  const urlStr = decodeURI(url)

  // 跳转到实名认证原生拦截
  if (urlStr.includes('real-name-auth')) {
    const redectUrl = await getRedirectUrl(urlStr)
    if (redectUrl) {
      Taro.redirectTo({
        // 拼接参数和额外的查询参数
        url: `${redectUrl}&miniprogramType=sms`,
      })
      src.value = ''
      return ''
    }
  }

  src.value = urlContact(decodeURI(url), {
    miniprogramType: 'sms',
  })
}

init()
</script>
