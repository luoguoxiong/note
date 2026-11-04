<!--
  Footer 组件
  底部操作按钮
-->
<template>
  <view class="footer">
    <button class="footer__button default" @tap="onCall">拨打95324</button>
    <button class="footer__button primary" @tap="onAbout">了解跨越</button>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'

defineOptions({ name: 'Footer' })

// 拨打电话
const onCall = () => {
  Taro.makePhoneCall({
    phoneNumber: '95324',
  })
}

// 跳转到了解跨越页面
const onAbout = () => {
  Taro.navigateTo({
    url: '/packages/webview/index?src=https://m.ky-express.com/about.html',
  })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
