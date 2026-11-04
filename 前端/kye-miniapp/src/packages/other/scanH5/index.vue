<template>
  <view></view>
</template>
<script setup lang="tsx">
import { useDidShow, useRouter } from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { handleH5Result } from '@/public/utils/scan'

const { autoLoginHook } = useAutoLogin()

const { params } = useRouter()

useDidShow(async () => {
  await autoLoginHook({ needLogin: true })
  let { q, scene } = params
  let url = (q || scene) as string
  await handleH5Result(decodeURIComponent(url))
})
</script>
