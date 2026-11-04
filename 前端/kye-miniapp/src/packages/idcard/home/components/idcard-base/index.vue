<template>
  <view
    :class="`IdcardBaseInfo-warp ${isPopup ? 'popup' : ''} ${currentWarpClassName}`"
    :style="'background-image: url(' + backgroundImg + ')'"
  >
    <view :class="`IdcardBaseInfo-header-wrap  ${currentClassName}`">
      <view class="IdcardBaseInfo-header-content">
        <view class="IdcardBaseInfo-header-title">
          <text class="IdcardBaseInfo-header-title-name">
            {{ baseInfo?.employeeName || '--' }}
          </text>
          <text>/</text>
          <text>{{ baseInfo?.situation || '--' }}</text>
        </view>
        <view class="IdcardBaseInfo-header-title-company">{{ baseInfo?.companyName || '' }}</view>
      </view>

      <template v-if="!computedModeThree">
        <view class="IdcardBaseInfo-header-headerImg">
          <image v-if="baseInfo?.avatar" class="IdcardBaseInfo-header-img" :src="baseInfo?.avatar" />
        </view>
      </template>
    </view>

    <!-- 在无头像时才会展示 -->
    <view v-if="computedModeThree" class="IdcardBaseInfo-line"></view>

    <view class="IdcardBaseInfo-content">
      <view v-if="baseInfo?.showEmail" class="IdcardBaseInfo-content-item">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_2486630116_!!1738724662440_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text IdcardBaseInfo-content-item-text-eamil">
          <text v-if="baseInfo?.email" class="eamil-text">{{ baseInfo?.email || '' }}</text>
        </view>
      </view>

      <view v-if="baseInfo?.showAddress" class="IdcardBaseInfo-content-item">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_32266301119_!!1738724662439_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text">
          <text class="text-ellipsis">{{ baseInfo?.address || '--' }}</text>
        </view>
      </view>

      <view class="IdcardBaseInfo-content-item">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_2166301128_!!1738724662437_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text renzhenContent">
          <text>跨越速运认证</text>
          <!-- 内部销售默认是在职与已实名 -->
          <text class="IdcardBaseInfo-content-item-text-highlight pipurText">
            {{ baseInfo?.inOffice ? employeeStatusMap[baseInfo?.inOffice] : '在职' }}
          </text>
          <text class="IdcardBaseInfo-content-item-text-highlight greenText">
            {{ !baseInfo?.isRealname ? '未实名' : '已实名' }}
          </text>
        </view>
      </view>
    </view>

    <!-- 底部插槽 -->
    <view v-if="$slots.default" class="IdcardBaseInfo-footer">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'

// 在职或者离职
const employeeStatusMap = {
  10: '在职',
  20: '离职',
}

// 背景图
const backgroundImgMap = {
  10: 'https://ic-img.ky-express.com/netc/20250205_60966301150_!!1738724662444_1404_856.png',
  20: 'https://ic-img.ky-express.com/netc/20250205_91966301137_!!1738724662443_1404_856.png',
  30: 'https://ic-img.ky-express.com/netc/20250205_78666301115_!!1738724662442_1404_856.png',
}

// 默认头像
const personDefaultImgMap = {
  man: 'https://ic-img.ky-express.com/netc/20250205_45866301116_!!1738724662445_304_344.png',
  woman: 'https://ic-img.ky-express.com/netc/20250205_59266301154_!!1738724662447_304_344.png',
}

// 10-销售经理 20-销售总监 30-高级总监 40-销售总经理 50-市场专家
const positionMap = {
  10: '销售经理',
  20: '销售总监',
  30: '高级总监',
  40: '销售总经理',
  50: '市场专家',
}

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
})

const themeBackgroundTemp = computed(() => props.baseInfo?.themeBackground)
const mode = ref(themeBackgroundTemp.value)

const backgroundImg = computed(() => {
  let backgroundImgTemp = backgroundImgMap[themeBackgroundTemp.value] || backgroundImgMap[10]

  if (!backgroundImgTemp) {
    backgroundImgTemp = 'https://ic-img.ky-express.com/netc/20250205_60966301150_!!1738724662444_1404_856.png'
  }

  return backgroundImgTemp
})

const computedModeThree = computed(() => {
  return mode.value === 30 || mode.value === '30'
})

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

watchEffect(() => {
  mode.value = themeBackgroundTemp.value
})
</script>

<style lang="scss">
@import './index.scss';
</style>
