<template>
  <ky-redirct-webview :url="src" needLogin />
</template>
<script setup lang="tsx">
import { useRouter } from '@tarojs/taro'
import { urlContact } from '@/public/utils'
import { useUserInfo } from '@/public/hooks'

const { params } = useRouter()

const { userInfo } = useUserInfo()

const base_url = process.env.TARO_APP_HTTP_URL

const applyAuth = `${base_url}/auth-management.html#/`

let src

if (params?.applets) {
  src = urlContact(applyAuth, {
    applets: 'true',
    customerCode: userInfo.value?.customerCode,
  })
} else {
  src = applyAuth
}
</script>
