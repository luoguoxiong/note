<template>
  <web-view v-if="templateUrl" :src="templateUrl" @message="onMessage"></web-view>
</template>

<script setup lang="ts">
import { convertPostMessage } from '@order-public-sub-public/utils/common'
import { resetTemplateUpdataInit, setLocalTemplateData, templateUrl } from '../template-list/hooks/update'
// import { ref } from 'vue'
// const url = ref(
//   'http://10.32.82.76:8082/#/order?sourcePage=order-config&sourceAction=template-list&token=D3CABF88-E3D0-41EE-A5E7-CC20B4A70DD4_87710&xForm=114&isMiniApp=1',
// )

const updateTemplate = (data) => {
  if (data && data.type === 'UPDATE_ORDER_TEMPLATE_ID') {
    const { message } = data
    setLocalTemplateData(message)
    resetTemplateUpdataInit()
  }
}

const onMessage = (event: MessageEvent) => {
  console.log('object-event-message-id', event)
  convertPostMessage(event, (data) => {
    updateTemplate(data)
  })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.iframe-template {
  // position: fixed;
  display: flex;
  flex-direction: column;
  // top: 0;
  // left: 0;
  width: 100%;
  height: 100vh;
}
</style>
