<template>
  <div class="skeleton-content" v-for="item in 1" :key="item">
    <van-skeleton>
      <template #template>
        <div class="width100 height48 background margin32"></div>
        <div class="width100 height48 background margin32"></div>
        <div class="width100 height48 background margin32"></div>
        <div class="width50 height48 background margin32"></div>
      </template>
    </van-skeleton>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
