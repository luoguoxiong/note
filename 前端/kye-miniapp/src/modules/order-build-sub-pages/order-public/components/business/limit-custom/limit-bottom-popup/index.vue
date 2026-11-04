<template>
  <KyPopup
    :title="title"
    :show="true"
    class="limit-popup-content limit-popup-content-masker"
    :class="className"
    @close="cancel"
    @onClose="close"
  >
    <div v-html="content" class="limit-popup-content content-container"></div>
    <div class="limit-popup-padding"></div>
    <template #footer>
      <div class="button limit-popup-button flex space-between">
        <view class="limit-popup-button-cancel">
          <KyButton @click="cancel" type="primary" plain size="large">不同意</KyButton>
        </view>
        <view class="limit-popup-button-submit">
          <KyButton @click="submit" type="primary" size="large">同意</KyButton>
        </view>
      </div>
    </template>
  </KyPopup>
</template>

<script lang="ts" setup>
import { Button as KyButton } from '@kye-netc/kye-miniui'
import KyPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'

export interface popupProps {
  title?: string
  content?: string
  cancel: () => void
  submit: () => void
  close: () => void
  className: string
}
defineProps<popupProps>()
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
