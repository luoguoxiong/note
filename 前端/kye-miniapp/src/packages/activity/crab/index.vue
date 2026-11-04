<!--
  大闸蟹活动
  新客户领券活动页面
-->
<template>
  <view class="crabContainer">
    <!-- 使用 Taro 原生 Toast 替代 AtToast -->
    <!-- AtToast 组件已移除，使用 Taro.showToast 替代 -->
    <image class="crabBg" :src="`${IMG_BASE_URL}/crab/bg_crab.png`" mode="aspectFill" />
    <view
      class="crabUsed"
      @tap="
        () => {
          isShow = true
        }
      "
      >使用规则</view
    >
    <image class="crabPlate" :src="`${IMG_BASE_URL}/crab/bg_crab_plate.png`" mode="aspectFit" />
    <image class="crabTitle" :src="`${IMG_BASE_URL}/crab/bg_crab_tip.png`" mode="aspectFit" />
    <view class="crabContent">
      <image class="crabBag" :src="`${IMG_BASE_URL}/crab/bg_crab_bag.png`" mode="aspectFit" />
      <image class="crabLeftMoney" :src="`${IMG_BASE_URL}/crab/bg_crab_left_money.png`" mode="aspectFit" />
      <image class="crabRightMoney" :src="`${IMG_BASE_URL}/crab/bg_crab_right_money.png`" mode="aspectFit" />
      <image class="topRibbon" :src="`${IMG_BASE_URL}/crab/bg_crab_top_ribbon.png`" mode="aspectFit" />
      <image class="bottomRibbon" :src="`${IMG_BASE_URL}/crab/bg_crab_bottom_ribbon.png`" mode="aspectFit" />
      <image class="rightRibbon" :src="`${IMG_BASE_URL}/crab/bg_crab_left_ribbon.png`" mode="aspectFit" />
      <image class="leftRibbon" :src="`${IMG_BASE_URL}/crab/bg_crab_right_ribbon.png`" mode="aspectFit" />
      <image class="leftTicket" :src="`${IMG_BASE_URL}/crab/bg_crab_left_ticket.png`" mode="aspectFit" />
      <image class="rightTicket" :src="`${IMG_BASE_URL}/crab/bg_crab_right_ticket.png`" mode="aspectFit" />
      <image class="bottomTicket" :src="`${IMG_BASE_URL}/crab/bg_crab_bottom_ticket.png`" mode="aspectFit" />
      <image class="crabOpen" @tap="goMailing" :src="`${IMG_BASE_URL}/crab/bg_crab_open.png`" mode="aspectFit" />
    </view>
    <PageAlert
      v-if="isShow"
      @confirm="
        () => {
          isShow = false
        }
      "
    >
      <view class="rule-section">
        <view class="rule-title">一、寄件规则：</view>
        <view class="rule-item">1、寄件地区要求：仅在苏州地区才可使用</view>
        <view class="rule-item">2、收件地区要求：</view>
        <view class="rule-item">
          <text class="rule-highlight">大闸蟹专运券：</text>适用于收方地址在江苏、浙江、上海、安徽等地区；
        </view>
        <view class="rule-item">
          <text class="rule-highlight">大闸蟹空运券：</text>适用于收方地址不在江苏、浙江、上海、安徽等地区；
        </view>
      </view>
      <view class="rule-section">
        <view class="rule-title">二、使用规则：</view>
        <view class="rule-item">1、运费付款方式必须是寄付</view>
        <view class="rule-item">2、一张奖券仅能使用在一个运单，一个运单仅能使用一张奖券</view>
        <view class="rule-item">3、奖券仅抵扣运单运费（不包含增值服务费）</view>
        <view class="rule-item">4、奖券不可赠与他人、不可转让、不找零</view>
      </view>
      <view class="rule-section">
        <view class="rule-title">三、退还规则：</view>
        <view class="rule-item">1、下单后司机还未取货，主动取消订单，优惠券自动退回原账户</view>
        <view class="rule-item">2、下单使用优惠券24小时后司机还未取货，优惠券自动退回原账户</view>
        <view class="rule-item">3、核销优惠券时如运单信息不满足条件，优惠券退回原账户</view>
        <view class="rule-item">4、优惠券核销后如出现反核销，运单信息不满足优惠券使用条件，优惠券退回原账户</view>
      </view>
    </PageAlert>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
// import { AtToast } from 'taro-ui' // 注释掉，使用 Taro 原生组件
import { useUserGlobalStore } from '@/store/user'
import PageAlert from '@public/components/pageAlert/index.vue'
import CrabAPI from './apis/index'

defineOptions({
  name: 'CrabActivity',
  navigationBarTitleText: '跨越寄件',
})

const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

// 获取用户信息
const userStore = useUserGlobalStore()

// 响应式数据
const isShow = ref(false)
const isFirst = ref(false)

// 点击领券
const goMailing = async () => {
  const userInfo = userStore.data?.userInfo
  if (!userInfo?.phone) {
    return Taro.navigateTo({ url: '/modules/user/pages/login/index' })
  }

  if (isFirst.value) return

  isFirst.value = true
  Taro.showLoading({ mask: true, title: '' })

  try {
    const res = await CrabAPI.pickCoupon({
      phone: userInfo.phone,
      sendIsOld: '0',
      waybillCount: '1',
      sendPrizeType: '3',
    })

    isFirst.value = false
    Taro.hideLoading()

    const data = res.data as any[]
    if (res && data && data.length) {
      Taro.setStorageSync('pickCoupon', data)
      const hasReceived = data.some((val: any) => val.querySendPrizeCount)
      Taro.showToast({
        title: hasReceived ? '您已经领取过了' : '领取成功',
        icon: 'none',
        duration: 1500,
      })
    }

    setTimeout(() => {
      Taro.switchTab({ url: '/layout/pages/home/index' })
    }, 500)
  } catch (err: any) {
    isFirst.value = false
    Taro.hideLoading()
    Taro.showToast({
      title: err.msg,
      icon: 'none',
      duration: 1500,
    })

    setTimeout(() => {
      Taro.switchTab({ url: '/layout/pages/home/index' })
    }, 500)
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
