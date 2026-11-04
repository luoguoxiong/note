<template>
  <div class="goods-time-footer-custome">
    <div
      class="goods-current-time btn"
      v-if="config.goodsTimeFlag"
      @click="confirmNow"
      v-click-report="{
        eventCode: 'clk_express_goods_now_v1',
      }"
    >
      <div class="text">现在货好</div>
      <div class="goods-current-time__tip">预计1小时内上门取货</div>
    </div>
    <div class="confirm btn" @click="confirm">确定</div>
  </div>
</template>
<script setup lang="ts">
import { GoodsTimeConfig } from '@order-public-sub-public/types'
const emits = defineEmits(['confirmNow', 'confirm'])

const confirm = () => {
  emits('confirm')
}
interface PopupProps {
  config: GoodsTimeConfig
}
defineProps<PopupProps>()

const confirmNow = () => {
  emits('confirmNow')
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
