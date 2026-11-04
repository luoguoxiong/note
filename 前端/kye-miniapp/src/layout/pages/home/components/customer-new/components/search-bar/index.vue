<template>
  <view
    class="new-user-search-content"
    v-if="!hideSearchBar"
    :class="{
      isPcSearchBar: isPcFSEnv,
    }"
    :style="{ height: searchBarStyle.height + 'px', background: `rgba(255, 255, 255, ${opacityRef})` }"
  >
    <view
      v-if="isLogin"
      class="new-user-search"
      v-exposure
      :exposure-report="{
        eventCode: 'exp_homepage_search_v1',
        otherParams: {
          page_code: 'page_homepage_v1',
          region_code: 'top_search',
          event_name: '移动端首页_顶部搜索栏菜单_曝光',
          region_name: '搜索栏',
        },
      }"
      id="new-user-exp"
      :style="{
        top: searchBarStyle.top + 'px',
        left: searchBarStyle.left + 'px',
        right: searchBarStyle.right + 'px',
        borderColor: getBorder(opacityRef),
        background: getBackground(opacityRef),
        color: getColor(opacityRef),
      }"
      @click="toSearchPage"
    >
      <image class="new-user-icon" :src="searchInon(opacityRef)"></image>

      <text> {{ isAliMiniApp ? '查询运单信息' : '查询运单信息/应用信息' }} </text>
    </view>
    <view
      class="new-user-logo"
      :style="{
        top: searchBarStyle.top + 'px',
        left: searchBarStyle.left + 'px',
        right: searchBarStyle.right + 'px',
      }"
      v-else
    >
      <image
        v-if="opacityRef >= 0.7"
        :delay="1000"
        src="https://ic-img.ky-express.com/netc/20260408_61459_!!1775634784571_179_43.png"
      ></image>
    </view>
  </view>
</template>
<script lang="ts" setup>
import './index.scss'
import { ref, onMounted, computed } from 'vue'
import {
  isAliMiniApp,
  isAmapMiniApp,
  isH5Env,
  isH5FSEnv,
  isPcFSEnv,
  isWechatNotAppEnv,
  isWxAppEnv,
  px2real,
} from '@/public/utils'
import { getSystemInfo } from '@/public/utils/getSystemInfo'
import { useLogin } from '@/public/hooks'

import { useExposureReport } from '@/public/hooks/useExposureReport'
import kyeNavigate from '@/public/utils/native/navigate'
import { reportSerchClick } from '@/layout/pages/home/report'

useExposureReport(['new-user-exp'])

const { isLogin } = useLogin()

const searchBarStyle = ref({})

const opacityRef = ref(0)

const hideSearchBar = computed(() => !isLogin.value && isH5FSEnv)

function lerpRGBA(progress, start, end) {
  const r = Math.round(start[0] + (end[0] - start[0]) * progress)
  const g = Math.round(start[1] + (end[1] - start[1]) * progress)
  const b = Math.round(start[2] + (end[2] - start[2]) * progress)
  const a = +(start[3] + (end[3] - start[3]) * progress).toFixed(2)

  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const getColor = (progress) => {
  if (progress < 0.5) {
    const start = [255, 255, 255, 0.5]
    const end = [140, 143, 153, 1]
    const color = lerpRGBA(progress, start, end)
    return `${color}`
  } else {
    return `rgba(140, 143, 153, 1)`
  }
}

function getBackground(progress) {
  if (progress < 0.5) {
    const start = [0, 0, 0, 0.1]
    const end = [255, 255, 255, 0.5]
    const color = lerpRGBA(progress, start, end)
    return `${color}`
  } else {
    const start = [255, 255, 255, 0.5]
    const end = [247, 248, 250, 1]
    console.log(progress)
    const color = lerpRGBA(progress, start, end)
    return `${color}`
  }
}

function getBorder(progress) {
  const start = [255, 255, 255, 0.16]
  const end = [230, 232, 237, 1]

  const color = lerpRGBA(progress > 0.5 ? 1 : progress, start, end)
  return `${color}`
}

const getSearchBarLayout = async () => {
  const { menuButtonInfo, windowWidth, statusBarHeight } = await getSystemInfo()

  const basePadding = px2real(32)

  // 默认样式（兜底）
  let style = {
    left: basePadding,
    top: px2real(12),
    right: basePadding,
    height: px2real(88),
  }

  const searchBarheight = px2real(64)

  const searchBarIsHeigher = searchBarheight > menuButtonInfo.height

  const capsuleCenterY = menuButtonInfo.height / 2 + menuButtonInfo.top // 胶囊中心

  const top = capsuleCenterY - searchBarheight / 2 // 搜索框距离头部位置

  const height = searchBarIsHeigher
    ? top + searchBarheight + px2real(12)
    : menuButtonInfo.top + menuButtonInfo.height + px2real(12) //搜索栏高度

  // 阿里小程序
  if (isAliMiniApp) {
    const res = my.getLeftButtonsBoundingClientRect()

    const { left, width } = res.backButtonIcon

    console.log('optionMenuLeft', menuButtonInfo.optionMenuLeft, menuButtonInfo.optionMenuRight)

    style = {
      left: left + width + px2real(16),
      top: top,
      right: windowWidth - menuButtonInfo.optionMenuRight + px2real(24) + menuButtonInfo.optionMenuWidth,
      height: height,
    }
  }

  // 高德 or 微信小程序
  else if (isAmapMiniApp || isWechatNotAppEnv) {
    style = {
      left: basePadding,
      top: top,
      right: windowWidth - menuButtonInfo.right + menuButtonInfo.width + basePadding,
      height: height,
    }
  }

  // App
  else if (isWxAppEnv) {
    style = {
      left: basePadding,
      top: statusBarHeight + px2real(12),
      right: basePadding,
      height: statusBarHeight + px2real(88),
    }
  }

  // H5
  else if (isH5Env) {
    style = {
      left: basePadding,
      top: px2real(40),
      right: basePadding,
      height: px2real(128),
    }
  }

  searchBarStyle.value = style
}

const searchInon = (process) => {
  if (process > 0.5) {
    return 'https://ic-img.ky-express.com/netc/20260923_99289_!!1790130135334_64_64.png'
  } else {
    return 'https://ic-img.ky-express.com/netc/20260923_413_!!1790130135344_64_64.png'
  }
}
const setOpacityOnScroll = (opacity: number) => {
  opacityRef.value = opacity > 1 ? 1 : opacity
}

const toSearchPage = () => {
  kyeNavigate.navigateBefore('navigateTo', {
    url: '/modules/search/pages/search/index',
    needLogin: true,
  })
  reportSerchClick('顶部搜索')
}

onMounted(() => {
  getSearchBarLayout()
})

defineExpose({
  setOpacityOnScroll,
})
</script>
