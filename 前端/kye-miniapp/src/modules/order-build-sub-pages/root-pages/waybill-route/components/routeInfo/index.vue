<template>
  <view class="info">
    <view class="info-head">
      <view class="info-head-left">
        <text class="title">物流详情</text>
        <view class="desc">
          <image
            class="desc-image"
            src="https://ic-img.ky-express.com/netc/20250116_7996747429_!!1737030211139_48_48.png"
          />
          <text class="desc-text">分批派送记录</text>
        </view>
      </view>
      <view class="info-head-right">
        <text class="push">
          <text class="push-text">物流推送</text>
          <ky-switch v-model="check" />
        </text>
      </view>
    </view>
    <view class="info-logistics">
      <WaybillRouteLogistics />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './index.scss'
import WaybillRouteLogistics from '../routeLogistics/index.vue'

const check = ref(false)
</script>
