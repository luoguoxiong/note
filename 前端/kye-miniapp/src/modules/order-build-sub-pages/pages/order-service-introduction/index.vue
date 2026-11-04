<template>
  <div class="order-service-introduction">
    <!-- <web-view :src="iframeUrl" frameborder="0" width="100%" height="100%"></web-view> -->
    <webviewH5 :src="iframeUrl" v-if="iframeUrl"></webviewH5>
  </div>
</template>

<script setup lang="ts">
import { prescriptionFreightIframeUrl } from '@order-public-sub-public/utils/prescription-freight'
import webviewH5 from '@/public/components/business/webview/index.vue'
import { computed } from 'vue'

const iframeUrl = computed(() => {
  return prescriptionFreightIframeUrl({
    tabName: 'additionalService',
  })
})
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
