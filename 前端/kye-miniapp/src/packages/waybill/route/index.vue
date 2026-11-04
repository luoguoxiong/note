<template>
  <view></view>
</template>
<script setup lang="tsx">
import { useRouter, navigateTo } from '@tarojs/taro'
import { urlContact } from '@/public/utils'

const { params } = useRouter()
// /packages/waybill/route/index	 -> waybillNumber=KY5000207272397&orderNumber=
const src = urlContact('/modules/waybill-build/pages/waybill-route/index', {
  waybillNumber: params.waybillNumber || params.waybillNo,
  fromExternal: 0,
  ...params,
})
console.log('useRouter', params, src)

navigateTo({
  url: src,
})
</script>
