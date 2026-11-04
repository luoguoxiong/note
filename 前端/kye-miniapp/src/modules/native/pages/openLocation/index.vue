<template>
  <view></view>
</template>
<script setup lang="ts">
import Taro, { useRouter } from '@tarojs/taro'

let { params } = useRouter() as any

params = params || {}

for (const key in params) {
  if (Object.prototype.hasOwnProperty.call(params, key)) {
    const element = params[key]
    params[key] = decodeURIComponent(element as string)
  }
}

params.latitude = Number(params.latitude)

params.longitude = Number(params.longitude)

Taro.navigateBack({
  success: () => {
    Taro.openLocation(params as unknown as Taro.openLocation.Option)
  },
})
</script>
