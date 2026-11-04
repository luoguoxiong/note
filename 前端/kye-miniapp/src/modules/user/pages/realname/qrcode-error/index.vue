<template>
  <div class="qrcode-error__container">
    <div class="qrcode-error-wrapper">
      <div class="expire-qrcode"></div>
      <div class="expire-text">{{ expireText }}</div>
      <ky-button type="primary" @click="handleBackToHome">返回首页</ky-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getQueryObject } from '@/public/utils/url'
import Taro from '@tarojs/taro'

const ExpireText = {
  EXPIRE_QRCODE: '二维码已过期，请让司机重新生成二维码',
  WAYBILL_HAS_VERIFIED: '运单已完成实名认证',
}

const expireText = ref(ExpireText.EXPIRE_QRCODE)

const handleBackToHome = () => {
  Taro.switchTab({
    url: '/layout/pages/home/index',
  })
}

onMounted(() => {
  const { waybillHasVerified } = getQueryObject()
  if (waybillHasVerified === 'true') {
    expireText.value = ExpireText.WAYBILL_HAS_VERIFIED
  }
})
</script>

<style lang="scss">
.qrcode-error__container {
  height: 100vh;
  background: #ffffff;
  position: relative;
  .qrcode-error-wrapper {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 452px;
    .expire-qrcode {
      width: 280px;
      height: 280px;
      background: url('https://ic-img.ky-express.com/netc/20250714_90179_!!1752461152945_568_560.png') no-repeat;
      background-size: 280px 280px;
    }
    .expire-text {
      margin: 24px auto;
      color: #686b75;
      font-size: 28px;
      line-height: 40px;
      text-align: center;
    }
    .van-button {
      width: 144px;
      height: 56px;
      box-sizing: border-box;
      font-size: 24px;
      padding: 0;
      background: #8365f6;
      border-radius: 8px;
    }
  }
}
</style>
