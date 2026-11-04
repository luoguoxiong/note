<template>
  <Noticebar
    v-if="tipText"
    v-exposure-report="{
      eventCode: 'exp_express_service_overweight_v1',
    }"
    v-click-report="{
      eventCode: 'clk_express_service_content_v1',
    }"
    class="service-tip"
    leftIcon
    :scrollable="false"
  >
    <span>{{ tipText.message }}</span>
    <span class="button" @click="openIntro" v-if="tipText.type === '20'">《航空件标准》</span>
  </Noticebar>
</template>

<script lang="ts" setup>
import { openURL } from '@/modules/webview/utils'
import { getServiceFreightIframeUrl } from '@order-public-sub-public/utils/prescription-freight'
import { tipsInfosService } from '@order-public-sub-public/types'
import Noticebar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'

interface tipProps {
  tipText: tipsInfosService
}
defineProps<tipProps>()

/*打开航空件标准说明*/
const openIntro = () => {
  const url = getServiceFreightIframeUrl()
  console.log(url)
  openURL(url)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
