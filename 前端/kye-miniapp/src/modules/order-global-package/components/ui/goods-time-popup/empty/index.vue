<template>
  <view class="gt-empty">
    <slot>
      <img class="gt-empty__img" :src="emptyImg" />
    </slot>
    <slot name="text">
      <div class="gt-empty__text">{{ themeName || '活动' }}已结束，如需要寄件请联系跨越商务~</div>
    </slot>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  themeName?: string
}>()

const emptyImg = 'https://ic-img.ky-express.com/netc/20250619_8744_!!1750300045789_560_552.png'
</script>

<style lang="scss">
@import './index.scss';
</style>
