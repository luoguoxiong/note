<template>
  <!--  顶部栏  -->
  <view v-if="showToolbar" class="ky-picker-header">
    <!--  slot 顶部栏区域   -->
    <slot name="toolbar">
      <slot name="cancel">
        <view v-if="cancelButtonText" class="ky-picker-header__cancel" @click="cancel">{{ cancelButtonText }}</view>
      </slot>
      <slot name="title">
        <view class="ky-picker-header__title">{{ title }}</view>
      </slot>
      <slot name="confirm">
        <view v-if="confirmButtonText" class="ky-picker__confirm" @click="confirm">{{ confirmButtonText }}</view>
      </slot>
      <slot name="close">
        <view class="close-icon" v-if="showClose" @click="handleClick"></view>
      </slot>
    </slot>
  </view>
</template>
<script setup lang="ts">
import { PickerHeaderProps } from '@packages/__components/picker/src/types'

const props = withDefaults(defineProps<PickerHeaderProps>(), {
  confirmButtonText: '确认',
  cancelButtonText: '取消',
  title: '标题',
  showToolbar: true,
  showClose: false,
})

console.log('props>header', props)
const emit = defineEmits(['cancel', 'confirm', 'close'])

const cancel = (e) => {
  emit('cancel', e)
}

const confirm = (e) => {
  emit('confirm', e)
}

const handleClick = (e) => {
  emit('close')
}
</script>
<style lang="scss">
.ky-picker-header {
  height: 96px;
  box-sizing: border-box;
  border-bottom: 1px solid #e6e8ed;
  .close-icon {
    width: 32px;
    height: 32px;
    background-image: url('https://ic-img.ky-express.com/netc/20250731_84451_!!1753952732865_64_64.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    vertical-align: middle;
    fill: currentcolor;
    cursor: pointer;
    display: inline-block;
    overflow: hidden;
  }
}
</style>
