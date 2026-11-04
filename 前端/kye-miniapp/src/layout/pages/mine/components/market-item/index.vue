<template>
  <view class="market-item">
    <view class="market-item-inner">
      <view v-if="data.menuIconContent" class="market-item-content">{{ data.menuIconContent }}</view>
      <ky-lazy-image :delay="500" v-else class="market-item-icon" :src="data.menuIcon" :placeholder="placeholder" />
      <view class="market-item-title">{{ data.menuName }}</view>
      <ky-lazy-image
        :delay="500"
        class="bottom-small-icon"
        :src="data.smallIcon"
        v-if="(data.smallIconType === 10 || data.smallIconContent === 0) && data.smallIcon"
      />
      <view v-if="data.smallIconType === 20" class="bottom-content">{{ data.smallIconContent }}</view>
    </view>
  </view>
</template>
<script setup lang="ts">
import './index.scss'
import placeholder from '@/layout/assets/images/placeholder.png'
defineProps<{ data: any }>()
</script>
