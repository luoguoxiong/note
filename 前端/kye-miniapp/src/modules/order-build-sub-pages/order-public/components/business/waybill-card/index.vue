<template>
  <view class="waybill-card">
    <view class="waybill-card-head">
      <view class="waybill-card-head-left" @tap="handleCopyWaybillNumber" @touchstart="null">
        <slot name="headLeft" v-if="$slots.headLeft"></slot>
        <view class="waybill-card-number" v-else>KY5000208088246</view>
        <view class="waybill-card-copy"
          ><KyImage src="https://ic-img.ky-express.com/netc/20250116_64766203768_!!1737014315546_64_64.png"
        /></view>
      </view>
      <slot name="headRight"></slot>
    </view>
    <view class="waybill-card-content">
      <view class="waybill-card-info">
        <slot name="cardInfoLeft"></slot>
        <view class="waybill-card-info-right">
          <view class="waybill-card-info-head">
            <view class="send-receive-info">
              <view class="send-receive-info__city">深圳市深圳市深圳市深圳市</view>
              <view class="send-receive-info__name">寄*左</view>
              <view class="send-receive-info__company">深圳市</view>
            </view>
            <view class="send-receive-logistics">
              <view class="waybill-status">待揽件</view>
              <KyImage :src="transportImage()" mode="aspectFit" />
              <view class="waybill-service">待揽件</view>
            </view>
            <view class="send-receive-info send-receive-info-right">
              <view class="send-receive-info__city">深圳市深圳市深圳市深圳市</view>
              <view class="send-receive-info__name">寄*左</view>
              <view class="send-receive-info__company">深圳市</view>
            </view>
          </view>
        </view>
      </view>
      <slot name="cardContent" v-if="$slots.cardContent"></slot>
      <view class="waybill-card-extra">
        <view class="waybill-card-extra-status">待揽件：<text class="black-color">客户已下单</text></view>
        <view class="waybill-card-extra-info">
          <view class="waybill-card-extra-info-left">货好时间：<text class="black-color">2024/07/16 21:14</text></view>
          <view class="waybill-card-extra-info-right">右边</view>
        </view>
        <view class="waybill-card-extra-label">标签：你知道吗这是一台超级超级厉害电竞电脑运单NO.1123</view>
      </view>
      <view class="waybill-card-restrict-tips limitation">
        <view class="waybill-card-restrict-tips-desc"
          >该地区受XXX限制，暂时无法取货。该文案为举例说明，详情根据后台字段展示。</view
        >
        <view class="waybill-card-restrict-tips-close"
          ><KyImage src="https://ic-img.ky-express.com/netc/20250118_34166203764_!!1737168727304_56_56.png"
        /></view>
      </view>
    </view>
    <slot name="cardBottom"></slot>
  </view>
</template>

<script setup lang="ts">
import KyImage from '@order-public-sub-public/components/base/ky-image/index.vue'
import './index.scss'

const handleCopyWaybillNumber = () => {
  console.log('复制')
  // Taro.setClipboardData
}

const transportImage = (waybillItem?: any) => {
  const routeStep = waybillItem?.newExteriorRouteInfo?.routeStep
  if (!routeStep) {
    return 'https://ic-img.ky-express.com/netc/20250116_78366203737_!!1737018176794_207_21.png'
  }
}
</script>
