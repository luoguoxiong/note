<template>
  <div class="paste-and-recognize" v-if="!ocrMessage && !isAliPayClient && !isH5FSEnv" @click="onPasteAndRecognize">
    粘贴并识别
  </div>
</template>

<script lang="ts" setup>
import { isAliPayClient } from '../../../../../utils/device'
import { clk_express_single_sender_intelligence_button_v2 } from '../../../../../report/index'
// import umpOtherReport from '@order-public/reportUmp/sceneReport/umpotherReport'  // 上报暂注释
import { isH5FSEnv } from '@/public/utils'

const props = defineProps({
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
  try {
    const code: any = clk_express_single_sender_intelligence_button_v2(props.addressType)
    // umpOtherReport('CLK', code)  // 上报暂注释
  } catch (error) {
    console.log(error)
  }
  emit('onPasteAndRecognize')
}
</script>

<style lang="scss">
// @import '@order-public/styles/index.scss';  // 已移除，样式已内联到各组件 scss
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
  font-weight: normal;
}
</style>
