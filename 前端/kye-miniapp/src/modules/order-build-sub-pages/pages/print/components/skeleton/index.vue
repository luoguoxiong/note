<template>
  <view class="print-book-skeleton" v-for="(item, index) in 3" :key="item">
    <view class="width350 height background"></view>
    <view class="width100 height background margin"></view>
    <view v-if="index === 0" class="width100 height background margin"></view>
  </view>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.print-book-skeleton {
  margin-top: 20px;
  box-sizing: border-box;
  display: flex;
  overflow: hidden;
  padding: 32px;
  background: #fff;
  border-radius: 0;
  flex-direction: column;

  .margin {
    margin-top: 32px;
  }

  .background {
    background: linear-gradient(90deg, #f1f3f9 0%, #f8faff 99%);
  }

  .height {
    height: 48px;
    border-radius: 8px;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .width100 {
    width: 100%;
  }

  .width350 {
    width: 350px;
  }
}
</style>
