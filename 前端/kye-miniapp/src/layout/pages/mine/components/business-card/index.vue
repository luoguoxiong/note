<template>
  <view class="business-card">
    <ky-lazy-image
      :delay="1000"
      class="bg-icon"
      src="https://ic-img.ky-express.com/netc/20260528_9178_!!1779939359165_578_264.png"
      alt=""
    />
    <view class="business-card-info">
      <image
        class="avatar"
        src="https://ic-img.ky-express.com/netc/20260528_71998_!!1779936561756_128_128.png"
        alt=""
      />
      <view class="info-content">
        <view class="name">{{ businessName }}</view>
        <view class="text">您的专属商务</view>
      </view>
    </view>
    <view class="business-card-btns">
      <view class="btn" @click="openBusinessPopup('phone')">
        <view class="text">拨打电话</view>
        <image class="icon" src="https://ic-img.ky-express.com/netc/20260528_65650_!!1779936884082_48_48.png" alt="" />
      </view>
      <view class="line" v-if="hasBusinessQrcode"></view>
      <view class="btn" @click="openBusinessPopup('qrcode')" v-if="hasBusinessQrcode">
        <view class="text">添加企微</view>
        <image class="icon" src="https://ic-img.ky-express.com/netc/20260528_64245_!!1779936884079_48_48.png" alt="" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useRoleFlags } from '@/layout/pages/home/hooks'
import './index.scss'

const emits = defineEmits(['show-contact-business'])

const { businessName, hasBusinessQrcode } = useRoleFlags()

const openBusinessPopup = (type: string) => {
  emits('show-contact-business', type)
}
</script>
