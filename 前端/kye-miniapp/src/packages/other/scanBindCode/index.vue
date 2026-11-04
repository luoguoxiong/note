<template>
  <ky-redirct-webview :url="src" needLogin />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '@tarojs/taro'
import urlLists from '@/public/constants/h5-config'

defineOptions({ name: 'OtherScanBindCode' })

const router = useRouter()
const params = router.params
console.log('router.params', params)

const src = computed(() => {
  console.log('params', params)
  // debugger
  if (params.q) {
    return decodeURIComponent(params.q)
  } else if (params.scene) {
    const scene = decodeURIComponent(params.scene).split(',')

    const id = scene[0]
    const md5 = scene[1]
    const url = urlLists.scanBindCode.url

    return `${url}?appletId=${id}&appletMd5=${md5}`
  }
  return ''
})
</script>
