<template>
  <div></div>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from '@order-public-sub-public/vue-router/index'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
onMounted(() => {
  setTimeout(() => {
    const query = route.query
    router.replace('/order', query)
  }, 1000)
})
</script>
