<!--
  老客户页面
  引导用户参与企客介绍活动
-->
<template>
  <view class="page page-old">
    <Header page="old" />

    <view class="page-old__tip">已为200w+企业节约物流成本</view>

    <view class="page__body">
      <view class="old-p">
        <view class="old-p__line"></view>
        <view class="old-p__no">1</view>
        <text class="old-p__text">登录【跨越企客介绍】小程序创建账户；</text>
      </view>
      <view class="old-p">
        <view class="old-p__line"></view>
        <view class="old-p__no">2</view>
        <text class="old-p__text">邀请同事、好友等加入账户；</text>
      </view>
      <view class="old-p">
        <view class="old-p__line"></view>
        <view class="old-p__no">3</view>
        <text class="old-p__text">完善推荐客户信息，一键介绍；</text>
      </view>
      <view class="old-p">
        <view class="old-p__no">4</view>
        <text class="old-p__text">介绍成功奖励到手，抵扣运费。</text>
      </view>
    </view>

    <button class="button" @tap="onClick">立即参与</button>

    <view v-if="name && phone">
      <view class="p">详情垂询您的专属销售代表：</view>
      <view class="p">
        <view class="p__name">{{ name }}</view>
        <view class="p__phone" @tap="onCall">
          <text class="p__text">{{ phone }}</text>
          <image class="p__icon" :src="`${IMG_BASE_URL}/expand-customer/icon-phone_2.png`"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import Header from '../../components/header/index.vue'

defineOptions({ name: 'ExpandCustomerOld' })

// 声明全局变量
declare const getCurrentPages: any

// 常量
const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

// 获取路由参数
const getRouteParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.options || {}
}

const params = getRouteParams()
const name = params.name || ''
const phone = params.phone || ''

// 跳转跨越企客介绍小程序
const onClick = () => {
  Taro.navigateToMiniProgram({
    appId: 'wxf3f46aa65f3cb51a',
    path: 'pages/accountHome/index',
  })
}

// 拨打电话
const onCall = () => {
  Taro.makePhoneCall({
    phoneNumber: phone,
  })
}
</script>

<style lang="scss">
@import '../../styles/base.scss';
@import './index.scss';
</style>
