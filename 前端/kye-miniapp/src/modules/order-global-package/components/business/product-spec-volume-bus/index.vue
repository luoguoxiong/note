<template>
  <ky-cell
    v-if="visible"
    :class="`${moduleStyle === 'popup' ? 'product-info-volume-size-popup' : ''}`"
    :style="{ overflow: 'unset' }"
  >
    <template #title>
      <div class="flex space-between product-volume w-full product-stepper-content">
        <div class="font-level3 flex items-center product-volume-item" id="volumeContainer">
          <span class="volume-label">
            <slot name="volumeReport"></slot>
            总体积<SvgIcon class="product-spec-required" name="required" v-if="required" />
          </span>
          <!-- 抛重提示 -->
          <span v-if="isShowGrossWeightTips" class="gross-weight-tips">{{ grossWeightTips }}</span>
        </div>
        <div>
          <slot name="stepper"></slot>
          <slot name="switch"></slot>
        </div>
      </div>
    </template>
    <template #extra>
      <slot name="extra-stepper"></slot>
    </template>
  </ky-cell>
</template>

<script setup lang="ts">
import SvgIcon from '../../ui/svg-icon/index.vue'

interface ProductSpecVolumeBusProps {
  visible?: boolean
  moduleStyle?: string
  required?: boolean
  isShowGrossWeightTips?: boolean
  grossWeightTips?: string
}

withDefaults(defineProps<ProductSpecVolumeBusProps>(), {
  visible: true,
  moduleStyle: 'page',
  required: false,
  isShowGrossWeightTips: false,
  grossWeightTips: '',
})
</script>

<style lang="scss">
@import '../../../styles/index.scss';
@import './index.scss';
</style>
