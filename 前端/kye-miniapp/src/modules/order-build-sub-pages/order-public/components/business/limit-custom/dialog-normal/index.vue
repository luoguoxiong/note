<template>
  <dialog-masker
    :title="title"
    :beforeClose="beforeClose"
    :confirm-button-text="confirmButtonText"
    :cancel-button-text="cancelButtonText"
    :showCancelButton="showCancelButton"
    :closeable="closeable"
  >
    <template #default>
      <view class="dialog-normal-message">
        <view>{{ message }}</view>
        <view class="dialog-normal-message-custom-operate" v-if="showCustomConcat">
          <view class="dialog-normal-message-contact" @click.stop="showCustomConcatCallBack">
            <i class="dialog-normal-phone-icon"></i>
            <span>立即联系</span>
          </view>
        </view>
      </view>
    </template>
  </dialog-masker>
</template>
<script setup lang="ts">
import dialogMasker from './../dialog-masker/index.vue'
import { NormalDialogProps } from '@order-public-sub-public/components/business/limit-custom/dialog-normal/types'

defineProps<NormalDialogProps>()
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
