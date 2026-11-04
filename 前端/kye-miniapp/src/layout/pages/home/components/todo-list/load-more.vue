<template>
  <view class="load-more" @tap="$emit('load-more')">
    <text>查看更多</text>
    <ky-lazy-image
      :delay="500"
      src="https://ic-img.ky-express.com/netc/20250708_21053_!!1751938777867_48_48.png"
      mode="aspectFit"
    />
  </view>
</template>

<script lang="ts" setup>
import './load-more.scss'

defineOptions({ name: 'load-more' })
</script>
