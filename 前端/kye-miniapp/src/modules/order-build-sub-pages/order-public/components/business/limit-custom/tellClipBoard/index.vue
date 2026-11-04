<template>
  <dialog-masker
    :showCancelButton="true"
    :showConfirmButton="true"
    :className="className"
    :closeable="closeable"
    :beforeClose="beforeClose"
    :renderClassName="true"
  >
    <template #title>
      <view class="l-p-title">{{ title }}</view>
    </template>
    <div class="title-container">
      <view class="flex ky-clipboard-dialog-item">
        <div class="ky-clipboard-dialog-label flex">姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：</div>
        <div class="ky-clipboard-dialog-value name" :class="{ empty: !person }">{{ person || '未识别到姓名' }}</div>
      </view>
      <view class="flex ky-clipboard-dialog-item">
        <div class="ky-clipboard-dialog-label flex">手机号码：</div>
        <div class="ky-clipboard-dialog-value tel" :class="{ empty: !mobile }">{{ mobile || '未识别到手机号码' }}</div>
      </view>
      <view class="flex ky-clipboard-dialog-item">
        <div class="ky-clipboard-dialog-label">固定电话：</div>
        <div class="ky-clipboard-dialog-value phone" :class="{ empty: !telephone }">
          {{ telephone || '未识别到固定电话' }}
        </div>
      </view>
      <view class="flex ky-clipboard-dialog-item">
        <div class="ky-clipboard-dialog-label">详细地址：</div>
        <div class="ky-clipboard-dialog-value address" :class="{ empty: !detailAddress }">
          {{ detailAddress || '未识别到详细地址' }}
        </div>
      </view>
    </div>
    <template #footer>
      <div class="button l-p-b flex space-between">
        <view class="l-p-b-cancel">
          <KyButton @click="onCancel" type="primary" plain size="large">设为寄件信息</KyButton>
        </view>
        <view class="l-p-b-submit">
          <KyButton @click="onConfirm" type="primary" size="large">设为收件信息</KyButton>
        </view>
      </div>
    </template>
  </dialog-masker>
</template>

<script lang="ts" setup>
import { Button as KyButton } from '@kye-netc/kye-miniui'
import dialogMasker from './../dialog-masker/index.vue'
import { tellClipBoardDialogProps } from '@order-public-sub-public/components/business/limit-custom/tellClipBoard/types'

defineProps<tellClipBoardDialogProps>()

const emit = defineEmits(['update:show', 'cancel', 'confirm'])

const onCancel = async () => {
  emit('cancel')
  emit('update:show', false)
}

const onConfirm = async () => {
  emit('confirm')
  emit('update:show', false)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
