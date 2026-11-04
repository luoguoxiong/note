<template>
  <div class="iframe-content">
    <!-- <Skeleton v-if="isLoading" class="skeleton" /> -->
    <!-- <iframe v-if="url" :src="url" frameborder="0" width="100%" height="100%"></iframe> -->
    <KyEmpty
      v-if="isShowReLoad"
      class="order-empty"
      :type="EmptyTypeEnum.CUSTOM"
      :custom-config="{ image: EMPTY_CONFIGS.network.image, description: '加载超时，请重新加载' }"
    >
      <KyButton plain loadingType="plain" text="重新加载" loading-text="重新加载" @click="reload"></KyButton>
    </KyEmpty>
    <web-view
      v-if="url && !isShowReLoad"
      :src="url"
      @message="onMessage"
      style="width: 100%; height: 100%"
      :onLoad="iframeLoad"
    ></web-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, onBeforeMount } from 'vue'
// import Skeleton from './order-coupon/components/skeleton/index.vue'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { useRoute } from '@order-public-sub-public/vue-router/hooks/use-route'

import useEffect from '@order-public-sub-public/validate'

import { ModuleType, Channel, EmptyTypeEnum } from '@order-public-sub-public/constants'
import { getToken } from '@order-public-sub-public/utils/auth'
import { getEnv } from '@order-public-sub-public/utils/env'
import { getCouponIframeUrl, CouponIframeUrl } from '@order-public-sub-public/apis/waybill/coupon'
import { useCouponBatchProcess } from '@order-public-sub-root-pages/order-batch/hooks/useCouponBatch'
import { getChannel, getBatchId } from '@order-public-sub-public/configs'
import { Coupon } from '@order-public-sub-public/types'
import { EMPTY_CONFIGS } from '@order-public-sub-public/components/ui/ky-empty/config'
import { convertPostMessage } from '@order-public-sub-public/utils/common'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
const piniaStore = useStore()

// const url3 = ref('http://10.32.81.60:8080/coupon/home.html#/coupon?token=3B80F90B-3A09-437E-A12E-787B6989E75F_86033&sessionId=bd9f5b5d-eb8d-4bad-875c-d69598e534e7&postSource=my')
const url = ref()
const isLoading = ref(false)
const { remoteCheck } = useEffect()
const router = useRouter()
const route = useRoute()
interface MessageCoupon {
  couponShortDesc: string // 优惠券描述简称
  couponCode: string
  operationType: string // 10: 选择优惠券，20: 取消勾选优惠券，30：加载完毕 , 40: 没有任何操作点确定, 404: 接口报错
  useListLen: number // operationType 为30时 需要
  notUseListLen: number // operationType 为30时 需要
}

const storeCouponCode = computed(() => piniaStore.order.moduleFormData(ModuleType.优惠券)?.couponCode)

let timer: any = null
const isShowReLoad = ref(false)

const currentRoute = computed(() => route.query)
/**
 * @description: 选中或取消选中优惠券回调，此时要根据运单列表获取 对应的优惠券数量和金额
 * @param {*} event { type: 'crmCoupon', coupon: MessageCoupon }
 * @return {*}
 */
const estimateFeeTaskId = computed(() => piniaStore.schema.currentSchema?.schema?.data?.estimateFeeTaskId || '')
const updateCoupon = async (data: any) => {
  console.log('object-event', data)
  const { coupon } = data
  clearTimeout(timer)
  isLoading.value = false
  if (data.type === 'crmCoupon' && coupon) {
    exp_express_single_coupon_v1({ type: 'iframeMessage', ...coupon })
    // crm内部接口报错 返回
    if (coupon?.operationType === 404) {
      routerBack()
    }
    console.log('coupon: ', coupon)
    if (currentRoute.value?.channel !== Channel.批量寄) {
      notBatch(coupon)
    } else {
      batch(coupon)
    }
  }
}
const onMessage = (event: MessageEvent) => {
  console.log('coupon-event: ', event)
  convertPostMessage(event, (data) => {
    updateCoupon(data)
  })
}
const batch = async (coupon: MessageCoupon) => {
  let waybillNumber = currentRoute?.value?.waybillNumber as string
  if (waybillNumber as string) {
    if (['10'].includes(coupon?.operationType)) {
      useCouponBatchProcess(
        waybillNumber,
        {
          couponCode: coupon.couponCode,
          showText: coupon.couponShortDesc,
        },
        'coupon',
      )
      routerBack()
    } else if (['20'].includes(coupon?.operationType)) {
      useCouponBatchProcess(
        waybillNumber,
        {
          couponCode: '',
          showText: '',
        },
        'coupon',
      )
      routerBack()
    } else if (['40'].includes(coupon?.operationType)) {
      // 没有任何操作
      routerBack()
    }
  }
}
// 单票原逻辑
const notBatch = async (coupon: MessageCoupon) => {
  try {
    if (['10'].includes(coupon?.operationType)) {
      piniaStore.order.updateOrderByType({
        type: ModuleType['优惠券'],
        data: {
          couponCode: coupon.couponCode,
          showText: coupon.couponShortDesc,
          estimateFeeTaskId: estimateFeeTaskId.value,
          oldCouponCode: storeCouponCode.value,
        } as any,
      })
      routerBack()
      await remoteCheck('coupon')
    } else if (['20'].includes(coupon?.operationType)) {
      piniaStore.order.updateOrderByType({
        type: ModuleType['优惠券'],
        data: {
          couponCode: '',
          showText: '',
          estimateFeeTaskId: estimateFeeTaskId.value,
        } as any,
      })
      routerBack()
      await remoteCheck('coupon')
    } else if (['40'].includes(coupon?.operationType)) {
      // 没有任何操作
      routerBack()
    }
  } catch (e) {
    console.error(e)
  }
}
const getUrl = async () => {
  url.value = ''
  isLoading.value = true
  const processPromise = piniaStore.globalData.processPromise
  if (processPromise) {
    try {
      await processPromise
    } catch (error) {
      console.log(error)
    }
  }
  const token = await getToken()
  const env = await getEnv()
  const params = {
    orderType: currentRoute?.value?.channel === Channel.批量寄 ? '20' : '10',
    type: 'coupon',
    environment: env.toLocaleLowerCase(),
    platform: 'mobile',
    couponCode: currentRoute?.value.couponCode,
    waybillNumber: currentRoute?.value.waybillNumber,
    taskId: estimateFeeTaskId.value,
  } as CouponIframeUrl

  const channel = getChannel()

  if (channel === Channel.修改运单) {
    params.opType = 20
  }

  try {
    const batchId = getBatchId()
    if (!batchId) {
      umpOtherReport('OTHER', {
        eventCode: 'exp_express_single_coupon_v1_no_batchId',
      })
      url.value = ''
      return
    }
    const res = await getCouponIframeUrl(params)
    timer = setTimeout(() => {
      isLoading.value = false
      isShowReLoad.value = true
    }, 10000)
    // await sleep(11000)
    const now = new Date().getTime()
    url.value = `${res.data}&token=${token}&postSource=my&timer=${now}&couponCode=${currentRoute?.value?.couponCode || ''}`
    exp_express_single_coupon_v1({ type: 'getUrl', url: url.value })
  } catch (error) {
    isLoading.value = false
    router.back()
  }
}
const exp_express_single_coupon_v1 = (data: any) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'exp_express_single_coupon_v1',
    },
    {
      Input_method: '优惠券Iframe',
      request_result: '成功',
      ...data,
    },
  )
}

const routerBack = () => {
  // router.back()
}
onBeforeMount(() => {
  getUrl()
})
onMounted(() => {
  window.addEventListener('message', updateCoupon)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', updateCoupon)
  timer && clearTimeout(timer)
})
const reload = () => {
  isShowReLoad.value = false
  getUrl()
}

// 加载后也需要清除，微信小程序message需要触发导航才会发生
const iframeLoad = () => {
  clearTimeout(timer)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.iframe-content {
  // position: fixed;
  display: flex;
  flex-direction: column;
  // top: 0;
  // left: 0;
  width: 100%;
  height: 100vh;
}
</style>
