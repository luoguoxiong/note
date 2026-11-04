<template>
  <!-- 搜索栏 -->
  <view
    :class="{
      'home-page': true,
      'h5-tab-page-layout': isH5Env,
      greyTheme: themeConfig.isGrayTheme,
    }"
  >
    <SearchBar ref="searchBar"></SearchBar>
    <ky-list
      class="newcomer-content"
      :refreshing="refreshing"
      :throttle="false"
      :isEmpty="true"
      :pullDistance="isH5Env ? 80 : 120"
      disabledLoad
      @refresh="onRefresh"
      @scroll="handlelListScroll"
      @scrolltoupper="scrolltoupper"
    >
      <!-- 视频引导模块 -->
      <VideoIntroduce ref="videoIntroduce" v-if="isLogin"></VideoIntroduce>
      <VideoIntroduce ref="videoIntroduce" v-else></VideoIntroduce>
      <!-- 未登录或者新客引导 -->
      <UserInvite @showContactBusiness="showContactBuisiness"></UserInvite>
      <!-- 轻应用 -->
      <AppEntry v-if="!hideLightApp"></AppEntry>
      <!-- 行业解决方案 -->
      <IndustryInfo></IndustryInfo>
      <!-- 合作伙伴 -->
      <Partner></Partner>
    </ky-list>
  </view>
</template>
<script setup lang="ts">
import './index.scss'
import VideoIntroduce from './components/video-introduce/index'
import UserInvite from './components/user-invite/index'
import AppEntry from './components/app-entry/index'
import IndustryInfo from './components/industry-info/index'
import Partner from './components/partner/index'
import SearchBar from './components/search-bar/index'
import { throttle } from 'lodash-es'
import { computed, ref, watch } from 'vue'
import { useThemeStore } from '@/store'
import { isAliMiniApp, isH5Env } from '@/public/utils'
import { useRoleFlags } from '../../hooks'
import { useLogin } from '@/public/hooks'
import { useDidHide, useDidShow } from '@tarojs/taro'

const { themeConfig } = useThemeStore()

const { isLogin } = useLogin()

const emits = defineEmits(['show-contact-business', 'scroll', 'refresh'])

defineProps<{ refreshing: boolean }>()

const hideLightApp = computed(() => {
  return isAliMiniApp && !isLogin.value
})

const videoIntroduce = ref()

const searchBar = ref()

const onRefresh = async () => {
  emits('refresh')
}

const handlelListScroll = (e) => {
  emits('scroll')
  handleScroll(e)
}

const updateSearchBarStatus = async (scrollTop: number) => {
  const height = (await videoIntroduce.value.getVideoContentHeight()) / 2
  searchBar.value.setOpacityOnScroll(scrollTop / height)
  videoIntroduce.value.replayOnScroll(scrollTop)
}

const handleScroll = async (e) => {
  const scrollTop = e.detail.scrollTop < 40 ? 0 : e.detail.scrollTop
  updateSearchBarStatus(scrollTop)
}

const scrolltoupper = () => {
  console.log('scrolltoupper')
  updateSearchBarStatus(0)
}
const showContactBuisiness = (showType: 'phone' | 'qrcode') => {
  emits('show-contact-business', showType)
}

let hasChange = false

watch(
  () => isLogin.value,
  () => {
    hasChange = true
  },
)

const showLoginVideo = ref(isLogin.value)

useDidShow(() => {
  if (hasChange) {
    setTimeout(() => {
      showLoginVideo.value = isLogin.value
      hasChange = false
    }, 200)
  }
})
</script>
