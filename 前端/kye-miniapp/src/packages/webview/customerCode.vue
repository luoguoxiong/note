<template>
  <ky-redirct-webview :url="src" needLogin />
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from '@tarojs/taro'
const router = useRouter()
const params = router.params

const src = computed(() => {
  return decodeURIComponent(params.url)
})
</script>
