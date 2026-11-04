<template>
  <view></view>
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { onMounted } from 'vue'

defineOptions({
  name: 'MyPageRedirect',
})

onMounted(() => {
  Taro.switchTab({ url: '/layout/pages/mine/index' })
})
</script>
