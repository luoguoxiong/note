<template>
  <page-loading />
</template>

<script lang="ts" setup>
import Taro, { useDidShow } from '@tarojs/taro'
import PageLoading from './components/page-loading.vue'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useLogin } from '@/public/hooks'

defineOptions({ name: 'AccountCentral' })

const { autoLoginHook } = useAutoLogin()

const { isLogin } = useLogin()

useDidShow(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  if (isLogin.value) {
    Taro.switchTab({ url: '/layout/pages/mine/index' })
  } else {
    autoLoginHook({ needLogin: true })
      .then(() => Taro.switchTab({ url: '/layout/pages/mine/index' }))
      .catch(() => Taro.redirectTo({ url: '/modules/user/pages/login/index?delta=2' }))
  }
})
</script>
