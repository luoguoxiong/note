<template>
  <view class="illustrate">
    <web-view :src="iframeUrl" v-if="iframeUrl" />
  </view>
</template>

<script setup lang="ts">
import { getQueryObject, $native } from '@order-public-sub-public/utils'
import { prescriptionFreightIframeUrl } from '@order-public-sub-public/utils/prescription-freight'
import { closeSkeleton } from '@order-public-sub-public/utils/skeleton'
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { openURL } from '@/modules/webview/utils'

const activeName = ref('weightSize')
const messageUpdate = (event: MessageEvent) => {
  const data = event.data
  const { type = '', url } = data || {}
  if (type === 'jump' && url) {
    openURL(url)
  }
}
onMounted(() => {
  window.addEventListener('message', messageUpdate)
  initActive()
  closeSkeleton()
})
const iframeUrl = computed(() => {
  return prescriptionFreightIframeUrl({
    tabName: activeName.value,
  })
})
const initActive = () => {
  const type = getQueryObject().type
  // console.log(type, '121212')
  if (type) {
    activeName.value = type
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('message', messageUpdate)
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
