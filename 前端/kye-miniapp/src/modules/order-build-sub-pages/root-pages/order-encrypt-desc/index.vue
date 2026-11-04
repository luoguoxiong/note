<template>
  <view class="h-screen flex column order-encrypt-container">
    <ky-navbar :leftArrow="true" title="运单加密规则" v-if="isWxMiniApp"></ky-navbar>
    <view class="order-encrypt-desc">
      <view class="order-encrypt-desc-background"></view>
      <view class="main">
        <view class="main-title">1、服务规则</view>
        <view class="main-desc">
          <text>
            本服务针对下单人提供，选择服务后，下单人可对寄件人姓名、寄件公司、寄件电话、寄件地址根据自身需求进行半加密或全加密的隐藏处理，包括面单信息，通过跨越速运官方线上渠道app/小程序等查看运单信息的时候，加密过的信息均会进行隐藏；
          </text>
        </view>
        <view class="main-title">2、隐藏格式</view>
        <view class="main-desc main-table flex items-center">
          <view class="main-table-left">
            <view class="main-table-title">全加密：</view>
            <view class="main-table-item">寄件人姓名：******</view>
            <view class="main-table-item">寄件人公司：******</view>
            <view class="main-table-item">寄 件 电 话：******</view>
            <view class="main-table-item">寄 件 地 址：******</view>
          </view>
          <view class="main-table-line"></view>
          <view class="main-table-right">
            <view class="main-table-title">半加密：</view>
            <view class="main-table-item">寄件人姓名：张*</view>
            <view class="main-table-item">寄件人公司：跨***越</view>
            <view class="main-table-item">寄 件 电 话：1******3333</view>
            <view class="main-table-item">寄 件 地 址：广东省深圳市龙华区**</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { isWxMiniApp } from '@/public/utils'
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
