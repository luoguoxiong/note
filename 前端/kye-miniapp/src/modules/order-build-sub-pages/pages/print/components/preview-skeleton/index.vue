<template>
  <div class="address-book-skeleton">
    <van-skeleton>
      <template #template>
        <div class="flex">
          <div>
            <div class="width268 height52 background margin"></div>
            <div class="width268 height background-left margin"></div>
          </div>
          <div>
            <div class="width268 height52 background margin"></div>
            <div class="width268 height background-left margin"></div>
          </div>
        </div>
        <div class="width100 height92 background margin mt-48"></div>
        <div class="flex mt-48">
          <div class="flex1 width10 height40 background margin"></div>
          <div class="flex9">
            <div class="height40 background margin"></div>
            <div class="flex flex-between">
              <div class="width115 height52 background margin"></div>
              <div class="width190 height52 background-left margin"></div>
            </div>
            <div class="flex flex-between">
              <div class="width228 height background margin"></div>
              <div class="width228 height background-left margin"></div>
            </div>
          </div>
        </div>
        <div class="flex mt-48">
          <div class="flex1 width10 height40 background margin"></div>
          <div class="flex9">
            <div class="height40 background margin"></div>
            <div class="height20 background margin"></div>
            <div class="width228 height20 background margin"></div>
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
