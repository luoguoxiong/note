<template></template>

<script setup lang="ts">
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import { handleAppWxPay } from '@public/utils/appPay'
const queryParams = ref<any>({}) // 支付参数

const wxPayCodeResult = {
  '-1': '订单支付失败', // 支付成功-是否刷新页面
  '-2': '用户取消支付',
}

const handleMiniWxAppPay = (query) => {
  if (query) {
    if (query?.$taroTimestamp) {
      delete query.$taroTimestamp
    }
    handleAppWxPay({
      ...query,
      success: (res) => {
        Taro.navigateBack()
      },
      fail: (err) => {
        setTimeout(() => {
          Taro.navigateBack()
        }, 1000)
      },
    })
  }
}

const showToast = (data: string | { message: string }) => {
  if (typeof data === 'string') return Taro.showToast({ title: data, icon: 'none' })

  return Taro.showToast({ title: data?.message, icon: 'none' })
}

useDidShow(() => {
  console.log('>>>>>alipay didShow')
})

useLoad((query) => {
  console.log('>>>>>>>>>>>>> wx.query query', query)
  queryParams.value = query
  handleMiniWxAppPay(query)
})
</script>

<style scoped lang="scss"></style>
