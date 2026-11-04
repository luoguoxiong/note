<template>
  <View></View>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'

const { params } = useRouter()

onMounted(() => {
  Taro.showLoading({ mask: true, title: '加载中...' })
  Taro.requestPayment({
    nonceStr: decodeURIComponent(params?.nonceStr || ''),
    package: decodeURIComponent(params.package || ''),
    paySign: decodeURIComponent(params.paySign || ''),
    signType: decodeURIComponent(params.signType || '') as any,
    timeStamp: decodeURIComponent(params.timeStamp || ''),
  })
    .then(() => {
      Taro.hideLoading()
      Taro.navigateBack()
    })
    .catch(() => {
      Taro.hideLoading()
      Taro.navigateBack()
    })
})
</script>
