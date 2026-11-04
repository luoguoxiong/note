<!--
  Dialog 弹窗组件
  通用弹窗，支持标题和关闭按钮
-->
<template>
  <view v-if="show" class="dialog__wrapper" @tap="handleClose">
    <view class="dialog" :class="{ 'dialog-show': show }" @tap.stop="">
      <view class="dialog__header">
        <view class="dialog__title">{{ title }}</view>
        <view class="dialog__close" @tap="handleClose"></view>
      </view>

      <view class="dialog__body">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'Dialog' })

// Props
interface Props {
  show?: boolean
  title?: string
  onClose?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: '提示',
})

// 方法
const handleClose = () => {
  props.onClose && props.onClose()
}
</script>

<style lang="scss">
@import './index.scss';
</style>
