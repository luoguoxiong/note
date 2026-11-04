<template>
  <view class="third-popup" :animation="animationData" :style="maskStyle">
    <view className="third-popup__warpper">
      <view class="third-popup__content">
        <view class="third-popup__title">{{ advertisementPopupDto?.title }}</view>
        <scroll-view scroll-y="true" class="third-popup__text">
          <view class="third-popup__text-inner">
            <rich-text :nodes="formHtml" />
          </view>
        </scroll-view>
        <view class="third-popup__footer">
          <view v-if="advertisementPopupDto?.buttonNumber === 2" class="third-popup__footer--corfim">
            <view @click="onClickBtn(advertisementPopupDto?.buttonList[0])">{{
              advertisementPopupDto?.buttonList ? advertisementPopupDto?.buttonList[0].buttonText : ''
            }}</view>
            <view @click="onClickBtn(advertisementPopupDto?.buttonList[1])">{{
              advertisementPopupDto?.buttonList ? advertisementPopupDto?.buttonList[1].buttonText : ''
            }}</view>
          </view>
          <view v-else class="third-popup__footer--alert" @click="onClickBtn(advertisementPopupDto?.buttonList[0])">
            {{ advertisementPopupDto?.buttonList ? advertisementPopupDto?.buttonList[0].buttonText : '' }}
          </view>
        </view>
      </view>
      <view className="third-popup__monkey">
        <image src="https://ic-img.ky-express.com/netc/20261020_5786_!!1792467920844_1180_336.png"></image>
      </view>
      <view v-if="advertisementPopupDto?.noLongerRemind === 1" class="third-popup__tip" @click="onSelected">
        <image :src="selectIcon"></image>
        <text>{{ remindTips }}</text>
      </view>
      <view v-if="advertisementPopupDto?.configCloseButton === '1'" class="third-popup__close" @click="onCancel">
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

const IMG_BASE_URL = 'https://ic-h5.kye-erp.com/intro/miniprogram'

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
  formatHtml(formatHtml(advertisementPopupDto.value?.content || advertisementPopupDto.value?.popupDetail || '')),
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
.third-popup {
  touch-action: none;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10001;
  .third-popup__monkey {
    position: absolute;
    top: -58px;
    left: 0;
    image {
      width: 590px;
      height: 168px;
    }
  }
  .third-popup__warpper {
    position: absolute;
    top: calc(50% + 64rpx);
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .third-popup__content {
    width: 590px;
    background: #ffffff;
    border-radius: 24px;
  }
  .third-popup__title {
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    color: #03050d;
    padding-top: 120px;
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
  .third-popup__text {
    width: 510px;
    max-height: calc(100vh * 0.7 - 36vh);
    min-height: 200px;
    // height: 200px;
    overflow-y: auto;
    font-size: 32px;
    text-align: justify;
    color: #6e6d72;
    line-height: 48px;
    margin: 0 auto;
  }
  .third-popup__text-inner {
    padding-right: 24px;
  }
  .third-popup__footer {
    margin-top: 30px;
    padding-bottom: 32px;
    .third-popup__footer--corfim {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100px;
      view {
        font-size: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
      view:first-child {
        height: calc(88px - 2px);
        width: calc(240px - 2px);
        border: 1px solid #8365f6;
        border-radius: 12px;
        color: #8365f6;
        margin-left: 40px;
      }
      view:last-child {
        width: 240px;
        height: 88px;
        background: rgba(131, 101, 246, 1);
        border-radius: 12px;
        color: #fff;
        margin-right: 40px;
      }
    }
    .third-popup__footer--alert {
      height: 88px;
      width: 510px;
      background: rgba(131, 101, 246, 1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      color: #fff;
      margin: 0 auto;
    }
  }
  .third-popup__close {
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
  .third-popup__tip {
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
