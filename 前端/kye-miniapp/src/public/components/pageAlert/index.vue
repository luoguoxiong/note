<template>
  <view class="page-alert">
    <view class="page-alert__bg" @tap="handleClose"></view>
    <view class="page-alert__wrapper">
      <view class="page-alert__header">
        <text class="page-alert__title">使用规则</text>
      </view>
      <view class="page-alert__content">
        <slot></slot>
      </view>
      <view class="page-alert__footer">
        <view class="page-alert__button" @tap="handleConfirm">知道了</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PageAlert',
})

const emit = defineEmits<{
  confirm: []
}>()

const handleClose = () => {
  emit('confirm')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style lang="scss">
.page-alert {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  &__wrapper {
    position: relative;
    width: 600px;
    max-height: 80vh;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  &__header {
    padding: 30px 30px 20px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  }

  &__title {
    font-size: 36px;
    font-weight: 600;
    color: #333;
  }

  &__content {
    padding: 30px;
    max-height: 50vh;
    overflow-y: auto;
  }

  &__footer {
    padding: 20px 30px 30px;
    border-top: 1px solid #f0f0f0;
  }

  &__button {
    width: 100%;
    height: 80px;
    background: #FFFFFF;
    color: #8365f6;
    border: none;
    border-radius: 8px;
    font-size: 32px;
    font-weight: 500;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
