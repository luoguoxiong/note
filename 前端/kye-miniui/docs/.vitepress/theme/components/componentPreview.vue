<template>
  <demo-iframe :src="componentSrc"></demo-iframe>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: string }>()

// const componentSrc = computed(() => {
//   return `./index.html#/pages/h5-preview/index?name=${props?.name}`
// })

const componentSrc = computed(() => {
  if (process.env.NODE_ENV === 'development') {
    return `/index.html#/pages/h5-preview/index?name=${props?.name}`
  } else {
    // 直接访问 public 下的文件
    return `/h5/index.html#/pages/h5-preview/index?name=${props?.name}`
  }
})

</script>



<style scoped lang="scss">

</style>
