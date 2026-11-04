<template>
  <view class="content-card-box">
    <view v-if="titleImg || titleText" class="title">
      <image v-if="titleImg" class="title-bg" :src="titleImg" />
      <text v-if="titleText">{{ titleText }}</text>
    </view>
    <view class="inner-box">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ContentCard',
})

defineProps<{
  titleImg?: string
  titleText?: string
}>()
</script>

<style lang="scss">
@import './index.scss';
</style>

