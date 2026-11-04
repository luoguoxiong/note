<template>
  <div :class="['ky-car-loading', popperClass, modal ? 'ky-car-loading-mask' : '']" v-show="visible">
    <div class="car-loading-content">
      <div class="car-img" :style="{ height: `${imgSize}px` }">
        <img src="../../../assets/car-loading.gif" />
      </div>
      <div class="progress" v-if="showProgressBar">
        <el-progress v-bind="{ ...$props, ...$attrs }" />
      </div>
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { KyCarLoadingProps } from '@/components/base/ky-loading/types'
withDefaults(defineProps<KyCarLoadingProps>(), {
  visible: false,
  showProgressBar: false,
  modal: true,
  imgSize: 48,
})
</script>
<style lang="scss" scoped>
@import './carLoading.scss';
</style>
