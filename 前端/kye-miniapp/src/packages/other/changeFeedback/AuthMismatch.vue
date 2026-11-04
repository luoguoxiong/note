<template>
  <view class="auth-mismatch">
    <view class="auth-mismatch__title">
      <view
        >请用 {{ params.authPhone ? filterPhone(params.authPhone) : '' }}
        {{ params.forwardPhone ? filterPhone(params.forwardPhone) : '' }} 手机号</view
      >
      <view>登录查看详情</view>
    </view>
    <view class="auth-mismatch__content">
      <Image className="block no-dataimg" src="https://ic-h5.kye-erp.com/intro/miniprogram/nodata3.png" />
      <view>暂无数据</view>
    </view>
    <view class="auth-mismatch__btn">
      <ky-button plain class="flex_center" size="large" type="primary" @click="goLogin"> 重新登录 </ky-button>
    </view>
  </view>
</template>
<script setup lang="ts">
import Taro from '@tarojs/taro'

interface authProps {
  params: any
}
defineProps<authProps>()

const filterPhone = (phone: string) => {
  if (phone) {
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
  } else {
    return ''
  }
}
const goLogin = () => {
  Taro.navigateTo({ url: '/modules/user/pages/login/index' })
}
</script>
<style lang="scss">
@import './index.scss';
</style>
