<template>
  <view class="not-match-wrapper">
    <view class="not-match-container">
      <image class="img" :src="NOT_MATCH_BG" />
      <view class="status">登录失败</view>
      <view class="desc">{{ desc }}</view>
      <view class="btn" @click="onSwitch">切换登录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed, ref } from 'vue'
import { NOT_MATCH_BG } from '../../constants'
import Taro from '@tarojs/taro'

defineOptions({ name: 'NotMatch' })

const props = defineProps<{ mobile?: string }>()

// 用户信息（模拟）
const usrInfo = ref({
  phone: '',
})

const desc = computed(() => {
  if (!props.mobile) return ''
  return `您当前登录【跨越寄件小程序】的手机号与中奖号码${props.mobile.slice(0, 3)}****${props.mobile.slice(7)}不一致，请切换登录`
})

function onSwitch() {
  if (usrInfo.value.phone) {
    Taro.navigateTo({
      url: '/packages/user/loginOut/index',
    })
  } else {
    Taro.navigateTo({ url: '/packages/user/login/index' })
  }
}
</script>
