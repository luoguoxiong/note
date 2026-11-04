<template>
  <ky-cell
    v-if="visible"
    :class="`product-info-actual-weight ${moduleStyle === 'popup' ? 'product-info-actual-weight-popup' : ''}`"
    :style="{ overflow: 'unset' }"
  >
    <template #title>
      <div class="w-full">
        <div class="flex space-between w-full product-stepper-content">
          <div class="font-level3 flex items-center">
            <slot name="weightReport"></slot>
            总重量<SvgIcon class="product-spec-required" name="required" v-if="required" />
          </div>
          <div>
            <slot name="stepper"></slot>
          </div>
        </div>
        <div v-if="isShowOverWeightTip && overLengthAndWeightFee?.overWeightTips">
          <slot name="overWeightReport"></slot>
          <div class="flex items-center font-level4 reminder">
            <SvgIcon class="reminder__icon" name="dollar-reminder-line" />
            <span class="color-error">{{ overLengthAndWeightFee?.overWeightTips }}</span>
          </div>
        </div>
        <!-- 货好时间提示的优先级要大 -->
        <template v-else>
          <span v-if="overLengthAndWeightFee?.goodsTimeOptimiTips?.length">
            <span v-html="overLengthAndWeightFee.goodsTimeOptimiTips"></span>
          </span>
        </template>
      </div>
    </template>
  </ky-cell>
</template>

<script setup lang="ts">
import SvgIcon from '../../ui/svg-icon/index.vue'

interface OverLengthAndWeightFee {
  overWeightTips?: string
  goodsTimeOptimiTips?: string
}

interface ProductSpecWeightBusProps {
  visible?: boolean
  moduleStyle?: string
  required?: boolean
  isShowOverWeightTip?: boolean
  overLengthAndWeightFee?: OverLengthAndWeightFee
}

withDefaults(defineProps<ProductSpecWeightBusProps>(), {
  visible: true,
  moduleStyle: 'page',
  required: false,
  isShowOverWeightTip: false,
})
</script>

<style lang="scss">
@import '../../../styles/index.scss';
@import './index.scss';
</style>
