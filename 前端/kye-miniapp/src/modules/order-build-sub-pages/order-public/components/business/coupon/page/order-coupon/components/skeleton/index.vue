<template>
  <div class="order-coupon-skeleton-list">
    <div class="title" style="width: 30%"></div>
    <div class="item" v-for="i in 3" :key="i">
      <van-skeleton :row="1" row-width="100%" />
      <van-skeleton :row="1" row-width="100%" />
      <van-skeleton :row="1" row-width="100%" />
    </div>
  </div>
</template>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
