<template>
  <view :class="['wining-prize-box', `wining-prize-box-${prizeCount}`]">
    <view v-for="(prize, index) in prizeList" :key="index" class="prize-item">
      <image
        v-if="prize.type === 10 && prize.reliefForm"
        class="copon-tag"
        :src="getCouponTagSrc(prize.reliefForm)"
      />
      <image class="prize-icon" :src="prizeSrc(prize)" />
      <view class="prize-name">{{ prize.prizeName }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { coupon_img, getCouponTagSrc } from '../../config'

defineOptions({
  name: 'PrizeList',
})

const props = defineProps<{
  prizeList: any[]
}>()

const prizeCount = computed(() => props.prizeList.length)

const prizeSrc = (prize: any) => {
  return prize.type === 10 ? coupon_img : prize.prizeImg
}
</script>

<style lang="scss">
@import './index.scss';
</style>

