<template>
  <ky-loading class="loading-content" :vertical="vertical" :text-size="textSize" :text-color="textColor">
    {{ text }}
    <template #icon>
      <van-icon :name="loadingImg" />
    </template>
  </ky-loading>
</template>

<script setup lang="ts">
const loadingImg = 'https://ic-img.ky-express.com/netc/20250619_80997_!!1750313700109_80_80.png'
export interface KYLoadingProps {
  text?: string
  vertical?: boolean
  textSize?: string
  textColor?: string
}
withDefaults(defineProps<KYLoadingProps>(), {
  text: '',
  vertical: false,
  textSize: '12px',
  textColor: '#888ea6',
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
