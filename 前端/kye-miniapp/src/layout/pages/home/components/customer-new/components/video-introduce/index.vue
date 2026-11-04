<template>
  <view
    class="vi-content"
    id="vi-video"
    :class="{
      'vi-content-shorter': isLogin,
    }"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_brand_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'top_brand',
        event_name: '移动端新版首页_企业服务品牌信息_曝光',
        region_name: '品牌位',
      },
    }"
    @click="toAboutCompay"
  >
    <template v-if="!(isAmapMiniApp || isAliMiniApp)">
      <my-player
        v-if="isAllowVod"
        :style="{
          opacity: videoReady ? 1 : 0,
        }"
        :enable-progress-gesture="false"
        appid="1500036212"
        :fileid="isLogin ? config.loginfileId : config.defaultfileId"
        height="100%"
        object-fit="fill"
        @timeupdate="onVideoReady"
        @error="handleError"
        :muted="true"
        :loop="true"
        :autoplay="true"
        playsinline
        webkit-playsinline
        x5-playsinline
        preload="auto"
        :show-center-play-btn="false"
        :showFullscreenBtn="false"
        :controls="false"
        playerid="home-video"
        id="home-video"
      ></my-player>
      <video
        v-else
        ref="videoRef"
        id="home-video"
        :class="{
          'vi-video-layout': true,
        }"
        :enable-progress-gesture="false"
        :style="{
          opacity: videoReady ? 1 : 0,
        }"
        object-fit="fill"
        :src="isLogin ? config.loginVideo : config.defaultVideo"
        :muted="true"
        :loop="true"
        :autoplay="true"
        playsinline
        webkit-playsinline
        :poster="'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAANElEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgx1lAABqFDyOQAAAABJRU5ErkJggg=='"
        x5-playsinline
        preload="auto"
        :show-center-play-btn="false"
        :showFullscreenBtn="false"
        :controls="false"
        @timeupdate="onVideoReady"
      />

      <image
        :src="isLogin ? config.loginPoster : config.defaultPoster"
        class="vi-video-layout"
        :style="{
          zIndex: videoPosterReay ? 99 : 1,
        }"
        @load="handlePosterLoad"
        v-if="!videoReady"
      />
      <image
        :src="posterBg"
        class="vi-video-layout"
        :style="{
          zIndex: videoPosterReay ? 1 : 99,
        }"
        v-if="!videoReady"
      />
    </template>
    <ky-preload-image
      class="vi-video-layout"
      v-else
      :src="isLogin ? config.loginPoster : config.defaultPoster"
      :placeholder="posterBg"
    />
    <view
      class="vi-bottom"
      :style="{
        zIndex: videoPosterReay ? 99 : 1,
      }"
    >
      <view
        class="vi-bottom-item"
        :class="{
          'vi-bottom-item-center': index === 1,
          'vi-bottom-item-right': index === 0,
          'vi-bottom-item-left': index === 2,
        }"
        v-for="(item, index) in companyInfo"
        :key="item.name"
      >
        <view class="vi-bottom-num">
          <text class="DINNum">{{ item.count }}</text>
          <text class="vi-bottom-small">{{ item.pirce }}</text>
        </view>
        <view class="vi-bottom-name">
          <text>{{ item.name }}</text>
          <image class="vi-bottom-arrow" :src="bottomArrowIcon" />
        </view>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import './index.scss'
import { ref, onMounted, watch } from 'vue'
import posterBg from './assets/bg.png'
import Taro, { useDidShow } from '@tarojs/taro'
import { isAmapMiniApp, isQw, isWxMiniApp, isWxAppAndroidEnv, isWxAppIosEnv, isWxPcAppletEnv, isAliMiniApp } from '@/public/utils'
import { useLogin } from '@/public/hooks'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { reportClickVideo } from '@/layout/pages/home/report'

useExposureReport(['vi-video'])

const isAllowVod = isWxMiniApp && !isWxAppAndroidEnv && !isWxAppIosEnv && !isQw && !isWxPcAppletEnv

const { isLogin } = useLogin()

const companyInfo = [
  {
    name: '全货机运力',
    count: '21',
    pirce: '架',
  },
  {
    name: '城市覆盖率',
    count: '99',
    pirce: '%',
  },
  {
    name: '服务履约率',
    count: '98',
    pirce: '%',
  },
]

const bottomArrowIcon = 'https://ic-img.ky-express.com/netc/20260618_76463_!!1781750967383_48_48.png'

const config = {
  loginfileId: '5001834814671601131',
  loginVideo: 'https://ic-img-test.ky-express.com/20250911cmsbak/080501.mp4',
  loginPoster: 'https://ic-img.ky-express.com/netc/20260618_5099_!!1781756570447_1500_1680.png',
  defaultfileId: '5001834814670622826',
  defaultVideo: 'https://ic-img-test.ky-express.com/20250911cmsbak/080502.mp4',
  defaultPoster: 'https://ic-img.ky-express.com/netc/20260618_19243_!!1781756618311_1500_1988.png',
}

const videoReady = ref(false)

const videoPosterReay = ref(false)

const handlePosterLoad = () => {
  videoPosterReay.value = true
}

const onVideoReady = (e) => {
  let currentTime = 0
  if (isAllowVod) {
    currentTime = e.detail?.detail?.currentTime ?? 0
  } else {
    currentTime = e?.detail?.currentTime ?? 0
  }
  if (currentTime > 0.5) {
    videoReady.value = true
  }
}

const getContext = () => {
  if (isAllowVod) {
    const plugin = Taro.requirePlugin('myPlugin')
    return plugin.getContext('home-video')
  } else {
    return Taro.createVideoContext('home-video')
  }
}

const handleError = (error) => {
  console.error('video', error)
}

const replay = () => {
  if (isAmapMiniApp) return
  // getContext()?.seek(0)
}

const begainPlay = () => {
  if (isAmapMiniApp) return
  getContext()?.play()
}

let videoContentHeight = 0

const getContainerHeight = async (): Promise<number> => {
  if (videoContentHeight) {
    return videoContentHeight
  } else {
    return await getDomHeight()
  }
}

const getDomHeight = (): Promise<number> => {
  return new Promise((res) => {
    const query = Taro.createSelectorQuery()
    query
      .select('#vi-video')
      .boundingClientRect()
      .exec((rect) => {
        if (rect?.[0]) {
          videoContentHeight = rect[0].height
          res(videoContentHeight)
        }
      })
  })
}

let videoIsHide = false

// 滚动视频逻辑处理，超过视频高度，再次滑动回来，重新播放
const replayOnScroll = async (scrollTop: number) => {
  if (isAmapMiniApp) return
  const videoHeight = await getContainerHeight()
  if (scrollTop > videoHeight) {
    videoIsHide = true
  }
  if (videoIsHide && videoHeight > scrollTop) {
    replay()
    videoIsHide = false
  }
}

const toAboutCompay = () => {
  Taro.navigateTo({
    url: '/modules/tools/about-company/index',
  })
  reportClickVideo()
}

onMounted(() => {
  // console.error('Taro.getSystemInfoSync()', Taro.getSystemInfoSync().system.includes('OpenHarmonyOS'))
  getDomHeight()
})

useDidShow(() => {
  if (videoReady.value) {
    replay()
  }
  setTimeout(() => {
    getDomHeight()
  }, 1000)
})

defineExpose({
  replay,
  begainPlay,
  replayOnScroll,
  getVideoContentHeight: getContainerHeight,
})
</script>
