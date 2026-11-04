<template>
  <div class="h-full height-100" id="order-page">
    <CacheBlock v-if="!initFinished" />
    <SingleOrder v-if="showOrder" key="order-single" :orderTitle="singleOrderTitle" :route="route" />
    <Skeleton v-if="!initFinished && showOrder" />
  </div>
</template>
<script setup lang="ts">
import SingleOrder from '../order-single/index.vue'
import CacheBlock from '../order-single/components/cache-block/index.vue'
import { useDidShow, useLoad, useUnload } from '@tarojs/taro'
import { Channel, OrderPageType } from '@order-public-sub-public/constants'
// import { isShowOrderSkeleton } from '../order-single/hooks/useInit'
import { ref, onBeforeMount } from 'vue'
import Skeleton from '../order-single/components/skeleton/index.vue'
import { resetOrderDataWhenFromBack } from '../order-single/hooks/useSaveOrder'
import { setOrderQuestionUUID } from '../order-single/hooks/utils'
import { questionShow } from '@/public/components/business/order-question/hooks/index'
import { timeFlag } from '@order-public-sub-public/hooks/asynrender'
import Taro from '@tarojs/taro'
import { getQueryObject } from '@order-public-sub-public/utils'
import { useResetState as resetReturnWaybillState } from '@order-public-sub-public/components/business/return-waybill/hooks/useResetState'
import { initFinished } from '@order-public-sub-root-pages/order-single/hooks/routerStatus'
import { initStore } from '@order-public-sub-public/utils/store'
import { resetWaybillInfo } from '@order-public-sub-public/utils/waybillInfo'
import { singleOrderTitle } from '../order-single/hooks/state'
import { orderHomeRoute } from '../order-single/hooks/useInit'
import { useSetPreloadInnervalTask } from '@/public/apis/order'

questionShow.setQuestionStatus(true, setOrderQuestionUUID())
const route = OrderPageType.单票
const showOrder = ref(false)
window.$umpOtherReport = () => {}

const setTitle = () => {
  const { channel, sourceAction, isAppointmentPickup } = getQueryObject()

  if (channel === Channel.运单审核) {
    singleOrderTitle.value = '运单审核'
    Taro.setNavigationBarTitle({ title: '运单审核' })
    return
  }

  if (channel === Channel.调价审核) {
    singleOrderTitle.value = '调价审核'
    Taro.setNavigationBarTitle({ title: '调价审核' })
    return
  }
  if (isAppointmentPickup) {
    singleOrderTitle.value = '预约取货'
    Taro.setNavigationBarTitle({ title: '预约取货' })
    return
  }

  if (channel === Channel.修改运单 && sourceAction === 'recoverOrder') {
    singleOrderTitle.value = '恢复下单'
    Taro.setNavigationBarTitle({ title: '恢复下单' })
    return
  }

  if (channel === Channel.修改运单) {
    singleOrderTitle.value = '修改运单'
    Taro.setNavigationBarTitle({ title: '修改运单' })
    return
  }
  singleOrderTitle.value = '快速寄件'
  Taro.setNavigationBarTitle({ title: '快速寄件' })
}
setTitle()
useDidShow(async () => {
  setTitle()
  setTimeout(() => {
    showOrder.value = true
  }, 20)
  console.log('缓存页面最终渲染完成', Date.now() - timeFlag.value)
  resetOrderDataWhenFromBack()
})

useLoad((query) => {
  // bug#587786 解决ios真机扫码 第一次获取不到route.query导致显示的配置错误 组件内使用useLoad不生效 所以要写到page层级
  // 增加判断 有channel和configId才赋值 否则清空
  if (query && query.channel && query.configId) {
    orderHomeRoute.value = query
  } else {
    orderHomeRoute.value = undefined
  }
})
onBeforeMount(() => {
  initStore(route)
  resetWaybillInfo()
  initFinished.value = false
})
useUnload(() => {
  resetReturnWaybillState()
  useSetPreloadInnervalTask()
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.height-100 {
  height: 100vh;
}
</style>
