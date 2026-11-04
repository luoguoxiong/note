<template>
  <view
    class="ky-list"
    id="ky-list-container"
    :catchMove="true"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <view
      :class="{
        'ky-list-refresh-track': true,
        'ky-list-refresh-track-loosing': refreshStatus.loosing,
      }"
      :style="refreshStatus.dragHeight > 0 ? `transform: translate3d(0, ${refreshStatus.dragHeight}px, 0);` : ''"
    >
      <!-- 下拉刷新提示 -->
      <view
        :class="{
          'ky-list-refresh-tip': true,
          'ky-list-refresh-tip-loosing': refreshStatus.loosing,
        }"
        :style="{ height: `${pullDistance}px` }"
      >
        <image :src="finishImg" v-show="status === 'success'" v-if="hasLoadedFinishImg" class="ky-list-finshImg" />
        <image :src="loadingImg" v-show="status === 'loading'" v-if="hasLoadedLoadingImg" class="ky-list-finshImg" />
        <view class="ky-list-circle">
          <Circle
            v-if="status === 'pulling' || status === 'loosing'"
            :size="20"
            :stroke-width="2"
            color="#8365f6"
            trackColor="white"
            :duration="0"
            :showText="false"
            :progress="
              (refreshStatus.dragHeight / loadingStatusHeight > 1
                ? 1
                : refreshStatus.dragHeight / loadingStatusHeight) * 100
            "
          />
        </view>
      </view>

      <scroll-view
        id="ky-list-container-scroll-view"
        class="ky-list-scroll-content"
        :style="{ height: '100%', overflow: status === 'normal' ? 'auto' : 'hidden' }"
        :scrollY="status === 'normal'"
        :upperThreshold="5"
        scroll-with-animation
        :bounces="false"
        :enhanced="true"
        type="list"
        :throttle="false"
        enable-passive
        :catchMove="true"
        :lowerThreshold="lowerThreshold"
        :scroll-top="scrollTop"
        v-bind="scrollViewProps"
        @scrolltoupper="handleUpper"
        @scroll="handleScroll"
        @touchmove="handleTouchMove"
        @scrolltolower="handleScrollToLower"
      >
        <slot />

        <view :class="['list-bottom', { 'list-isLoadFail': isLoadFail && noData }]" v-if="!isEmpty">
          <view class="ky-list-loading-tip" v-show="!isFinished && !isLoadFail && showLoading && status !== 'loading'">
            <Loading type="kye" size="large">加载中...</Loading>
          </view>

          <slot name="finished" v-if="isFinished">
            <view class="ky-list-loading-tip"> 没有更多数据 </view>
          </slot>

          <slot name="load-fail" v-if="isLoadFail">
            <view class="ky-list-load-fail" @click="reLoad"> 加载失败，<text>请重试</text> </view>
          </slot>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import Circle from '@ky-miniui-lib/circle'
import Loading from '@ky-miniui-lib/loading'
import { ListProps, RefreshStatus, ScrollViewProps } from './types'
import { loadingImg, finishImg } from './config'
import './alipay.scss'

const props = withDefaults(defineProps<ListProps>(), {
  refreshing: false,
  pullDistance: 80,
  headHeight: 120,
  disabledRefresh: false,
  disabledLoad: false,
  isFinished: false,
  lowerThreshold: 100,
  isEmpty: false,
  isLoadFail: false,
  noData: false,
  showLoading: true,
  scrollViewProps: {} as ScrollViewProps,
})

const emit = defineEmits(['update:refreshing', 'refresh', 'load', 'update:loading', 'scroll', 'scrolltoupper'])

const loadingStatusHeight = props.pullDistance
const scrollTop = ref(0)
const scrollY = ref(0)

const status = ref<'normal' | 'pulling' | 'loading' | 'loosing' | 'success'>('normal')

const hasLoadedLoadingImg = ref(false)
const hasLoadedFinishImg = ref(false)

watch(status, (val) => {
  if (val === 'loading') hasLoadedLoadingImg.value = true
  if (val === 'success') hasLoadedFinishImg.value = true
})

const refreshStatus = ref<RefreshStatus>({
  loosing: false,
  startPoint: null,
  dragHeight: 0,
})

let refreshTimer: any = null
const resetTimer: any = null

/** ================= 工具函数 ================= */

const getPoint = (e: any) => {
  if (e.touches && e.touches[0]) return e.touches[0]
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0]
  return e
}

const ease = (distance: number) => {
  const pullDistance = props.pullDistance
  const ratio = 0.5 // 阻尼系数

  if (distance > pullDistance) {
    return pullDistance + (distance - pullDistance) * ratio
  }

  return distance
}

/** ================= watch ================= */

watch(
  () => props.refreshing,
  (value, oldValue) => {
    // disabledRefresh 只禁用手势触发，不影响 refreshing 状态机复位，避免状态卡死在 loading
    if (value) {
      status.value = 'loading'
    } else if (oldValue === true) {
      status.value = 'success'
      refreshTimer = setTimeout(() => {
        refreshStatus.value.dragHeight = 0
        status.value = 'normal'
      }, 1000)
    }
  },
)

/** ================= scroll ================= */

const handleUpper = () => {
  scrollY.value = 0
  emit('scrolltoupper')
}

const handleScroll = (e: any) => {
  console.error('handleScroll', e.detail.scrollTop)
  scrollY.value = e.detail.scrollTop
  emit('scroll', e)
}

const handleScrollToLower = () => {
  if (props.isFinished) return
  emit('load')
  emit('update:loading', true)
}

/** ================= 核心拖拽逻辑 ================= */

const startDrag = (e: any) => {
  clearTimeout(refreshTimer)
  clearTimeout(resetTimer)
  if (props.disabledRefresh) return

  const point = getPoint(e)
  refreshStatus.value.startPoint = {
    pageX: point.pageX,
    pageY: point.pageY,
  }
}

const moveDrag = (e: any) => {
  requestAnimationFrame(() => {
    // 禁用时直接返回，避免 startPoint 被残留写入导致 endDrag 误判
    if (props.disabledRefresh) return
    const point = getPoint(e)
    if (scrollY.value !== 0) {
      refreshStatus.value.startPoint = {
        pageX: point.pageX,
        pageY: point.pageY,
      }
    }
    if (!refreshStatus.value.startPoint || scrollY.value !== 0) return

    const offset = point.pageY - refreshStatus.value.startPoint.pageY

    if (offset > 0) {
      e.preventDefault?.() // PC 防止页面滚动
      status.value = offset > loadingStatusHeight ? 'loosing' : 'pulling'
      refreshStatus.value.dragHeight = ease(offset)
    }
  })
}

const endDrag = (e: any) => {
  // 手势中途动态切换为禁用时，复位拖拽状态，防止误触发 refresh
  if (props.disabledRefresh) {
    refreshStatus.value.startPoint = null
    refreshStatus.value.dragHeight = 0
    refreshStatus.value.loosing = false
    status.value = 'normal'
    return
  }
  if (!refreshStatus.value.startPoint || scrollY.value !== 0) return

  const point = getPoint(e)
  const dragHeight = point.pageY - refreshStatus.value.startPoint.pageY

  refreshStatus.value.startPoint = null
  refreshStatus.value.loosing = true

  if (dragHeight > loadingStatusHeight) {
    emit('refresh')
    refreshStatus.value.dragHeight = loadingStatusHeight
  } else {
    refreshStatus.value.dragHeight = 0
    status.value = 'normal'
  }
}

/** ================= Touch ================= */

const handleTouchStart = (e: any) => startDrag(e)
const handleTouchMove = (e: any) => moveDrag(e)
const handleTouchEnd = (e: any) => endDrag(e)

/** ================= expose ================= */

const scrollToTop = () => {
  scrollTop.value = -1
  Taro.nextTick(() => {
    scrollTop.value = 0
  })
}

defineExpose({
  scrollToTop,
  getScrollTop: () => scrollY.value,
  setScrollY: (val: number) => (scrollTop.value = val),
})

const isWeb = Taro.getEnv() === 'WEB'
/** web scroll-view 跳转后，会重置为0，主要记录保存上次的滚动距离 */
if (isWeb) {
  let lastScrollTop = 0

  useDidHide(() => {
    lastScrollTop = scrollY.value
  })

  useDidShow(() => {
    scrollY.value = lastScrollTop
    emit('scroll', {
      detail: {
        scrollTop: lastScrollTop,
      },
    })
  })
}
</script>
