<template>
  <view></view>
</template>

<script setup lang="ts">
import Taro, { useRouter } from '@tarojs/taro'
import { onMounted } from 'vue'

// 获取路由参数
const router = useRouter()
const { params } = router as any

// 页面显示时执行
onMounted(() => {
  Taro.showLoading({ mask: true, title: '加载中...' })
  Taro.requestPayment({
    nonceStr: decodeURIComponent(params.nonceStr),
    package: decodeURIComponent(params.package),
    paySign: decodeURIComponent(params.paySign),
    signType: decodeURIComponent(params.signType) as any,
    timeStamp: decodeURIComponent(params.timeStamp),
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

<script lang="ts">
export default {
  config: {
    navigationBarTitleText: '支付',
  },
}
</script>

<style scoped></style>
