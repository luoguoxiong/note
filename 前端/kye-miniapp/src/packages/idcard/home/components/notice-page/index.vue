<template>
  <view class="idcard-page__notice-page">
    <view class="notice-info">
      <image
        src="https://ic-img.ky-express.com/netc/20250208_70670395170_!!1738988012672_120_120.png"
        class="notice-img"
      />
      <view class="notice-title">账号信息不一致</view>
      <view class="notice-desc">寄件小程序账号和企微注册号码不一致，请切换同一账号登录</view>
      <view class="notice-button" @tap="toLogin">切换</view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 账号信息不一致
 */
import Taro from '@tarojs/taro'
import { useIdCardStore } from '@/packages/idcard/store/idcard'

const { updateFresh } = useIdCardStore()

const toLogin = () => {
  updateFresh(true)
  Taro.navigateTo({
    url: '/modules/user/pages/login/index',
  })
}
</script>

<style lang="scss">
@import './index.scss';
</style>
