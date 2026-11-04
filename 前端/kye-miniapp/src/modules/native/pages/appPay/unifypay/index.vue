<template>
  <view></view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useLoad, useDidShow, useUnload } from '@tarojs/taro'
import { handleAppUnifyPay } from '@public/utils/appPay/unifyPay'
const queryParams = ref<any>({}) // 支付参数
const hasOpened = ref(false) // 页面是否已加载过

/* 唤起app支付 */
const handleMiniAppUnifyPay = async (query) => {
  try {
    if (query?.$taroTimestamp) {
      delete query.$taroTimestamp
    }
    handleAppUnifyPay(query).then((result) => {
      console.log('handleMiniAppUnifyPay', result)
      Taro.navigateBack()
    })
  } catch (e) {
    console.log(e)
    // Taro.navigateBack()
  }
}

useDidShow(() => {
  console.log('>>>>>>> unifypay useDidShow')
  // 已加载页面执行返回跳转
  if (hasOpened.value) {
    Taro.navigateBack()
  }
})

useLoad((query) => {
  console.log('>>>>>>>>>>>>> unifypay useLoad query', query)
  queryParams.value = query
  handleMiniAppUnifyPay(query)
  // 记录打开状态
  setTimeout(() => {
    hasOpened.value = true
  }, 100)
})

useUnload(() => {
  hasOpened.value = false
})
</script>

<style scoped lang="scss"></style>
