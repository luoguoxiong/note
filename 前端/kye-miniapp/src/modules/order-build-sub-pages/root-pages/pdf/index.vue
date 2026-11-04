<template>
  <div>pdf</div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
@import './index.scss';
</style>

<!-- <template>
  <div class="container">
    <div id="pdf"></div>
  </div>
</template>

<script setup lang="ts">
import Pdfh5 from 'pdfh5'
import 'pdfh5/css/pdfh5.css'
import { onMounted } from 'vue'
import { useRoute } from '@order-public-sub-public/vue-router/index'
const route = useRoute()

onMounted(() => {
  initPdf()
})
const initPdf = () => {
  let url = route.query.url
  if (!url || typeof url !== 'string') {
    throw new Error('pdf的url不能为空')
  }
  url = decodeURI(url)
  const pdfh5 = new Pdfh5('#pdf', {
    pdfurl: url,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@2.0.943/cmaps/',
  })
  pdfh5.on('complete', (status: string, msg: string, time: string) => {
    console.log('状态:' + status + '，信息:' + msg + '，耗时:' + time + '毫秒')
  })
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import'./index.scss';
</style> -->
