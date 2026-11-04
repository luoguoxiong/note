<template>
  <view v-if="!networkLoading">
    <NetworkError v-if="show || weaknetwork" @refresh="onReload" />
    <web-view v-if="src && !show && !weaknetwork" :src="src" @message="handleMessage" @error="onError" />
  </view>
</template>

<script setup>
import Taro from '@tarojs/taro'
import NetworkError from '@/public/components/base/network-error/index.vue'
import { ref, onMounted } from 'vue'
import { useRouter, useDidShow } from '@tarojs/taro'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useUserInfo } from '@/public/hooks'
import { getToken } from '@/public/storage'
import { useGeneralDataHook } from '@/public/storage/hooks/useGeneralDataHook'

// eslint-disable-next-line no-undef
const h5BaseUrl = process.env.TARO_APP_HTTP_URL

const router = useRouter()

const { userInfo } = useUserInfo()
const src = ref('')
const show = ref(false) // 是否显示网络错误
const networkLoading = ref(true) // 检查网络状况中

const { autoLoginHook } = useAutoLogin()
const initData = async () => {
  if (!userInfo.value.phone) {
    await autoLoginHook({ needLogin: true })
  }
  const queryString = `from=${router.params.from}&title=${queryString}&token=${getToken()}&${Taro.getApp().aplusHeader}`
  src.value = `${h5BaseUrl}/customer-code.html#/bind-v3?${queryString}`
}

const getNetworkType = (bool) => {
  networkLoading.value = true
  Taro.getNetworkType({
    complete: (res) => {
      if (res.errMsg === 'getNetworkType:ok' && res.networkType === 'none') {
        Taro.setNavigationBarTitle({ title: '跨越速运' })
        Taro.showToast({ icon: 'none', title: '当前无网络，请检查后重试', duration: 2000 })
        show.value = true
      } else {
        show.value = false
        if (bool) {
          initData()
        }
      }
      networkLoading.value = false
    },
  })
}

const onError = () => {
  Taro.setNavigationBarTitle({ title: '跨越速运' })
  Taro.showToast({ icon: 'none', title: '网络不给力，请稍后重试', duration: 2000 })
}

const onReload = () => {
  getNetworkType(true)
}

const { fetchGlobalData } = useGeneralDataHook()
const handleMessage = () => {
  fetchGlobalData()
}

useDidShow(() => {
  initData()
})

onMounted(() => {
  getNetworkType()
})
</script>
