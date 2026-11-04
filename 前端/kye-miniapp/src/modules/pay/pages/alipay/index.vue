<template>
  <View></View>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Taro, { useRouter } from '@tarojs/taro'

const { params } = useRouter()

onMounted(() => {
  const { tradeNO } = params
  if (!tradeNO) {
    Taro.showToast({
      title: '缺少参数tradeNO！',
      icon: 'none',
      duration: 2000,
    })
    return
  }
  Taro.tradePay({
    tradeNO: tradeNO,
    success: () => {
      Taro.navigateBack()
    },
    fail: () => {
      Taro.navigateBack()
    },
  })
})
</script>
