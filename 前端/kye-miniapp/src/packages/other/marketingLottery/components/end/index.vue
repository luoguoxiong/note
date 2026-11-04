<template>
  <view class="container">
    <!-- 活动结束页面内容 -->
    <view class="end-content">
      <view class="end-title">活动已结束</view>
      <view class="end-desc">感谢您的参与，请关注下次活动</view>
    </view>
    
    <!-- 注释掉的 logo，根据原始代码保持注释状态 -->
    <!-- <view class="text-logo-box">
      <image class="text-logo" :src="IMG_BASE_URL + '/marketing-lottery/text-logo.png'" />
    </view> -->
  </view>
</template>

<script setup lang="ts">
import './index.scss'

defineOptions({ name: 'EndPage' })

defineProps<{ activity: any }>()

// const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'
</script>

