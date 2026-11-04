<template>
  <view class="h-screen flex column order-encrypt-container">
    <ky-navbar :leftArrow="true" title="运单加密规则" v-if="isWxMiniApp"></ky-navbar>
    <view class="order-encrypt-desc">
      <view class="order-encrypt-desc-background"></view>
      <view class="main">
        <view class="main-title">1、服务规则</view>
        <view class="main-desc">
          <text>
            下单人可针对“寄方信息、收方信息”设置“运单加密”。选择该服务后，跨越会在面单及APP/小程序/客户端等官方线上渠道查看信息时，对运单的“寄件公司、寄件人姓名、寄件地址、寄件电话、收件公司、收件人、收件电话、收件地址”进行隐藏。
          </text>
        </view>
        <view class="main-title">2、隐藏格式举例说明</view>
        <view class="main-desc main-desc-pass main-table flex items-center">
          <view class="main-table-left">
            <view class="main-table-title">全加密：</view>
            <view class="main-table-item">寄件人/收件人姓名：**</view>
            <view class="main-table-item">寄件公司/收件公司：****</view>
            <view class="main-table-item">寄件/收件电话：******</view>
            <view class="main-table-item">寄件/收件地址：******</view>
          </view>
          <!-- <view class="main-table-line"></view> -->
          <view class="main-table-right">
            <view class="main-table-title">半加密：</view>
            <view class="main-table-item">张*</view>
            <view class="main-table-item">跨**运</view>
            <view class="main-table-item">1*******0000</view>
            <view class="main-table-item">广东省深圳市宝安区******</view>
          </view>
        </view>
        <view class="main-desc main-table flex items-center">
          <view class="main-table-left">
            <view class="main-table-title">不加密：</view>
            <view class="main-table-item">寄件人/收件人姓名：张三</view>
            <view class="main-table-item">寄件公司/收件公司：跨越速运</view>
            <view class="main-table-item">寄件/收件电话：13500000000</view>
            <view class="main-table-item">寄件/收件地址：广东省深圳市宝安区航站四路跨越速运大厦</view>
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
