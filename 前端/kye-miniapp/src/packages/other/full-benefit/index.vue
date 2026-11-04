<template>
  <view class="market"></view>
</template>

<script setup lang="ts">
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { onMounted } from 'vue'

const { params } = useRouter() as any
let exist = true

// 页面显示时检查是否需要返回
useDidShow(() => {
  if (!exist) {
    Taro.navigateBack()
  }
})

onMounted(() => {
  exist = false
  Taro.showModal({
    title: '提示',
    content: '确认打开"跨越领鲜"小程序吗?',
    success: (res) => {
      if (res.confirm) {
        clickFn()
      } else if (res.cancel) {
        Taro.navigateBack()
      }
    },
  })
})

const clickFn = () => {
  if (params.appId) {
    // 跳转指定小程序
    Taro.navigateToMiniProgram({
      appId: params.appId,
      path: decodeURIComponent(params.path),
      envVersion: 'trial',
    })
  } else if (params.id) {
    // 跳转默认小程序
    const path = `packageC/pages/orderDetail/orderDetail?id=${params.id}&phone=${params.phone}`
    Taro.navigateToMiniProgram({
      appId: 'wxb1503f29025cc7aa',
      path,
      envVersion: 'trial',
      fail: () => {
        Taro.navigateBack()
      },
    })
  }
}
</script>
