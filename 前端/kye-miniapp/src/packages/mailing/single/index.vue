<template>
  <ky-redirct :url="src" needLogin />
</template>
<script setup lang="tsx">
import { useRouter } from '@tarojs/taro'
import { urlContact } from '@/public/utils'

const { params } = useRouter()

const src = urlContact('/modules/order-build/pages/order/index', {
  ...params,
})
</script>
