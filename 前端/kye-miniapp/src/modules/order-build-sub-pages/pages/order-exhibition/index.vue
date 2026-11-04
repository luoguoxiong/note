<template>
  <view class="exhibition-page">
    <!-- 实名横幅：已绑码 + 需实名 + 非转发类按钮 -->
    <view v-if="showReal" class="real-banner">
      <view class="real-banner-text">{{ realAuthTipsText }}</view>
      <view class="real-banner-btn" @click="jumpReal">去实名</view>
    </view>

    <!-- 入口卡片：撤展 > 来展 -->
    <view class="entry-list">
      <view
        v-for="entry in ENTRY_LIST"
        :key="entry.channel"
        class="entry-card"
        :style="{ backgroundImage: entry.bg }"
        @click="goFill(entry.channel)"
      >
        <view
          class="entry-icon"
          :style="{ backgroundImage: `url(${entry.icon})` }"
        />
        <view class="entry-info">
          <view class="entry-title">{{ entry.title }}</view>
          <view class="entry-desc">{{ entry.desc }}</view>
        </view>
        <image class="entry-arrow" :src="entry.arrow" mode="aspectFit" />
      </view>
    </view>

    <!-- 5大核心优势：单张长图整体渲染 -->
    <image class="advantage-img" :src="ADVANTAGE_IMG" mode="widthFix" />
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, onBeforeMount, onMounted, watch } from 'vue'
import { debounce } from 'lodash-es'
import { useUserGlobalStore } from '@/store/user'
import { useRealAuth } from '../order-success/hooks/useRealAuth'
import { getExhibitionPreload } from '@order-public-sub-public/apis/init'
import { Channel, YesOrNoNumber } from '@order-public-sub-public/constants'
import { ENTRY_LIST, ADVANTAGE_IMG, REALNAME_AUTH_URL } from './config'
import {
  page_express_exhibition_browse_v1,
  other_express_exhibition_perception_v1,
  clk_express_exhibition_dismantling_v1,
  clk_express_exhibition_arrival_v1,
  exp_express_result_kyc,
  clk_express_result_kyc,
} from './report'
import './index.scss'

const userStore = useUserGlobalStore()
const { showGoRealNameFlag, realNameButtonType, realAuthTipsText, getSuccessPageTipsData } =
  useRealAuth()

// 实名横幅：已绑码 + 需实名 + 按钮类型为 YES（非转发类）
const showReal = computed(
  () =>
    !!userStore.customerCode &&
    showGoRealNameFlag.value &&
    realNameButtonType.value === YesOrNoNumber.YES,
)

const getRealData = () => {
  if (!userStore.customerCode) {
    return
  }
  getSuccessPageTipsData({}, {
    delBatchId: true,
  })
}

watch(() => userStore.customerCode, getRealData)
onMounted(() => {
  getRealData()
  // 展会下单感知：入口卡片展示时上报一次
  other_express_exhibition_perception_v1()
})

// 实名横幅曝光上报：showReal 变为 true 时触发
watch(showReal, (val) => {
  val && exp_express_result_kyc()
})

// 页面浏览：每次进入上报，ref_source 由页面栈判定前向来源；返回时刷新实名横幅状态
useDidShow(() => {
  page_express_exhibition_browse_v1()
  // getRealData()
})

// 预加载：仅前端触发后端提前初始化展会下单配置（不写本地缓存，预渲染数据沿用 singlePageV2 缓存）
onBeforeMount(() => {
  getExhibitionPreload()
})

// leading 立即跳转，防抖窗口内重复点击忽略（快速点击多次跳转问题）
const goFill = debounce(
  (channel: Channel) => {
    // 按渠道分流上报入口点击
    channel === Channel.撤展下单
      ? clk_express_exhibition_dismantling_v1()
      : clk_express_exhibition_arrival_v1()
    Taro.navigateTo({
      url: `/modules/order-build/pages/order/index?channel=${channel}`,
    })
  },
  500,
  { leading: true, trailing: false },
)

const jumpReal = () => {
  clk_express_result_kyc()
  Taro.navigateTo({
    url: REALNAME_AUTH_URL,
  })
}
</script>
