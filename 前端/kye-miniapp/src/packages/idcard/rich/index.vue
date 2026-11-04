<template>
  <view class="content">
    <rich-text :nodes="richText.content"></rich-text>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { richText } from '../utils/content'

useDidShow(() => {
  Taro.setNavigationBarTitle({
    title: richText.title,
  })
})
</script>

<style lang="scss">
@import './index.scss';
</style>
