<template>
  <web-view :src="src" @message="handleMessage" @error="handleError" />
</template>

<script lang="ts" setup>
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import Taro from '@tarojs/taro'
import { ref } from 'vue'

defineProps<{ src: string }>()
const { handleGlobalAutoLoginCall } = useAutoLogin()

const weakNetwork = ref(false)

const handleError = () => {
  Taro.setNavigationBarTitle({ title: '跨越速运' })
  Taro.showToast({
    icon: 'none',
    title: '网络不给力，请稍后重试',
    duration: 2000,
  })
  weakNetwork.value = true
}

const handleMessage = (e) => {
  let postMessge = e.detail.data[e.detail.data.length - 1]
  if (postMessge && postMessge.type === 'operationQrCodeCallback') {
    // 切换绑定，后台会使token失效，避免重复出现登录界面-用户信息失效，重新自动登录切换登录身份
    handleGlobalAutoLoginCall()
  }
}
</script>
