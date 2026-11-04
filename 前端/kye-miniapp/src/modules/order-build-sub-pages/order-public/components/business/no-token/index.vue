<template>
  <div class="single_no_token" @click="login"></div>
</template>
<script setup lang="ts">
import Taro from '@tarojs/taro'
import { useLogin } from '@/public/hooks'
import { onBeforeMount } from 'vue'
const { isLogin } = useLogin()

const login = () => {
  Taro.navigateTo({
    url: '/modules/user/pages/login/index',
  })
}

onBeforeMount(() => {
  if (!isLogin.value) {
    login()
  }
})
</script>
<style lang="scss">
@import './index.scss';
</style>
