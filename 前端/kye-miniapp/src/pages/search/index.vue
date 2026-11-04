<template>
  <view></view>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { onMounted } from 'vue'

defineOptions({
  name: 'SearchPageRedirect',
})

onMounted(() => {
  Taro.switchTab({ url: '/layout/pages/waybill/index' })
})
</script>
