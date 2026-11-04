<template>
  <view
    class="IdcardBaseInfo-warp-share"
    :class="[isPopup ? 'popup' : '', currentWarpClassName, isShare ? 'share' : '']"
    :style="`background-image: url(${backgroundImg})`"
  >
    <view class="IdcardBaseInfo-warp-header" :class="currentClassName">
      <view class="IdcardBaseInfo-warp-header-left">
        <template v-if="computedModeThree">
          <view class="IdcardBaseInfo-header-title IdcardBaseInfo-header-title-mode3">
            <text class="IdcardBaseInfo-header-title-name"> {{ baseInfo.employeeName || '--' }}</text>
            <text>{{ baseInfo.situation || '--' }}</text>
          </view>
        </template>
        <template v-else>
          <view class="IdcardBaseInfo-header-title">
            <text class="IdcardBaseInfo-header-title-name">{{ baseInfo.employeeName || '--' }}</text>
            <text>/</text>
            <text>{{ baseInfo.situation || '--' }}</text>
          </view>
        </template>
        <view class="IdcardBaseInfo-header-title-company">{{ baseInfo.companyName || '' }}</view>
      </view>

      <view v-if="!computedModeThree" class="IdcardBaseInfo-header-headerImg">
        <image v-if="baseInfo.avatar" class="IdcardBaseInfo-header-img" :src="baseInfo.avatar" />
      </view>
    </view>

    <view v-if="computedModeThree" class="IdcardBaseInfo-line"></view>

    <view class="IdcardBaseInfo-content">
      <!-- 认证信息 -->
      <view class="IdcardBaseInfo-content-item">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_2166301128_!!1738724662437_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text renzhenContent">
          <text class="IdcardBaseInfo-content-item-text-normal">跨越速运认证</text>
          <text class="IdcardBaseInfo-content-item-text-highlight pipurText">
            {{ baseInfo.inOffice ? employeeStatusMap[baseInfo.inOffice] : '在职' }}
          </text>
          <text class="IdcardBaseInfo-content-item-text-highlight greenText">
            {{ !baseInfo.isRealname ? '未实名' : '已实名' }}
          </text>
        </view>
      </view>

      <!-- 邮箱信息 -->
      <view v-if="baseInfo.showEmail" class="IdcardBaseInfo-content-item">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_2486630116_!!1738724662440_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text IdcardBaseInfo-content-item-text-eamil">
          <text v-if="baseInfo.email" class="eamil-text">{{ baseInfo.email }}</text>
        </view>
      </view>

      <!-- 地址信息 -->
      <view v-if="baseInfo.showAddress" class="IdcardBaseInfo-content-item start-align">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_32266301119_!!1738724662439_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text text-ellipsis">
          <view class="text-ellipsis">{{ baseInfo.address || '--' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// eslint-disable-next-line
import { computed, watch, ref } from 'vue'
import './index.scss'

// 在职或者离职
const employeeStatusMap = {
  10: '在职',
  20: '离职',
}

// 背景图
const backgroundImgMap = {
  10: 'https://ic-img.ky-express.com/netc/20250917_80372_!!1758111628956_1116_840.png',
  20: 'https://ic-img.ky-express.com/netc/20250917_52084_!!1758111633245_1116_840.png',
  30: 'https://ic-img.ky-express.com/netc/20250917_90588_!!1758111636811_1116_840.png',
}

// props 定义
const props = defineProps({
  baseInfo: {
    type: Object,
    default: () => ({
      employeeName: '',
      situation: '',
      address: '',
      showAddress: true,
      email: '',
      showEmail: true,
      avatar: '',
      isRealname: false,
      inOffice: true,
      companyName: '',
      themeBackground: 10,
    }),
  },
  isPopup: {
    type: Boolean,
    default: false,
  },
  isShare: {
    type: Boolean,
    default: false,
  },
})

// 背景模式
const mode = ref(props.baseInfo.themeBackground)

watch(
  () => props.baseInfo.themeBackground,
  (val) => {
    mode.value = val
  },
)

// 背景图
const backgroundImg = computed(() => {
  return (
    backgroundImgMap[props.baseInfo.themeBackground] ||
    backgroundImgMap[10] ||
    'https://ic-img.ky-express.com/netc/20250205_60966301150_!!1738724662444_1404_856.png'
  )
})

// 是否模式三
const computedModeThree = computed(() => {
  return mode.value === 30 || mode.value === '30'
})

// 顶部类名
const currentClassName = computed(() => {
  switch (mode.value) {
    case 10:
    case '10':
      return 'IdcardBaseInfo-header-wrap-mode1'
    case 20:
    case '20':
      return 'IdcardBaseInfo-header-wrap-mode2'
    case 30:
    case '30':
      return 'IdcardBaseInfo-header-wrap-mode3'
    default:
      return 'IdcardBaseInfo-header-wrap-mode1'
  }
})

// 内容区类名
const currentWarpClassName = computed(() => {
  switch (mode.value) {
    case 10:
    case '10':
      return 'IdcardBaseInfo-header-wrap-mode1-content'
    case 20:
    case '20':
      return 'IdcardBaseInfo-header-wrap-mode2-content'
    case 30:
    case '30':
      return 'IdcardBaseInfo-header-wrap-mode3-content'
    default:
      return 'IdcardBaseInfo-header-wrap-mode1-content'
  }
})
</script>
