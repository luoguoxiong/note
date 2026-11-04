<template>
  <div class="specify-address-skeleton">
    <van-skeleton>
      <template #template>
        <!-- 搜索 -->
        <div class="header">
          <div class="header__search"></div>
        </div>
        <!-- 列表 -->
        <div class="list" v-for="item in 6" :key="item">
          <div class="list__title"></div>
          <div class="list__des">
            <div class="address-a"></div>
            <div class="address-b"></div>
          </div>
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
