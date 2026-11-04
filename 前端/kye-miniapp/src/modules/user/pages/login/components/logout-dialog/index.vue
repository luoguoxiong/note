<template>
  <ky-dialog
    v-model:show="show"
    title="温馨提示"
    show-cancel-button
    confirm-button-text="退出"
    :before-close="beforeClose"
    :z-index="200"
  >
    <div class="add-label-container">确认要退出登录吗?</div>
    <template v-slot:footer>
      <div class="label-footer-content">
        <div class="btn cancel" @click="close">取消</div>
        <div class="btn confirm" @click="confirm">退出</div>
      </div>
    </template>
  </ky-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)

const emit = defineEmits(['confirm', 'edit'])

const open = () => {
  show.value = true
}
const close = () => {
  show.value = false
}

const beforeClose = (action: string) => {
  if (action === 'confirm') {
    return true
  } else {
    return true
  }
}

// 格式化空格和表情
const confirm = () => {
  emit('confirm')
  return false
}
defineExpose({
  open,
  close,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
