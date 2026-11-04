<template>
  <view class="lottery-dialog-box">
    <image class="icon-close" :src="icon_close" @tap="onLotteryDialogClose(false)" />
    <view class="lottery" :style="{ backgroundImage: `url(${aniUrl})` }"></view>
    <view v-if="drawStatus" class="lottery-result">
      <view class="result-box">
        <view class="top">
          <image class="title-img" mode="heightFix" :src="topImg" />
        </view>
        <view class="middle">
          <prize-list v-if="prizeList.length" :prize-list="prizeList" />
          <view v-else class="not-wining-prize-box">
            <image class="lucky-flower" :src="lucky_flower" />
            <view class="lucky-text">
              <view>好运迷了路，下次一定属于你！</view>
            </view>
          </view>
        </view>
        <view class="bottom">
          <image mode="heightFix" :src="bottomImg" @tap="onLotteryDialogClose(+drawStatus === 10 ? true : false)" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PrizeList from '../prize-list/index.vue'
import { DIALOG_RESULT__IMG, icon_close, lucky_flower } from '../../config'

defineOptions({
  name: 'LotteryDialog',
})

const props = defineProps<{
  prizeList: any[]
  onLotteryDialogClose: (status: boolean) => void
  drawStatus: number
  aniUrl: string
}>()

const dialogImages = computed(() => DIALOG_RESULT__IMG[props.drawStatus] || {})
const topImg = computed(() => dialogImages.value.topImg)
const bottomImg = computed(() => dialogImages.value.bottomImg)
</script>

<style lang="scss">
@import './index.scss';
</style>
