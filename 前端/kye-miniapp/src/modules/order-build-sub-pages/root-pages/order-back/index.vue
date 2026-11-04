<template>
  <div
    class="order-back h-full dialog_root_back"
    id="order-page"
    v-exposure-report="{
      eventCode: 'exp_express_return_msg_v1',
    }"
  >
    <Order key="order-back" :route="route" />
    <PopovertEffect />
    <TaroToast />
  </div>
</template>
<script setup lang="ts">
import TaroToast from '@public/components/base/toast/toast.vue'
import PopovertEffect from '@order-public-sub-public/components/business/popover-effect/index.vue'
import Order from '../order-single/index.vue'
import { ref } from 'vue'
import { useDidShow, useUnload } from '@tarojs/taro'
import { OrderPageType } from '@order-public-sub-public/constants'
import { showSkeleton, closeSkeleton } from '@order-public-sub-public/utils/skeleton'
import { useInit } from '../order-single/hooks/useInit'
import { useStore } from '@order-public-sub-public/store'
import { initStore } from '@order-public-sub-public/utils/store'
// import { onBeforeRouteLeave } from '@order-public-sub-public/vue-router/index'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { isBackFromOrderBackPage } from '../order-single/hooks/routerStatus'
import Taro from '@tarojs/taro'
import { resetOrderDataWhenFromBack } from '../order-single/hooks/useSaveOrder'
import { useResetState } from '@order-public-sub-public/components/business/return-waybill/hooks/useResetState'
const piniaStore = useStore()
const route = OrderPageType.返程单
piniaStore.root.setOrderPageType(OrderPageType.返程单)
initStore(OrderPageType.返程单)
const notFirstTimeEnter = ref(false)

const { removeLast } = useInitMulitFielConfigChild()
// 定义组件名，用于keepAlive白名单判断
defineOptions({
  name: 'order-back',
})

/**
 * @description 返程单页面初始化配置和数据
 */
const initOrderBackPageData = async () => {
  const { init, initOrderBackPage } = useInit(route)
  const { back, forward } = history.state
  // 返回的页面是下单页
  const backPageIsOrder = back?.includes('/order') && !back.includes('/order-back')
  // 前进的页面为空或者是返程寄页面
  const forwardPageIsEmptyOrOrderBack = !forward || forward.includes('/order-back')
  if (backPageIsOrder && forwardPageIsEmptyOrOrderBack) {
    showSkeleton()
    await init('order-back')
    initOrderBackPage()
    closeSkeleton()
  }
}

// onBeforeRouteLeave(async (to, _from, next) => {
//   if (to.path === '/order') {
//     removeLast()
//   }
//   next()
// })

useDidShow(() => {
  isBackFromOrderBackPage.value = true
  if (notFirstTimeEnter.value) {
    initOrderBackPageData()
  } else {
    notFirstTimeEnter.value = true
  }
})

useUnload(() => {
  useResetState({ type: 'popup' })
  const pages = Taro.getCurrentPages()
  const currentPageIndex = pages.length - 1
  // const nextPage = pages[currentPageIndex] // 当前页面是最后一个，没有 next page
  const prevPage = pages[currentPageIndex - 1]
  console.log('prevPage', prevPage)

  if (
    prevPage.config?.navigationBarTitleText === '快速寄件' ||
    prevPage.route === 'modules/order-build/pages/order/index'
  ) {
    resetOrderDataWhenFromBack()
  }
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../order-single/index.scss';
@import './index.scss';
</style>
