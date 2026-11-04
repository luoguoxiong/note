<template>
  <view></view>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { onMounted } from 'vue'

defineOptions({
  name: 'HomePageRedirect',
})

onMounted(() => {
  Taro.switchTab({ url: '/layout/pages/home/index' })
})
</script>
