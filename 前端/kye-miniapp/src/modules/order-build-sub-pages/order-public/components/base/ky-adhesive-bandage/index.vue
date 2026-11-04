<template>
  <div class="ky-adhesive-bandage" :class="isDirectivity ? 'directivity' : colorTheme" v-if="isShow">
    <slot>
      <slot name="icon">
        <!-- <SvgIcon name="icon-tips" /> -->
      </slot>
      <div class="text-content">{{ text }}</div>
    </slot>
    <div v-if="isShowClose" @click="close" class="close-btn">
      <van-icon name="cross" />
    </div>
    <div class="directivity-row" v-if="isDirectivity"></div>
  </div>
</template>

<script setup lang="ts">
// import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { ref } from 'vue'
let isShow = ref(true)
const emit = defineEmits(['close'])
export interface KYBandageProps {
  text?: string
  isShowClose?: boolean
  colorTheme?: string
  isDirectivity?: boolean
}
withDefaults(defineProps<KYBandageProps>(), {
  text: '',
  isShowClose: false,
  colorTheme: 'warning',
  isDirectivity: false,
})

const close = () => {
  isShow.value = false
  emit('close')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
