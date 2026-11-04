<template>
  <view class="customer-code-decorate-title">
    <view class="title-line left">
      <view class="line-item" v-for="i in 6" :key="'l' + i"></view>
    </view>
    <text class="title-text">{{ title }}</text>
    <view class="title-line right">
      <view class="line-item" v-for="i in 6" :key="'r' + i"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
  }>(),
  {
    title: '',
  },
)
</script>

<style lang="scss">
.customer-code-decorate-title {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 24px 0 16px;

  .title-line {
    display: flex;
    align-items: center;
    gap: 15px;

    .line-item {
      width: 8px;
      height: 12px;
      background: #e6e8ed;
      transform: skewX(-20deg);
    }

    &.right {
      .line-item {
        transform: skewX(20deg);
      }
    }
  }

  .title-text {
    font-size: 36px;
    font-weight: 600;
    line-height: 52px;
    color: #24262b;
    white-space: nowrap;
  }
}
</style>
