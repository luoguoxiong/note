<template>
  <view class="app-item">
    <view class="app-item-content">
      <ky-lazy-image :delay="500" class="app-item-icon" :src="data.menuIcon" :placeholder="placeholder" />
      <view class="app-item-title">{{ data.menuName }}</view>
      <ky-lazy-image
        :delay="500"
        mode="aspectFit"
        v-if="data.menuBackground"
        class="app-item-menuBackground"
        :src="data.menuBackground"
      />

      <view class="app-item-text" v-if="badgeType === 'text'">{{ data.smallIconContent }}</view>
      <ky-lazy-image
        :delay="500"
        class="app-item-tag"
        v-if="badgeType === 'tag' && !data.menuBackground && data.smallIcon"
        :src="data.smallIcon"
      />
    </view>
  </view>
</template>
<script setup lang="ts">
import './index.scss'
import placeholder from '@/layout/assets/images/placeholder.png'
import { computed } from 'vue'

const props = defineProps<{ data: any }>()

const badgeType = computed(() => {
  if (props.data.smallIconType === 10 || props.data.smallIconType === 0) {
    return 'tag'
  }
  if (props.data.smallIconType === 20) {
    return 'text'
  }
  return undefined
})
</script>
