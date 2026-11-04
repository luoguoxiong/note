<template>
  <div id="home">
    <!-- 新老客首页二选一渲染：oldUser 0-新客 1-老客；加载失败时 oldUser 为空，按新客兜底数据渲染新客首页 -->
    <NewCustomerHome v-if="homeReady && !oldUser"></NewCustomerHome>
    <OldCustomerHome v-if="homeReady && oldUser"></OldCustomerHome>
    <!-- <SideNavigation></SideNavigation> -->
    <!-- 悬浮广告（advertisementType 70，可上下拖拽） -->
    <FloatAdvertisement v-if="homeReady"></FloatAdvertisement>
    <!-- 精准通知：弹窗数据复用 store.getBannerData 的响应（popupAdData），不再单独请求接口 -->
    <MessagePopup v-if="homeReady" :advertisementData="popupAdData" />
  </div>
</template>

<script setup lang="ts">
import FloatAdvertisement from './components/float-advertisement/index.vue'
import MessagePopup from '@/components/ky-message-popup/index.vue'
import { computed, defineAsyncComponent, onActivated, onMounted, ref, watch, nextTick } from 'vue' // 老客首页
import { onBeforeRouteLeave } from 'vue-router'
import { useHomeStore } from '@/hooks'
import { useUserStore } from '@/stores/user'

import { pageActivatedAction } from '@/utils/eventemitter/modules/pageOnActivated'
import EE from '@/utils/eventemitter'
import { ReportAppTimeEnum, report } from '@/utils/reportApp'
import { quitPage } from '@/views/home/report'
import { umpOtherReport } from '@/reportUmp'

const NewCustomerHome = defineAsyncComponent(
  () => import(/* webpackChunkName: 'home-new-customer' */ './home-v2/new-customer-home.vue')
) // 新客首页
const OldCustomerHome = defineAsyncComponent(
  () => import(/* webpackChunkName: 'home-old-customer' */ './home-v2/old-customer-home.vue')
)
const { store, homeStatus, oldUser, popupAdData } = useHomeStore()
const userStore = useUserStore()

const showCount = ref(0)

/** 模块数据加载完成（无加载中/权限变化）；加载失败时不再进入失败态，按新客兜底数据渲染 */
const homeReady = computed(() => {
  const { isFetching } = homeStatus.value
  return !isFetching && userStore.isInitialized
})

onMounted(() => {
  report(ReportAppTimeEnum.homeOnMontedTime)
  void store.getHomeModuleData()
  onIframeMessage()
  // 页面隐藏上报 - 代替tab关闭上报
  window.addEventListener('pagehide', quitPage)
  reportUv()
})

const reportUv = () => {
  const phone = sessionStorage.getItem('PHONE')
  if (phone) {
    umpOtherReport(
      'OTHER',
      {
        eventCode: 'other_homepage_visit_v1',
      },
      {
        time: performance.now(),
      }
    )
  }
}
const reFetch = () => {
  void store.getHomeModuleData()
}

// keep-alive 每次激活都重新拉取首页数据（首次激活紧跟 onMounted，跳过避免重复请求）
let isFirstActivated = true
// 离开首页时的滚动位置：#page-content 为全页面共享滚动容器。不能在 onDeactivated 里读——
// 该钩子执行时首页 DOM 已被 keep-alive 移出，scrollTop 已被中间页钳制（常为 0），必须趁 DOM 未变时在路由守卫读取
let savedScrollTop = 0

onBeforeRouteLeave(() => {
  savedScrollTop = document.getElementById('page-content')?.scrollTop ?? 0
})

onActivated(() => {
  if (isFirstActivated) {
    isFirstActivated = false
    return
  }
  reFetch()
  // 无条件恢复：上次位置在顶部（0）时也要归零，避免中间页的滚动位置泄漏到首页
  nextTick(() => {
    const el = document.getElementById('page-content')
    if (el) el.scrollTop = savedScrollTop
  })
})

watch(homeReady, () => {
  if (homeReady.value) {
    nextTick(() => {
      report(ReportAppTimeEnum.homeOnShowModule, {
        showCount: showCount.value + 1,
      })
      showCount.value += 1
    })
  }
})

// eventemit message监听
const onIframeMessage = () => {
  EE.on(pageActivatedAction['首页更新'], () => {
    reportUv()
  })
}
</script>

<style lang="scss" scoped>
#home {
  position: relative;
  // 底部 8px：末尾模块与页面底部保留 8px 间距（设计验收 ③），与顶部/右侧 8px 对齐
  padding: 8px 8px 8px 0;
  width: 100%;
  min-width: 0;
  background-color: #eff1fd;
  box-sizing: border-box;
  user-select: none;
  font-family: Microsoft YaHei;
}
</style>
