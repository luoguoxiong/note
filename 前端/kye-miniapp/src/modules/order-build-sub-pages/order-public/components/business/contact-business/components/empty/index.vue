<template>
  <div class="contact-business-empty">
    <slot>
      <img class="img" :src="emptyImg" />
    </slot>
    <slot name="test">
      <div class="text">商务还未开通企业微信，可电话联系销售</div>
    </slot>
  </div>
</template>

<script setup lang="ts">
const emptyImg = 'https://ic-img.ky-express.com/netc/20250619_60399_!!1750300758874_560_560.png'
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
