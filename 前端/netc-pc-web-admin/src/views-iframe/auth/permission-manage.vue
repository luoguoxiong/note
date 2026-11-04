<!-- 账号权限（来源: netc-pc-web/src/views/micro-views/auth/permission-manage.vue） -->
<template>
  <div class="wh-full overflow_hidden">
    <IframeView menu-code="M3849" router-name="permission-manage"></IframeView>
    <!-- 精准通知 -->
    <MessagePopup ref="messagePopupRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import IframeView from '../iframe-view.vue'
import MessagePopup from '@/components/ky-message-popup/index.vue'
import EE from '@/utils/eventemitter'
import { ACTION_PAGE_LISTS } from '@/utils/iframeBridge/actionPageApi'

const messagePopupRef = ref<InstanceType<typeof MessagePopup> | null>(null)

// 消息
const loadNotice = (key: string) => {
  messagePopupRef.value?.loadNotice(key)
}

// 监听付款授权消息弹窗事件（对齐老项目 auth/permission-manage.vue EE.on）
const onPaymentPopupMessage = (val: { key?: string }) => {
  if (val?.key) {
    loadNotice(val.key)
  }
}

onMounted(() => {
  EE.on(ACTION_PAGE_LISTS['付款授权消息弹窗'], onPaymentPopupMessage)
})

onUnmounted(() => {
  EE.removeListener(ACTION_PAGE_LISTS['付款授权消息弹窗'], onPaymentPopupMessage)
})
</script>

<style lang="scss" scoped>
.wh-full {
  width: 100%;
  height: 100%;
}
.overflow_hidden {
  overflow: hidden;
}
</style>
