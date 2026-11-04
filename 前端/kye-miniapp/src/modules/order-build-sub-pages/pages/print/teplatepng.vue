<template>
  <div class="teplatepngpage">
    <img :src="url" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from '@order-public-sub-public/vue-router/index'
const route = useRoute()
const url = ref('')
onMounted(() => {
  url.value =
    (route.query.pngurl as string) ||
    'https://ic-img.ky-express.com/netc/20240419_68948541690_!!1713512637166_1578_11048.png'
})
</script>
<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

.teplatepngpage {
  width: 100vw;
  height: 100vh !important;
  background-color: #ffffff;
  overflow: auto;
  overflow-x: hidden;
  img {
    width: 105vw;
    height: auto;
    object-fit: cover;
  }
}
</style>
