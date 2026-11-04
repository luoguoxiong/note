<template>
  <ky-dialog v-model:show="show" show-cancel-button :z-index="200">
    <view class="logout-success-dialog__body">
      <image
        class="logout-success-dialog__icon"
        src="https://ic-img.ky-express.com/netc/20260630_78974_!!1782800222994_120_120.svg+xml"
      />
      <view class="logout-success-dialog__title"> 已成功退登其他设备 </view>
      <view class="logout-success-dialog__desc"> 如需进一步保障账号安全，可点击【去修改】前往修改登录密码 </view>
    </view>
    <template v-slot:footer>
      <view class="logout-success-dialog__footer">
        <view class="btn cancel" @click="handleCancel">暂不修改</view>
        <view class="btn confirm" @click="handleConfirm">去修改</view>
      </view>
    </template>
  </ky-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'LogoutSuccessDialog' })

const emit = defineEmits(['confirm', 'cancel'])

const show = defineModel<boolean>('show', { default: false })

const open = () => {
  show.value = true
}

const close = () => {
  show.value = false
}

const handleConfirm = () => {
  show.value = false
  emit('confirm')
}

const handleCancel = () => {
  show.value = false
  emit('cancel')
}

defineExpose({
  open,
  close,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
