<template>
  <div class="address-book-skeleton" v-for="item in 3" :key="item">
    <van-skeleton>
      <template #template>
        <div class="flex" v-for="j in 3" :key="j">
          <div class="width-48 height-40 background-linear" :class="{ margin: j !== 1 }"></div>
          <div class="width-48 height-40 background-linear" :class="{ margin: j !== 1 }"></div>
        </div>
      </template>
    </van-skeleton>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
