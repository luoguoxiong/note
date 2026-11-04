<template>
  <div class="win-swiper-box">
    <swiper
      :init-page="0"
      :autoplay="true"
      :interval="3000"
      :circular="true"
      v-if="adList.length > 0"
      :current="activeIndex"
      class="advertisement"
      @change="handleSwiperChange"
    >
      <swiper-item :key="index" v-for="(adDetail, index) in adList">
        <image class="w-full img-ad" :src="adDetail?.posterLink" @tap="openAdvertisement(adDetail, index)" />
      </swiper-item>
    </swiper>
    <view class="banner-dots" :style="{ bottom: '12rpx' }">
      <!--
        @click="changeSwiper(index)"
       -->
      <view
        v-for="(_, index) in adList"
        :key="index"
        :class="{
          dots: true,
          'dots-active': activeIndex === index,
        }"
      ></view>
    </view>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { openAdvertisement } from './index'
// import { Swipe, SwipeItem } from 'vant'
import { Banner } from '@order-public-sub-public/apis/waybill/types'
defineProps<{ adList: Banner[] }>()

const activeIndex = ref(0)

/** swiper 切换 */
const handleSwiperChange = (res) => {
  activeIndex.value = res.detail?.current
}

/** 下方圆点点击 */
// const changeSwiper = (index: number) => {
//   activeIndex.value = index
// }
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
