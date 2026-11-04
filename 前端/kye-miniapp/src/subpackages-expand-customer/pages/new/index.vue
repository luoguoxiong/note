<!--
  新客户成功页
  显示专属销售代表信息和优势说明
-->
<template>
  <view class="page page-new">
    <Header page="new" />

    <view class="page__body">
      <view class="new-p1">已为您安排专属销售代表</view>
      <view class="new-p2">尊享1对1定制化服务</view>

      <view v-if="name && phone" class="new-p3">
        <view class="new-p3__name">{{ name }}</view>
        <view class="new-p3__phone" @tap="onCall">
          <text class="new-p3__text">{{ phone }}</text>
          <image class="new-p3__icon" :src="`${IMG_BASE_URL}/expand-customer/icon-phone.png`"></image>
        </view>
      </view>
    </view>

    <Tips />

    <Footer />
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import Header from '../../components/header/index.vue'
import Tips from '../../components/tips/index.vue'
import Footer from '../../components/footer/index.vue'

defineOptions({ name: 'ExpandCustomerNew' })

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
