<template>
  <div id="content">
    <Iframe menu-code="M3091" router-name="delivery-area" @message="getMessage"></Iframe>
    <MessagePopup ref="messagePopupRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Iframe from '../components/iframe/index.vue'
import MessagePopup from '@/components/ky-message-popup/index.vue'

const messagePopupRef = ref<InstanceType<typeof MessagePopup> | null>(null)

const getMessage = ({ type, data }: { type: string; data: any }) => {
  switch (type) {
    case 'loadNotice':
      loadNotice(data)
      break
  }
}

// 消息
const loadNotice = (key: string) => {
  messagePopupRef.value?.loadNotice(key)
}
</script>

<style lang="scss" scoped>
#content {
  width: 100%;
  height: 100%;
}
</style>
