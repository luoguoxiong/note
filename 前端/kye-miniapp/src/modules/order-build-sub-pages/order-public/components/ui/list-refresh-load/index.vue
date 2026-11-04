<template>
  <div class="list-refresh-load">
    <ky-list
      v-bind="$attrs"
      v-model:refreshing="_refreshing"
      :isFinished="finished"
      @refresh="onRefresh"
      @scroll="handleScroll"
      v-model:loading="_loading"
      v-model:finished="_finished"
      :lowerThreshold="100"
      @load="onLoad"
      :show-scrollbar="false"
      :enhanced="true"
      ref="kyListRef"
    >
      <!-- 下拉提示 -->
      <template #pulling="props">
        <!-- <Circle :rate="rate(props.distance)" /> -->
      </template>

      <!-- 释放提示 -->
      <template #loosing>
        <!-- <Circle :rate="100" /> -->
      </template>

      <!-- 加载中图标 -->
      <template #loading>
        <img class="load-img circle-style" :src="img('load-img')" alt="" />
      </template>

      <!-- 加载成功图标 -->
      <template #success>
        <img class="finish-img circle-style" :src="img('finish-img')" alt="" />
      </template>

      <slot></slot>
    </ky-list>
  </div>
</template>

<script setup lang="ts">
// 组件
import { ref } from 'vue'
// import Circle from './components/circle/index.vue'
// 方法
import { rate, img } from './utils'
import { computed } from 'vue'

interface PropsType {
  refreshing: boolean
  loading: boolean
  finished: boolean
  finishedText?: string
  isNeedRefresh?: boolean
  offset?: number
}

const props = withDefaults(defineProps<PropsType>(), {
  refreshing: false,
  loading: false,
  finished: false,
  isNeedRefresh: false,
  finishedText: '没有更多了',
})

const emit = defineEmits(['refresh', 'onLoad', 'handleScroll'])
const kyListRef = ref()

const _refreshing = computed(() => {
  return props.refreshing
})

const _loading = computed(() => {
  return props.loading
})

const _finished = computed(() => {
  return props.finished
})

/**
 * 下拉刷新
 */
const onRefresh = () => emit('refresh')

/**
 * 上拉加载
 */
const onLoad = () => emit('onLoad')

const scrollToTop = () => {
  kyListRef.value?.scrollToTop()
}

const setScrollY = (val: number) => {
  kyListRef.value?.setScrollY(val)
}

const handleScroll = (e) => {
  emit('handleScroll', e)
}

defineExpose({
  scrollToTop,
  setScrollY,
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
