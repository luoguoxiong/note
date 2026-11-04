<!--
  全民拓客 - Header 组件
  页面头部，包含背景、标题、活动规则弹窗
-->
<template>
  <view class="header">
    <image class="header--bg" :src="`${IMG_BASE_URL}/expand-customer/bg_1.png`" />
    <image class="header--bg" :src="`${IMG_BASE_URL}/expand-customer/bg_2.png`" />

    <!-- 只有首页需要Logo -->
    <image v-if="page === 'home'" class="header--logo" :src="`${IMG_BASE_URL}/expand-customer/logo.png`" />

    <image v-if="titleClass && titleImg" :class="titleClass" :src="titleImg" />

    <!-- 只有新客页面需要活动规则 -->
    <view v-if="page === 'new'" class="header--btn" @tap="openPopup">活动规则</view>

    <!-- 活动规则弹窗 -->
    <view v-if="show" class="rules__wrapper">
      <view class="rules-box">
        <view class="rules-box__header">
          <view class="rules-box__header--title">
            每满10000元
            <text class="text">减免1000</text>元
          </view>
          <view class="rules-box__header--desc">最高减免5000元</view>
        </view>
        <view class="rules-box__body">
          <view class="rules-q">一、活动时间</view>
          <view class="rules-a">2020年05月25日-2020年11月25日</view>
          <view class="rules-q">二、使用对象</view>
          <view class="rules-a">新客户</view>
          <view class="rules-q">三、使用范围</view>
          <view class="rules-a">适用于跨越速运所有产品（整车除外）</view>
          <view class="rules-q">四、使用规则</view>
          <view class="rules-ali">
            <text class="rules-ali__no">1</text>
            <text class="rules-ali__p"
              >跨越速运将通过您预留的联系方式，安排市场销售为您提供一对一的定制化服务，并指引您使用优惠券；</text
            >
          </view>
          <view class="rules-ali">
            <text class="rules-ali__no">2</text>
            <text class="rules-ali__p">一次只能使用一张优惠券，一张优惠券只能使用一次；</text>
          </view>
          <view class="rules-ali">
            <text class="rules-ali__no">3</text>
            <text class="rules-ali__p">不兑现、不找零、一次性使用，使用优惠券减免的运费，不再开具发票；</text>
          </view>
          <view class="rules-ali">
            <text class="rules-ali__no">4</text>
            <text class="rules-ali__p">仅限企业寄件使用，个体寄件不可用；</text>
          </view>
          <view class="rules-ali">
            <text class="rules-ali__no">5</text>
            <text class="rules-ali__p">奖券不可转让他人。</text>
          </view>
        </view>
      </view>

      <image class="rules__close" :src="`${IMG_BASE_URL}/expand-customer/icon-close.png`" @tap="closePopup" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineOptions({ name: 'ExpandCustomerHeader' })

// Props
interface Props {
  page?: 'home' | 'new' | 'old'
}

const props = withDefaults(defineProps<Props>(), {
  page: 'home',
})

// 常量
const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

// 状态
const show = ref(false)

// 计算属性
const titleClass = computed(() => {
  switch (props.page) {
    case 'home':
      return 'header--title home'
    case 'new':
      return 'header--title new'
    case 'old':
      return 'header--title old'
    default:
      return ''
  }
})

const titleImg = computed(() => {
  switch (props.page) {
    case 'home':
      return `${IMG_BASE_URL}/expand-customer/bg_title_index.png`
    case 'new':
      return `${IMG_BASE_URL}/expand-customer/bg_title_new.png`
    case 'old':
      return `${IMG_BASE_URL}/expand-customer/bg_title_old.png`
    default:
      return ''
  }
})

// 方法
const openPopup = () => {
  show.value = true
}

const closePopup = () => {
  show.value = false
}
</script>

<style lang="scss">
@import './index.scss';
</style>
