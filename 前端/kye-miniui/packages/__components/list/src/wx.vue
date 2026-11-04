<!-- eslint-disable vue/no-deprecated-slot-attribute -->
<template>
  <view class="ky-list" id="ky-list-container">
    <scroll-view
      id="ky-list-container-scroll-view"
      class="ky-list-scroll-content"
      :style="{ height: '100%' }"
      :scrollY="true"
      :upperThreshold="5"
      scroll-with-animation
      :bounces="false"
      :enhanced="true"
      type="list"
      :throttle="false"
      enable-passive
      :catchMove="true"
      refresher-default-style="none"
      refresher-background="transparent"
      :refresher-enabled="!disabledRefresh"
      :refresher-threshold="80"
      :refresherTriggered="isRefresh"
      @refresherpulling="onPulling"
      @refresherrestore="onRefreshStop"
      @refresherrefresh="onRefresh"
      :lowerThreshold="lowerThreshold"
      :scroll-top="scrollTop"
      @scrolltoupper="handleUpper"
      @scroll="handleScroll"
      @scrolltolower="handleScrollToLower"
    >
      <slot-view :name="'refresher'" :style="{ height: pullDistance + 'px' }" class="ky-list-refresh-content">
        <view class="ky-list-circle">
          <Circle
            v-if="!refreshing && status === 'pulling' && dragHeight > 0"
            :size="20"
            :stroke-width="2"
            color="#8365f6"
            trackColor="white"
            :duration="0"
            :showText="false"
            :progress="(dragHeight / 80) * 100"
          ></Circle>
        </view>
        <image :src="finishImg" v-show="status === 'success'" v-if="hasLoadedFinishImg" class="ky-list-finshImg" />

        <image :src="loadingImg" v-show="status === 'loading'" v-if="hasLoadedLoadingImg" class="ky-list-finshImg" />
      </slot-view>

      <!-- 列表内容 -->
      <slot></slot>
      <view :class="['list-bottom', { 'list-isLoadFail': isLoadFail && noData }]" v-if="!isEmpty">
        <view class="ky-list-loading-tip" v-show="!isFinished && !isLoadFail && !isRefresh">
          <Loading type="kye" size="large">加载中...</Loading>
        </view>

        <!-- 加载完成 -->
        <slot name="finished" v-if="isFinished">
          <view class="ky-list-loading-tip"> 没有更多数据 </view>
        </slot>

        <!-- 加载失败 -->
        <slot name="load-fail" v-if="isLoadFail">
          <view class="ky-list-load-fail" @click="reLoad">加载失败，<text>请重试</text></view>
        </slot>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Taro from '@tarojs/taro'
import Circle from '@ky-miniui-lib/circle'
import Loading from '@ky-miniui-lib/loading'
import { ListProps } from './types'
import { loadingImg, finishImg } from './config'
import './wx.scss'

const props = withDefaults(defineProps<ListProps>(), {
  pullDistance: 80,
  refreshing: false,
  refreshSuccessDuration: 1000,
  disabledRefresh: false,
  disabledLoad: false,
  loading: false,
  isFinished: false,
  loadingText: '加载中...',
  finishedText: '没有更多数据',
  lowerThreshold: 100,
  isEmpty: false,
})

const emit = defineEmits(['update:refreshing', 'refresh', 'load', 'update:loading', 'scroll', 'scrolltoupper'])

const status = ref<'normal' | 'pulling' | 'loading' | 'loosing' | 'success'>('normal')

const isRefresh = ref(false)

const hasLoadedLoadingImg = ref(false)
const hasLoadedFinishImg = ref(false)

watch(status, (val) => {
  if (val === 'loading') hasLoadedLoadingImg.value = true
  if (val === 'success') hasLoadedFinishImg.value = true
})

watch(
  () => props.refreshing,
  (value, oldValue) => {
    // disabledRefresh 只禁用原生手势，不影响 refreshing 状态机复位，避免状态卡死在 loading
    if (value) {
      status.value = 'loading'
    } else if (oldValue === true) {
      // 完成下拉刷新判断逻辑
      status.value = 'success'
      setTimeout(() => {
        status.value = 'normal'
        isRefresh.value = false
      }, props.refreshSuccessDuration)
    }
  },
)

const dragHeight = ref(0)

const onPulling = (e: any) => {
  dragHeight.value = Math.min(e.detail.dy, props.pullDistance)
  status.value = 'pulling'
}

const onRefreshStop = () => {
  dragHeight.value = 0
  status.value = 'normal'
  isRefresh.value = false
}

const onRefresh = () => {
  isRefresh.value = true
  emit('refresh')
}

const scrollTop = ref(0)

const scrollToTop = () => {
  scrollTop.value = -1
  Taro.nextTick(() => {
    scrollTop.value = 0
  })
}

const scrollY = ref(0)

const handleUpper = () => {
  scrollY.value = 0
  emit('scrolltoupper')
}

const handleScrollToLower = () => {
  if (props.isFinished) return
  emit('load')
  emit('update:loading', true)
}

const handleScroll = (e: any) => {
  const { scrollTop } = e.detail
  scrollY.value = scrollTop
  emit('scroll', e)
}

const reLoad = () => {
  emit('load')
}

const setScrollY = (val: number) => {
  scrollTop.value = val
}

defineExpose({
  scrollToTop,
  getScrollTop: () => scrollY.value, // 新增
  setScrollY,
})
</script>
