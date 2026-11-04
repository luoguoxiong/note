<template>
  <view v-if="!networkLoading">
    <NetworkError v-if="show" @refresh="onReload" />
    <web-view v-if="src && !show" :src="src" @message="handleMessage" @error="onError" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import NetworkError from '@/public/components/base/network-error/index.vue'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useGeneralDataHook } from '@/public/storage/hooks/useGeneralDataHook'
import { getToken } from '@/public/storage'
import urlLists from '@/public/constants/h5-config'

defineOptions({ name: 'CustomerCodeIntro' })
// 响应式状态
const src = ref('')
const show = ref(false) // 是否显示网络错误
const networkLoading = ref(true) // 检查网络状况中

const { autoLoginHook } = useAutoLogin()
const { fetchGlobalData } = useGeneralDataHook()

// 初始化数据
const initData = async () => {
  if (!getToken()) {
    await autoLoginHook({ needLogin: true })
  }
  src.value = `${urlLists.customerCodeIntro.url}?token=${getToken()}&${Taro.getApp().aplusHeader}`
}

// 获取网络类型
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

// 错误处理
const onError = () => {
  Taro.setNavigationBarTitle({ title: '跨越速运' })
  Taro.showToast({ icon: 'none', title: '网络不给力，请稍后重试', duration: 2000 })
}

// 重新加载
const onReload = () => {
  getNetworkType(true)
}

// 处理消息
const handleMessage = () => {
  fetchGlobalData()
}

// 生命周期
onMounted(() => getNetworkType())

// 页面显示时触发
useDidShow(() => initData())
</script>
