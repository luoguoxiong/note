<template>
  <div class="address-book-skeleton" v-for="item in 1" :key="item">
    <van-skeleton>
      <template #template>
        <div class="flex">
          <div class="width30 height background-linear margin"></div>
          <div class="width30 height background-linear margin"></div>
        </div>
        <div class="width100 height-48 background-linear margin"></div>
        <div class="width100 height-48 background-linear margin"></div>
        <div class="width100 height-48 background-linear margin"></div>
        <div class="width-52 height-48 background-linear margin"></div>
      </template>
    </van-skeleton>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
