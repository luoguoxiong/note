<template>
  <div
    class="paste-and-recognize"
    v-if="!ocrMessage && !isAliPayClient"
    @click="onPasteAndRecognize"
    v-click-report="clk_express_single_sender_intelligence_button_v2(addressType)"
  >
    粘贴并识别
  </div>
</template>

<script lang="ts" setup>
import { isWechat, isAliPayClient } from '@order-public-sub-public/utils/device'
import { clk_express_single_sender_intelligence_button_v2 } from '../../report/index'
defineProps({
  ocrMessage: {
    type: String,
    default: '',
  },
  addressType: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['onPasteAndRecognize'])

const onPasteAndRecognize = () => {
  emit('onPasteAndRecognize')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.paste-and-recognize {
  width: 168px;
  margin-left: 16px;
  height: 48px;
  line-height: 48px;
  text-align: center;
  font-size: 24px;
  color: #fff;
  background: #8365f6;
  border-radius: 12px;
  font-weight: $font-normal;
}
</style>
