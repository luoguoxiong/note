<template>
  <view class="first-popup" :style="maskStyle" :animation="animationData">
    <view class="first-popup__wrapper">
      <view class="first-popup__content">
        <view class="click-content" @click="onClickBtn"></view>
        <image :src="advertisementPopupDto?.posterLink"></image>
      </view>
      <view v-if="advertisementPopupDto?.noLongerRemind === 1" class="first-popup__tip" @click="onSelected">
        <image :src="selectIcon"></image>
        <text>{{ remindTips }}</text>
      </view>
      <view
        v-if="advertisementPopupDto?.configCloseButton === '1'"
        class="first-popup__close"
        @click="
          report_wrapper(onCancel, [
            'clk_homepage_top_popup_v1',
            'CLK',
            {
              page_code: qtPageCode,
              region_code: 'top_popup',
              advertising_code: popupInfo?.advertisementCode,
              button: '关闭',
            },
          ])()
        "
      >
        <image src="https://ic-img.ky-express.com/netc/20250714_634_!!1752464249143_148_144.png"></image>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { IdetailList } from '../type'
import { report_wrapper } from '@/public/utils'

const props = defineProps<{
  maskStyle: Object
  animationData: Object
  popupInfo?: IdetailList
  selected: Boolean
  qtPageCode?: string
}>()

const emits = defineEmits(['onClickBtn', 'onSelected', 'onCancel'])

const advertisementPopupDto = computed(() => {
  return props.popupInfo?.advertisementPopupDto
})

const selectIcon = computed(() => {
  return props.selected
    ? 'https://ic-img.ky-express.com/netc/20250724_59233_!!1753325327813_64_64.png'
    : 'https://ic-img.ky-express.com/netc/20250724_79888_!!1753325199373_64_64.png'
})

const onClickBtn = report_wrapper(() => {
  emits('onClickBtn', advertisementPopupDto?.value?.buttonList[0])
}, [
  'clk_homepage_top_popup_v1',
  'CLK',
  {
    page_code: props.qtPageCode,
    advertising_code: props.popupInfo?.advertisementCode,
    button: advertisementPopupDto.value?.buttonList?.[0]?.buttonText || '按钮1',
    region_code: 'top_popup',
  },
])

const remindTips = computed(() => {
  const days = advertisementPopupDto.value?.noLongerRemindDays
  return (days ? days + '天' : '') + '不再提醒'
})

const onSelected = report_wrapper(() => {
  emits('onSelected')
}, [
  'clk_homepage_top_popup_v1',
  'CLK',
  {
    page_code: props.qtPageCode,
    advertising_code: props.popupInfo?.advertisementCode,
    region_code: 'top_popup',
    button: remindTips.value,
  },
])

const onCancel = report_wrapper(() => {
  emits('onCancel')
}, [
  'clk_homepage_top_popup_v1',
  'CLK',
  {
    page_code: props.qtPageCode,
    advertising_code: props.popupInfo?.advertisementCode,
    region_code: 'top_popup',
    button: '关闭',
  },
])
</script>

<style lang="scss">
.first-popup {
  touch-action: none;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10001;
  .first-popup__wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .first-popup__content {
    position: relative;
    .click-content {
      width: 590px;
      height: 378px;
      position: absolute;
      left: 0;
      bottom: 0;
      background: transparent;
      z-index: 99;
    }
    image {
      display: block;
      width: 590px;
      height: 755px;
    }
  }
  .first-popup__close {
    width: 60px;
    height: 60px;
    margin: 0 auto;
    margin-top: 40px;
    image {
      width: 60px;
      height: 60px;
      display: block;
      margin: 0 auto;
    }
  }
  .first-popup__tip {
    margin-top: 32px;
    font-size: 28px;
    color: #fff;
    text-align: center;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    image {
      width: 32px;
      height: 32px;
      display: inline-block;
      vertical-align: bottom;
      margin-right: 8px;
    }
  }
}
</style>
