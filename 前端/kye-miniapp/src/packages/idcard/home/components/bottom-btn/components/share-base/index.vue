<template>
  <view
    ref="warpRef"
    :class="[
      'IdcardBaseInfo-warp-share',
      isPopup ? 'popup' : '',
      currentWarpClassName,
      isShare ? 'share' : '',
      isTitleMultiline ? 'IdcardBaseInfo-warp-share__warp-multiline' : 'IdcardBaseInfo-warp-share__warp-singleline',
    ]"
    :style="'background-image: url(' + backgroundImg + ')'"
  >
    <view :class="['IdcardBaseInfo-header-wrap', currentClassName]">
      <view class="IdcardBaseInfo-header-content">
        <view ref="titleRef" id="titleNode" class="IdcardBaseInfo-header-title">
          <text class="IdcardBaseInfo-header-title-name">{{ employeeName || '--' }}</text>
          <!-- <text class="IdcardBaseInfo-header-title-name">这是一个名字</text> -->
          <text>/</text>
          <text>{{ situation || '--' }}</text>
        </view>
        <view class="IdcardBaseInfo-header-title-company">{{ companyName || '' }}</view>
        <view class="IdcardBaseInfo-content" v-if="!isMode2">
          <view class="IdcardBaseInfo-content-item">
            <image
              class="item-img"
              src="https://ic-img.ky-express.com/netc/20250205_2166301128_!!1738724662437_68_68.png"
            />
            <view class="IdcardBaseInfo-content-item-text renzhenContent">
              <text class="IdcardBaseInfo-content-item-text-normal">跨越速运认证</text>
              <text class="IdcardBaseInfo-content-item-text-highlight pipurText">
                {{ inOffice ? employeeStatusMap[inOffice] : '在职' }}
              </text>
              <text class="IdcardBaseInfo-content-item-text-highlight greenText">
                {{ !isRealname ? '未实名' : '已实名' }}
              </text>
            </view>
          </view>
          <view v-if="showEmail" class="IdcardBaseInfo-content-item">
            <image
              class="item-img"
              src="https://ic-img.ky-express.com/netc/20250205_2486630116_!!1738724662440_68_68.png"
            />
            <view class="IdcardBaseInfo-content-item-text IdcardBaseInfo-content-item-text-eamil">
              <text v-if="email" class="eamil-text">{{ email }}</text>
            </view>
          </view>

          <view v-if="showAddress" class="IdcardBaseInfo-content-item">
            <image
              class="item-img"
              src="https://ic-img.ky-express.com/netc/20250205_32266301119_!!1738724662439_68_68.png"
            />
            <view class="IdcardBaseInfo-content-item-text">
              <text class="text-ellipsis">66{{ address || '--' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view
        v-if="!computedModeThree"
        class="IdcardBaseInfo-header-headerImg"
        :class="{ 'IdcardBaseInfo-header-headerImg__mode1': isMode1 }"
      >
        <image v-if="avatar" class="IdcardBaseInfo-header-img" :src="avatar" />
      </view>
    </view>
    <!-- mode2 -->
    <template v-if="isMode2">
      <view class="IdcardBaseInfo-content-item IdcardBaseInfo-content-item_mode2">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_2166301128_!!1738724662437_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text renzhenContent">
          <text class="IdcardBaseInfo-content-item-text-normal">跨越速运认证</text>
          <text class="IdcardBaseInfo-content-item-text-highlight pipurText">
            {{ inOffice ? employeeStatusMap[inOffice] : '在职' }}
          </text>
          <text class="IdcardBaseInfo-content-item-text-highlight greenText">
            {{ !isRealname ? '未实名' : '已实名' }}
          </text>
        </view>
      </view>

      <view v-if="showEmail" class="IdcardBaseInfo-content-item IdcardBaseInfo-content-item_mode2">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_2486630116_!!1738724662440_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text IdcardBaseInfo-content-item-text-eamil">
          <text v-if="email" class="eamil-text">{{ email }}</text>
        </view>
      </view>

      <view v-if="showAddress" class="IdcardBaseInfo-content-item IdcardBaseInfo-content-item_mode2">
        <image
          class="item-img"
          src="https://ic-img.ky-express.com/netc/20250205_32266301119_!!1738724662439_68_68.png"
        />
        <view class="IdcardBaseInfo-content-item-text">
          <text class="text-ellipsis">111 {{ address || '--' }}</text>
        </view>
      </view>
    </template>

    <!-- 底部插槽 -->
    <view v-if="$slots.default" class="IdcardBaseInfo-footer">
      <slot />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
// 在职或者离职
const employeeStatusMap = {
  10: '在职',
  20: '离职',
}

// 背景图
const backgroundImgMap = {
  10: 'https://ic-img.ky-express.com/netc/20250903_9694_!!1756889008375_1116_860.png',
  20: 'https://ic-img.ky-express.com/netc/20250903_7524_!!1756889016115_1116_844.png',
  30: 'https://ic-img.ky-express.com/netc/20250903_7586_!!1756889019422_1116_840.png',
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
  isPopup: Boolean,
  isShare: Boolean,
})

const {
  employeeName,
  situation,
  address,
  showAddress,
  email,
  showEmail,
  avatar,
  isRealname,
  inOffice,
  companyName,
  themeBackground,
} = props.baseInfo

const mode = ref(themeBackground)

let backgroundImg = backgroundImgMap[themeBackground] || backgroundImgMap[10]
if (!backgroundImg) {
  backgroundImg = 'https://ic-img.ky-express.com/netc/20250205_60966301150_!!1738724662444_1404_856.png'
}

const isMode1 = computed(() => {
  return +mode.value === 10
})

const isMode2 = computed(() => {
  return +mode.value === 20
})

const computedModeThree = computed(() => {
  return +mode.value === 30
})

const currentClassName = computed(() => {
  switch (+mode.value) {
    case 10:
      return 'IdcardBaseInfo-header-wrap-mode1'
    case 20:
      return 'IdcardBaseInfo-header-wrap-mode2'
    case 30:
      return 'IdcardBaseInfo-header-wrap-mode3'
    default:
      return 'IdcardBaseInfo-header-wrap-mode1'
  }
})

const currentWarpClassName = computed(() => {
  switch (+mode.value) {
    case 10:
      return 'IdcardBaseInfo-header-wrap-mode1-content'
    case 20:
      return 'IdcardBaseInfo-header-wrap-mode2-content'
    case 30:
      return 'IdcardBaseInfo-header-wrap-mode3-content'
    default:
      return 'IdcardBaseInfo-header-wrap-mode1-content'
  }
})

const isTitleMultiline = ref(false)

function checkTitleLineBreak() {
  const query = Taro.createSelectorQuery()
  query
    .select('#titleNode')
    .boundingClientRect((rect) => {
      console.log('🚀 ~ checkTitleLineBreak ~ rect:', rect)
      if (rect) {
        // 假设行高是 24px（根据你样式设置来调整）
        const lineHeight = 46
        isTitleMultiline.value = rect.height > lineHeight
      }
    })
    .exec()
}

watch(
  () => props.baseInfo.themeBackground,
  (newVal) => {
    mode.value = newVal
  },
)

onMounted(() => {
  Taro.nextTick(() => {
    checkTitleLineBreak()
  })
})
</script>
