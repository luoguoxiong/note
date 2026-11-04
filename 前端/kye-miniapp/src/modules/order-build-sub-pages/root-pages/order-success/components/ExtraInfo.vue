<template>
  <!-- 拓展信息 -->
  <div class="goods-container w-full">
    <div class="flex extra-info-item">
      <div class="goods-title">付款方式：</div>
      <div class="goods pay-type">{{ waybill.payModeAccount || '--' }}</div>
    </div>
    <div class="flex extra-info-item">
      <div class="goods-title">服务方式：</div>
      <div class="goods">{{ waybill.serviceModeText || '--' }}</div>
    </div>
    <div class="flex extra-info-item">
      <div class="goods-title">托寄物：</div>
      <div class="flex goods">
        <div class="goods-type">{{ waybill.goodsType || '--' }}</div>
        <span v-if="waybill.count || waybill.actualWeight">/</span>
        <span v-if="waybill.actualWeight">{{ waybill.actualWeight }}kg/</span>
        <span v-if="waybill.count">{{ waybill.count }}件</span>
      </div>
    </div>
    <div class="flex extra-info-item" v-if="waybill.receiptFlagText">
      <div class="extra-info-title goods-title">回单服务：</div>
      <div class="receipt">
        <span>{{ waybill.receiptFlagText || '--' }}</span>
        <span v-if="waybill.receiptCount">/{{ waybill.receiptCount }}张</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SuccessWaybill } from '@order-public-sub-public/types'

defineProps<{ waybill: SuccessWaybill; type?: 'delivery' | 'pickup' }>()
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
