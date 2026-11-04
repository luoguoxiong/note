<template>
  <view class="ky-container" id="ky-container">
    <!--  自定义导航  -->
    <slot name="navbar">
      <ky-navbar
        v-bind="navBarProps"
        @click-left="handleClickLeft"
        @click-right="handleClickRight"
        @click-title="handleClickTitle"
      >
        <template v-for="slotName in Object.keys($slots)" :key="slotName" v-slot:[slotName]>
          <slot :name="slotName"></slot>
        </template>
      </ky-navbar>
    </slot>
    <view class="ky-container__content">
      <!--  自定义内容scrollView是否开启  -->
      <scroll-view
        v-if="needScrollView"
        class="ky-container__scroll-view"
        :scroll-y="true"
        v-bind="$attrs"
        :style="{ height: containerHeight }"
      >
        <slot></slot>
      </scroll-view>
      <slot v-else></slot>
    </view>
  </view>
</template>

<script setup lang="ts" name="ky-container">
import './index.scss'
import { computed, onMounted } from 'vue'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import KyNavbar from '@packages/__components/navbar'
import useNetWorkHook from './hooks/useNetWorkHook'
import { KyContainerProps } from '@packages/__components/container/src/types'
import { useContainerShare } from '@packages/__components/container/src/hooks/useContainerShare'
import useContainerScroll from '@packages/__components/container/src/hooks/useContainerScroll'

const props = withDefaults(defineProps<KyContainerProps>(), {
  navBarOptions: {
    showPlatList: ['wx'],
    leftText: '',
    title: '',
  },
  scrollOptions: {
    scrollViewPlatList: ['wx', 'h5'],
  },
  toolOptions: {
    isHideShareMenu: true,
    title: '',
    path: '',
  },
})

const emit = defineEmits(['click-left', 'click-right', 'click-title', 'containerInit'])

const { needScrollView, containerHeight, navAppHeaderHeight } = useContainerScroll(props.scrollOptions)
const { networkType } = useNetWorkHook({ onNetworkWeakChange: props.errorCheck?.onNetworkWeakChange })

/* 网络状态watch */
// watch(
//   () => networkType.value,
//   (val) => {
//     console.log('网络状态', val)
//   },
// )

/* 导航props */
const navBarProps = computed(() => {
  return {
    ...props.navBarOptions,
  }
})

const handleClickLeft = (e) => {
  emit('click-left', e)
}

const handleClickRight = (e) => {
  emit('click-right', e)
}

const handleClickTitle = (e) => {
  console.log('handleClickTitle')
  emit('click-title', e)
}

// container初始化完毕
const containerInitCallback = () => {
  emit('containerInit', {
    navAppHeaderHeight: navAppHeaderHeight.value,
    networkType: networkType.value,
  })
}

const { containerShareInfo, containerShareInit } = useContainerShare({ toolOptions: props.toolOptions })

useDidShow(() => {
  containerShareInit()
  console.log('useDidShow container')

  // 触发自定义事件
  if (props.reportOptions?.errorCaptured) {
    props.reportOptions?.errorCaptured()
  }
})

/* 页面分享回调 */
useShareAppMessage(() => {
  return {
    title: containerShareInfo.title,
    path: containerShareInfo.path,
  }
})
/* 页面分享到朋友圈回调-仅微信小程序支持，页面自行配置 */
/* useShareTimeline(() => {
  return {}
}) */

onMounted(() => {
  containerInitCallback()
})
</script>
