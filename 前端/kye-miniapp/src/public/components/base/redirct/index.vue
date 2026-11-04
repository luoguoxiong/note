<template>
  <view></view>
</template>
<script setup lang="tsx">
import Taro from '@tarojs/taro'

const props = defineProps<{ url: string }>()
const navigate = () => {
  const pages = Taro.getCurrentPages()
  if (pages.length > 1) {
    Taro.redirectTo({ url: props.url })
  } else {
    Taro.reLaunch({ url: props.url })
  }
}
navigate()
</script>
