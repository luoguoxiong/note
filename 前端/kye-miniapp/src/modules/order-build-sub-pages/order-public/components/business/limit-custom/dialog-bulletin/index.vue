<template>
  <dialog-masker :show="show" :confirm-button-text="confirmButtonText">
    <template #title>
      <view class="ky-dialog-header dialog-bulletin-title" v-if="title">
        <view class="ky-dialog-title">{{ title }}</view>
      </view>
    </template>
    <template #default>
      <view class="dialog-bulletin-content">
        <view v-html="message"></view>
      </view>
    </template>
  </dialog-masker>
</template>
<script setup lang="ts">
import dialogMasker from './../dialog-masker/index.vue'
import { DialogMaskerProps } from '@order-public-sub-public/components/business/limit-custom/dialog-masker/types'
withDefaults(defineProps<DialogMaskerProps>(), {
  title: '',
  message: '',
  show: true,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
