<!--
  预约中心
  活动预约消息订阅
-->
<template>
  <view class="anniversary17-success-page">
    <view class="header">
      <view class="title">预约活动提醒</view>
    </view>
    <button class="btn" @tap="onConfirmClick">我要预约</button>
    <view class="next-btn" @tap="goBack">下次再说</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

defineOptions({
  name: 'ReservationActivity',
  navigationBarTitleText: '预约服务',
})

const TEMP_IDS = ['Hz4lsFEpsMvusVwh4TcGUCTsyTy6h3XbE946GZnlYUs']

// 响应式数据
const isSubscribe = ref(false)

// 消息订阅
const onConfirmClick = async () => {
  // 订阅了不连续订阅
  if (isSubscribe.value) {
    return false
  }
  isSubscribe.value = true
  await Taro.requestSubscribeMessage({
    tmplIds: TEMP_IDS,
    entityIds: TEMP_IDS,
    success: (result) => {
      if (TEMP_IDS.every((id) => result[id] === 'accept')) {
        Taro.showToast({ icon: 'none', title: '订阅成功' })
        setTimeout(() => {
          goBack()
        }, 3000)
      } else {
        goBack()
      }
    },
    fail: () => {
      goBack()
    },
    complete: (result) => {
      // 是否有拒绝订阅的消息
      console.log(result, '完成')
      isSubscribe.value = false
    },
  })
}

const goBack = () => {
  Taro.navigateBack()
}

onMounted(() => {
  // 设置登录成功刷新状态
  // 这里可以根据需要添加相应的逻辑
})
</script>

<style lang="scss">
@import './index.scss';
</style>
