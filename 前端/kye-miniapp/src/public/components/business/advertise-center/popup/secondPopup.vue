<template>
  <view class="second-popup" :animation="animationData" :style="maskStyle">
    <view class="second-popup__warpper">
      <view class="second-popup__content">
        <view class="second-popup__header">
          <image :src="advertisementPopupDto?.posterLink"></image>
        </view>
        <view class="second-popup__box">
          <view class="second-popup__title">{{ advertisementPopupDto?.title }}</view>
          <scroll-view scroll-y="true" class="second-popup__text">
            <view class="second-popup__text-inner">
              <rich-text :nodes="formHtml" />
            </view>
          </scroll-view>
        </view>
        <view class="second-popup__footer">
          <view v-if="advertisementPopupDto?.buttonNumber === 2" class="second-popup__footer--corfim">
            <view @click="onClickBtn(advertisementPopupDto?.buttonList[0])">{{
              advertisementPopupDto?.buttonList ? advertisementPopupDto?.buttonList[0].buttonText : ''
            }}</view>
            <view @click="onClickBtn(advertisementPopupDto?.buttonList[1])">{{
              advertisementPopupDto?.buttonList ? advertisementPopupDto?.buttonList[1].buttonText : ''
            }}</view>
          </view>
          <view v-else class="second-popup__footer--alert" @click="onClickBtn(advertisementPopupDto?.buttonList[0])">
            {{ advertisementPopupDto?.buttonList ? advertisementPopupDto?.buttonList[0].buttonText : '' }}
          </view>
        </view>
      </view>
      <view v-if="advertisementPopupDto?.noLongerRemind === 1" class="second-popup__tip" @click="onSelected">
        <image :src="selectIcon"></image>
        <text>{{ remindTips }}</text>
      </view>
      <view v-if="advertisementPopupDto?.configCloseButton === '1'" class="second-popup__close" @click="onCancel">
        <image src="https://ic-img.ky-express.com/netc/20250714_634_!!1752464249143_148_144.png"></image>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IdetailList } from '../type'
import { formatHtml } from '../utils'
import { report_CLK_event, report_wrapper } from '@/public/utils'

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

const formHtml = computed(() =>
  formatHtml(advertisementPopupDto.value?.content || advertisementPopupDto.value?.popupDetail || ''),
)

const selectIcon = computed(() => {
  return props.selected
    ? 'https://ic-img.ky-express.com/netc/20250724_59233_!!1753325327813_64_64.png'
    : 'https://ic-img.ky-express.com/netc/20250724_79888_!!1753325199373_64_64.png'
})

const onClickBtn = (value) => {
  emits('onClickBtn', value)
  report_CLK_event('clk_homepage_top_popup_v1', {
    advertising_code: props.popupInfo?.advertisementCode,
    button: value?.buttonText,
    region_code: 'top_popup',
    page_code: props.qtPageCode,
  })
}
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
.second-popup {
  touch-action: none;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10001;
  .second-popup__warpper {
    padding-top: 10vh;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .second-popup__content {
    width: 590px;
    background: #ffffff;
    // border-radius: 20px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    padding-bottom: 32px;
    position: relative;
  }
  .second-popup__header {
    position: absolute;
    // top: -44px;
    bottom: 99%;
    left: 0;
    width: 100%;
    image {
      display: block;
      width: 100%;
      height: 176px;
    }
  }
  .second-popup__box {
    width: 530px;
    margin: 0 auto;
    padding-top: 25px;
    // padding-top: 132px + 25px;
  }
  .second-popup__title {
    font-weight: bold;
    color: #333333;
    font-size: 36px;
    text-align: center;
    width: 510px;
    margin: 0 auto;
    line-height: 50px;
    max-height: 95px;
    overflow: hidden;
    margin-bottom: 20px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }
  .second-popup__text {
    margin-top: 12px;
    font-size: 32px;
    text-align: justify;
    color: #6e6d72;
    line-height: 48px;
    // height: 232px;
    max-height: calc(100vh * 0.7 - 35vh);
    min-height: 232px;
    overflow-y: auto;
  }
  .second-popup__text-inner {
    padding-right: 24px;
  }
  .second-popup__footer {
    margin-top: 30px;
    .second-popup__footer--corfim {
      margin-left: 40px;
      margin-right: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100px;
      view {
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
      }
      view:first-child {
        width: calc(240px - 2px);
        height: calc(80px - 2px);
        border: 1px solid #8365f6;
        color: #8365f6;
      }
      view:last-child {
        width: 240px;
        height: 80px;
        color: #ffffff;
        background: linear-gradient(138deg, #ac97ff 3%, #8365f6 98%);
      }
    }
    .second-popup__footer--alert {
      width: 510px;
      height: 88px;
      background: linear-gradient(138deg, #ac97ff 3%, #8365f6 98%);
      border-radius: 12px;
      font-size: 36px;
      font-weight: bold;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }
  }
  .second-popup__close {
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
  .second-popup__tip {
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
