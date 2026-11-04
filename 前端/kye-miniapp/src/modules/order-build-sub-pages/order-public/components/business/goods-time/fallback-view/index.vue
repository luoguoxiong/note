<template>
  <div class="goods-time goods-time-fallback">
    <div class="cell-content" v-if="timeModeVisible">
      <KyCell
        :required="required"
        :no-bg-disabled="disabled"
        class="background-transparent"
        :title="config.alias || '货好时间'"
        label=""
        placeholder="请选择"
      >
        <template #title>
          <div class="goods-time-title">
            <span class="title-text">{{ config.alias || '货好时间' }}</span>
          </div>
        </template>
        <template #value v-if="goodsTime || isNowGoodsTime">
          <div class="value-content">
            <!-- 非现在货好显示时间 -->
            <span v-if="!isNowGoodsTime">
              <span class="time" v-if="goodsTime">{{ filterTime(goodsTime) }}</span>
              <span class="no-data" v-else>请选择</span>
            </span>

            <!-- 现在货好显示文案 -->
            <span v-if="isNowGoodsTime" class="now-goods-time">
              现在货好
              <span class="now-tips">(预计1小时内上门取货)</span>
            </span>
          </div>
        </template>
        <template #extra v-if="nightPickupFeeTips || goodsTimeOptimiTips">
          <!-- 夜间取货费/大票货 提示 -->
          <div class="warn-tips">
            <SvgIcon v-if="nightPickupFeeTips" name="dollar-reminder-line" :class="iconStyle" />
            <span :class="nightPickupFeeTips ? 'text' : ''">
              <rich-text :nodes="nightPickupFeeTips || goodsTimeOptimiTips"></rich-text>
            </span>
          </div>
        </template>
      </KyCell>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import { PickModule, GoodsTimeConfig } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import {
  goodsTime,
  isNowGoodsTime,
  nightPickupFeeTips,
  goodsTimeOptimiTips,
  iconStyle,
  filterTime,
} from '../hooks/state'
const props = defineProps<PickModule<GoodsTimeConfig>>()
const timeModeVisible = computed(() => {
  return props.visible
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
