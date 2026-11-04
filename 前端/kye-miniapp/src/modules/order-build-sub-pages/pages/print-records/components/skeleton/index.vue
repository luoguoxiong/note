<template>
  <div class="address-book-skeleton" v-for="item in 5" :key="item">
    <van-skeleton>
      <template #template>
        <div class="flex">
          <div class="width420 height background margin"></div>
          <div class="width144 height background margin"></div>
        </div>
      </template>
    </van-skeleton>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
