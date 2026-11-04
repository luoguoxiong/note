<template>
  <ky-overlay :show="true" style="z-index: 10000" @click="onHide">
    <view class="webview-overlay-modal">
      <view class="webview-overlay-modal-title">{{ title }}</view>
      <view class="webview-overlay-modal-content">{{ content }}</view>
      <view class="webview-overlay-modal-footer">
        <button class="webview-overlay-modal-ok" :openType="okButtonType" @click="onOk">{{ okText }}</button>
        <button class="webview-overlay-modal-cancel" :openType="cancelButtonType" @click="onCancel">
          {{ cancelText }}
        </button>
      </view>
    </view>
  </ky-overlay>
</template>

<script setup lang="ts">
import './modal.scss'

defineOptions({
  name: 'OverlayModal',
})
defineProps({
  visible: Boolean,

  title: String,
  content: String,

  okText: String,
  cancelText: String,

  okButtonType: String,
  cancelButtonType: String,
})

const emits = defineEmits<{
  (_e: 'update:visible', _v: boolean): void
  (_e: 'ok'): void
  (_e: 'cancel'): void
}>()

const onHide = () => {
  emits('update:visible', false)
}

const onCancel = () => {
  emits('cancel')
}

const onOk = () => {
  emits('ok')
}
</script>
