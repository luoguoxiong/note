<template>
  <div v-if="visible" :class="['ky-common-loading', modal ? 'ky-loading-mask' : '']">
    <img :style="{ height: `${imgSize}px`, width: `${imgSize}px` }" :src="loadingIcon" />
    <slot><div class="loading-text" v-if="needText">加载中</div></slot>
  </div>
</template>

<script setup lang="ts">
import { KyLoadingProps } from '@/components/base/ky-loading/types'
import { computed } from 'vue'

import purpleIcon from '@/assets/common-loading-purple.png'
import greyIcon from '@/assets/common-loading-grey.png'
import whiteIcon from '@/assets/common-loading-white.png'

const props = withDefaults(defineProps<KyLoadingProps>(), {
  visible: false,
  modal: false, // 默认没有蒙层
  imgSize: 16,
  isGreyIcon: false,
  needText: true,
  iconType: 'purple', // purple grey white
})

const loadingIcon = computed(() => {
  switch (props.iconType) {
    case 'white':
      return whiteIcon
    case 'grey':
      return greyIcon
    default:
      return purpleIcon
  }
})
</script>
<style lang="scss" scoped>
@import './commonLoading.scss';
</style>
