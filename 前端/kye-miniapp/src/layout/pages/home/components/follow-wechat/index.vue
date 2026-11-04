<template>
  <view class="follow-wechat">
    <ky-lazy-image
      src="https://ic-img.ky-express.com/netc/20260211_13787_!!1770773076952_64_64.png"
      @tap="handleClose"
    />
    <view class="follow-wechat__text">关注公众号，实时接收物流消息</view>
    <ky-button class="follow-wechat__button" type="primary" @click="handleFollow">去关注</ky-button>
  </view>
</template>

<script lang="ts" setup>
import './index.scss'
import { openURL } from '@/modules/webview/utils'

const emits = defineEmits(['close'])
const handleFollow = () => {
  openURL('https://mp.weixin.qq.com/s/L7uNt7nXE4g5fYkKtiArgw')
}

const handleClose = () => {
  emits('close')
}
</script>
