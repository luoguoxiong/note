<template>
  <div v-if="show" class="banner" id="Banner">
    <img v-for="(item, index) in urls" :key="index" class="img" :src="item.url" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 类型
import { PickModule, BannerConfig } from '@order-public-sub-public/types'

const props = defineProps<PickModule<BannerConfig>>()

// 显示
const show = computed(() => urls.value?.length > 0 || false)

// 图片
const urls = computed(() => props.config?.urls || [])
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
