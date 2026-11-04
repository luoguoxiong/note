<template>
  <div class="goods-time-footer-online">
    <div class="goods-current-time btn" v-if="config.goodsTimeFlag && selfSignFlag" @click="confirmNow">
      <template v-if="!isReturnSend">
        <div
          class="text"
          v-exposure-report="{
            eventCode: 'exp_express_goodsTime_current_v1',
          }"
          v-click-report="{
            eventCode: 'clk_express_goods_now_v1',
          }"
        >
          现在货好
        </div>
        <div class="goods-current-time__tip">预计1小时内上门取货</div>
      </template>
      <template v-else>
        <div class="back-text">签收立即返</div>
      </template>
    </div>
    <div class="confirm btn" @click="confirm">确定</div>
  </div>
</template>
<script setup lang="ts">
import { GoodsTimeConfig } from '@order-public-sub-public/types'

const emits = defineEmits(['confirm', 'confirmNow'])
const confirmNow = () => {
  emits('confirmNow')
}

const confirm = () => {
  emits('confirm')
}

interface PopupProps {
  config: GoodsTimeConfig
  selfSignFlag: boolean
  isReturnSend: boolean
}
defineProps<PopupProps>()
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
