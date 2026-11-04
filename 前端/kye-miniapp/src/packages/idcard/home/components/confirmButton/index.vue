<template>
  <view
    :class="['confirmButton', paddingBottom ? 'padding-tp' : '', extranlClass]"
    :style="`position:${position};bottom:${bottom};`"
  >
    <template v-if="showChildren">
      <slot />
    </template>
    <view class="confirmContainer">
      <view v-if="cancelText" class="cancelButtonName" @click="onCancel">
        {{ cancelText }}
      </view>
      <view
        :class="[
          'confirmButtonName',
          disabled ? (specialColor ? 'disabled-special-color' : 'disabled-color') : 'pri-color',
        ]"
        @click="onBtnCb"
      >
        {{ name }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface ComfirmButtonProps {
  position?: string
  bottom?: string
  name?: string
  showChildren?: boolean
  cancelText?: string
  disabled?: boolean
  extranlClass?: string
  specialColor?: boolean
  paddingBottom?: boolean
}

withDefaults(defineProps<ComfirmButtonProps>(), {
  position: 'fixed',
  bottom: '0',
  name: '确定',
  showChildren: false,
  cancelText: '',
  extranlClass: '',
  disabled: false,
  specialColor: false,
  paddingBottom: false,
})

const emits = defineEmits(['btnCb', 'cancel'])

const onBtnCb = () => emits('btnCb')
const onCancel = () => emits('cancel')
</script>

<style lang="scss">
@import './index.scss';
</style>
