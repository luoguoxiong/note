<template>
  <view class="about-company">
    <view class="about-company-scroll">
      <scroll-view
        style="height: 100%"
        :scroll-y="true"
        :scroll-with-animation="true"
        :scroll-animation-duration="SCROLL_ANIMATION_DURATION"
        :scroll-top="scrollTop"
        @scroll="handleScroll"
      >
        <image
          class="about-company-bg"
          src="https://ic-img.ky-express.com/netc/20260416_7561_!!1776311281390_1500_1200.png"
          :style="{ height: bg01Height + 'px' }"
        ></image>

        <!-- 普通 tab：未吸顶时展示，吸顶后仅保留占位高度 -->
        <view class="ac-tab" :class="{ placeholder: shouldShowFixedTabView }" :style="{ height: tabHeight + 'px' }">
          <view
            v-for="(item, index) in tabs"
            :key="index"
            class="tab-item"
            :class="{ active: currentIndex === index }"
            @click="handleTabClick(index)"
          >
            {{ item }}
          </view>
        </view>

        <!-- 内容 -->
        <view v-for="section in contentSections" :id="section.id" :key="section.id" class="content-section">
          <image
            v-for="(block, blockIndex) in section.blocks"
            :key="`${section.id}-${blockIndex}`"
            class="content-block-image"
            :src="block.src"
            :style="{ height: block.height + 'px' }"
          ></image>
        </view>
      </scroll-view>
    </view>
    <!-- fixed tab 放在 scroll-view 外层，避免与 sticky tab 处于同一点击上下文 -->
    <view
      v-show="shouldShowFixedTabView"
      class="ac-tab fixed"
      :class="{ 'pc-width': isH5Pc }"
      :style="{ height: tabHeight + 'px' }"
    >
      <view
        v-for="(item, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: currentIndex === index }"
        @click="handleTabClick(index)"
      >
        {{ item }}
      </view>
    </view>
    <FooterBar
      :isLogin="footerBarState.isLogin"
      :isOlderCustomer="footerBarState.isOlderCustomer"
      :hasLeadCapture="footerBarState.hasLeadCapture"
      :hasLeadCaptureActivity="footerBarState.hasLeadCaptureActivity"
      :hasCompanyWx="footerBarState.hasCompanyWx"
      expressType="企业实力"
      backPage="about"
      @login="handleFooterLoginClick"
      @plan="handleFooterPlanClick"
      @contact="handleFooterContactClick"
      @add-qy-wechat="handleFooterBindCodeClick"
    ></FooterBar>
  </view>
</template>
<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useDidShow } from '@tarojs/taro'
import { isH5Pc } from '@/public/utils/device'
import './index.scss'
import { px2real } from '@/public/utils'
// import FooterBar from '@/public/components/business/footer-bar/index.vue'
import FooterBar from '@/modules/tools/components/footer-bar/index.vue'
import {
  reportAboutCompanyFooterButtonClick,
  reportAboutCompanyPageExposure,
  reportAboutCompanyTabClick,
} from './report'
import { useRoleFlags } from '@/layout/pages/home/hooks'
import { useLogin } from '@/public/hooks'

// ========= 登录状态 =========
const { isLogin } = useLogin()

const { isNew, hasLeadCapture, hasLeadCaptureActivity, hasBusinessQrcode } = useRoleFlags()

const bg01Height = px2real(600)

const tabHeight = px2real(88)

type ContentBlock = {
  src: string
}

type RenderBlock = ContentBlock & {
  height: number
}

type ContentSection = {
  id: string
  blocks: RenderBlock[]
}

const getImageRenderHeight = (src: string) => {
  const matchedSize = src.match(/_(\d+)_(\d+)\.(png|jpe?g|webp|gif|svg\+xml)(\?.*)?$/i)

  if (!matchedSize) {
    return px2real(0)
  }

  const designWidth = Number(matchedSize[1])
  const designHeight = Number(matchedSize[2])

  return px2real(designHeight, designWidth)
}

const contentSections: ContentSection[] = [
  {
    id: 'company-strength',
    blocks: [
      {
        src: 'https://ic-img.ky-express.com/netc/20260416_30669_!!1776313357362_1500_1384.png',
        height: getImageRenderHeight('https://ic-img.ky-express.com/netc/20260416_30669_!!1776313357362_1500_1384.png'),
      },
      {
        src: 'https://ic-img.ky-express.com/netc/20260416_18770_!!1776313423033_1500_1088.png',
        height: getImageRenderHeight('https://ic-img.ky-express.com/netc/20260416_18770_!!1776313423033_1500_1088.png'),
      },
      {
        src: 'https://ic-img.ky-express.com/netc/20260416_28794_!!1776313480430_1500_1184.png',
        height: getImageRenderHeight('https://ic-img.ky-express.com/netc/20260416_28794_!!1776313480430_1500_1184.png'),
      },
    ],
  },
  {
    id: 'main-products',
    blocks: [
      {
        src: 'https://ic-img.ky-express.com/netc/20260416_90014_!!1776320408157_1500_1366.png',
        height: getImageRenderHeight('https://ic-img.ky-express.com/netc/20260416_90014_!!1776320408157_1500_1366.png'),
      },
      {
        src: 'https://ic-img.ky-express.com/netc/20260416_58830_!!1776320646990_1500_1304.png',
        height: getImageRenderHeight('https://ic-img.ky-express.com/netc/20260416_58830_!!1776320646990_1500_1304.png'),
      },
    ],
  },
  {
    id: 'pro-pack',
    blocks: [
      {
        src: 'https://ic-img.ky-express.com/netc/20260416_87219_!!1776321166839_1500_1656.png',
        height: getImageRenderHeight('https://ic-img.ky-express.com/netc/20260416_87219_!!1776321166839_1500_1656.png'),
      },
    ],
  },
  {
    id: 'monitoring',
    blocks: [
      {
        src: 'https://ic-img.ky-express.com/netc/20260416_57073_!!1776321333233_1500_2800.png',
        height: getImageRenderHeight('https://ic-img.ky-express.com/netc/20260416_57073_!!1776321333233_1500_2800.png'),
      },
      {
        src: 'https://ic-img.ky-express.com/netc/20260416_36970_!!1776321421596_1500_1448.png',
        height: getImageRenderHeight('https://ic-img.ky-express.com/netc/20260416_36970_!!1776321421596_1500_1448.png'),
      },
    ],
  },
]

const contentHeight = contentSections.map((section) =>
  section.blocks.reduce((totalHeight, block) => totalHeight + block.height, 0),
)

const tabs = ['公司实力', '主营产品', '专业包装', '全网监控']

const scrollTop = ref(0)
let latestScrollTop = 0
let forceScrollTimer: ReturnType<typeof setTimeout> | null = null
let tabScrollLockTimer: ReturnType<typeof setTimeout> | null = null
let lockedTabIndex: number | null = null
let lockedTargetTop = 0

const SCROLL_ANIMATION_DURATION = 320

const forceScrollTo = (targetTop: number) => {
  // 先把绑定值改成当前真实滚动位置，打破"相同值不触发"
  scrollTop.value = latestScrollTop

  if (forceScrollTimer) {
    clearTimeout(forceScrollTimer)
  }

  // 不用 nextTick，给支付宝一个独立时机去识别这次变更
  forceScrollTimer = setTimeout(() => {
    scrollTop.value = targetTop
    forceScrollTimer = null
  }, 16)
}

const stopTabScrollLock = () => {
  if (tabScrollLockTimer) {
    clearTimeout(tabScrollLockTimer)
    tabScrollLockTimer = null
  }

  showFixed.value = shouldShowFixedTab(lockedTargetTop || latestScrollTop)
  isTabProgramScrolling.value = false
  lockedTabIndex = null
}

const startTabScrollLock = (index: number, targetTop: number) => {
  lockedTabIndex = index
  lockedTargetTop = targetTop

  if (tabScrollLockTimer) {
    clearTimeout(tabScrollLockTimer)
  }

  tabScrollLockTimer = setTimeout(() => {
    stopTabScrollLock()
  }, SCROLL_ANIMATION_DURATION + 120)
}

const footerBarState = computed(() => {
  return {
    isLogin: isLogin.value,
    isOlderCustomer: !isNew.value,
    hasLeadCapture: hasLeadCapture.value,
    hasLeadCaptureActivity: hasLeadCaptureActivity.value,
    hasCompanyWx: hasBusinessQrcode.value,
  }
})

const showFixed = ref(false)
const isTabProgramScrolling = ref(false)
const currentIndex = ref(0)
const shouldShowFixedTabView = computed(() => showFixed.value || isTabProgramScrolling.value)

const getSectionOffsets = () => {
  const offsets: number[] = []

  // 存的是 scrollTop 目标值，不是内容区的真实 top。
  // 当 scrollTop = bg01Height 时，首个内容区会刚好出现在 tab 下方。
  let start = bg01Height

  for (let i = 0; i < contentHeight.length; i++) {
    offsets.push(start)
    start += contentHeight[i]
  }

  return offsets
}

const offsets = getSectionOffsets()
const ACTIVE_SWITCH_TOLERANCE = 2
const FIXED_TAB_SWITCH_TOLERANCE = 1

const shouldShowFixedTab = (scrollTopValue: number) => {
  // 给吸顶切换留 1px 容差，避免卡在临界值时 fixed tab 闪动或慢一拍出现。
  return scrollTopValue + FIXED_TAB_SWITCH_TOLERANCE >= bg01Height
}

const getActiveIndexByScrollTop = (scrollTopValue: number) => {
  const normalizedScrollTop = Math.round(scrollTopValue) + ACTIVE_SWITCH_TOLERANCE

  for (let i = offsets.length - 1; i >= 0; i--) {
    if (normalizedScrollTop >= Math.round(offsets[i])) {
      return i
    }
  }

  return 0
}

const handleTabClick = (index: number) => {
  if (isTabProgramScrolling.value) {
    return
  }

  const targetTop = offsets[index]
  currentIndex.value = index
  isTabProgramScrolling.value = true
  showFixed.value = shouldShowFixedTab(targetTop)
  startTabScrollLock(index, targetTop)

  if (Math.round(latestScrollTop) !== Math.round(targetTop)) {
    if (Math.round(scrollTop.value) === Math.round(targetTop)) {
      forceScrollTo(targetTop)
    } else {
      scrollTop.value = targetTop
    }
  }

  reportAboutCompanyTabClick(tabs[index])
}

// 滚动监听
const handleScroll = (e) => {
  const nextScrollTop = Number(e?.detail?.scrollTop || 0)

  latestScrollTop = nextScrollTop
  showFixed.value = shouldShowFixedTab(nextScrollTop)

  if (lockedTabIndex !== null) {
    currentIndex.value = lockedTabIndex

    if (Math.abs(nextScrollTop - lockedTargetTop) <= ACTIVE_SWITCH_TOLERANCE) {
      stopTabScrollLock()
    }

    return
  }

  currentIndex.value = getActiveIndexByScrollTop(nextScrollTop)
}

const handleFooterLoginClick = () => {
  reportAboutCompanyFooterButtonClick('登录/注册')
}

const handleFooterPlanClick = () => {
  reportAboutCompanyFooterButtonClick('获取专属服务方案')
}

const handleFooterContactClick = () => {
  reportAboutCompanyFooterButtonClick('联系商务')
}

const handleFooterBindCodeClick = () => {
  reportAboutCompanyFooterButtonClick('添加企微')
}

useDidShow(() => {
  reportAboutCompanyPageExposure()
})

onMounted(() => {
  reportAboutCompanyTabClick(tabs[currentIndex.value])
})

onUnmounted(() => {
  if (forceScrollTimer) {
    clearTimeout(forceScrollTimer)
  }

  if (tabScrollLockTimer) {
    clearTimeout(tabScrollLockTimer)
  }
})
</script>
