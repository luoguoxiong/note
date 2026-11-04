<template>
  <view class="qcode-scan">
    <view class="qcode-scan__head">
      <image src="https://ic-img.ky-express.com/netc/20230308_42551702298_!!1678257294393_560_560.png" />
    </view>

    <view class="qcode-scan__sm">当前面单已使用，请更换面单</view>

    <view class="qcode-scan__footer">
      <view @tap="handleScan">继续扫码</view>
      <view @tap="handleMailling">前往寄件页</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import './index.scss'
import { scanQrcode } from '@/public/utils/scan'

const handleScan = () => {
  scanQrcode()
}

const handleMailling = () => {
  Taro.switchTab({
    url: '/layout/pages/order/index',
  })
}
</script>
