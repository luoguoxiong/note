<template>
  <view class="flex column h-screen order-success-container">
    <ky-navbar :leftArrow="true" :title="authVisible ? '提交成功' : '下单成功'" v-if="isWxMiniApp"></ky-navbar>
    <div class="order-page flex-column space-between h-full">
      <KyEmpty v-if="netWorkError" :type="EmptyTypeEnum.NETWORK"></KyEmpty>
      <div
        v-else
        class="content"
        v-exposure-report="{
          eventCode: 'other_express_result_perception_v1',
        }"
      >
        <!-- 实名认证提示条 -->
        <div
          class="order-success-notice-bar"
          v-if="!realAuthFlag && realAuthTipsText && initEndFlag"
          :scrollable="false"
          wrapable
          v-exposure-report="realAuthReportParams(showGoRealNameFlag)"
        >
          <div class="order-success-notice-wrap">
            {{ realAuthTipsText }}
          </div>
          <div
            v-if="showGoRealNameFlag && successOrderInfo"
            class="go_real_auth"
            :class="realNameButtonType === YesOrNoNumber.YES ? '' : 'go_real_auth_share'"
            @click="realNameFun"
            v-click-report="clkAuthReportParams()"
          >
            {{ realNameButtonType === YesOrNoNumber.YES ? '去认证' : '转发他人实名' }}
          </div>
        </div>
        <!-- 未绑码提示条 -->
        <KyNoticeBar
          v-if="initEndFlag && realAuthFlag && tipText && successWaybillList && successWaybillList.length > 0"
        >
          <div v-html="tipText"></div>
        </KyNoticeBar>
        <OrderStatus
          :class="hasTips ? 'order-status-tips' : ''"
          v-if="successOrderInfo"
          :data="successOrderInfo"
          :list="successWaybillList ?? []"
        ></OrderStatus>
        <!-- 戈壁场景直接显示图片 -->
        <VanImage
          @touchstart.prevent="onTouchStart"
          @touchend="onTouchEnd"
          v-if="isGobi"
          class="gobi-barcode mt-64 mx-32"
          :src="gobiSrc"
        ></VanImage>
        <!-- 非戈壁场景显示运单卡片 -->
        <template v-if="successLoading">
          <div class="waybill-skeleton">
            <img :src="successPageSkeleton" />
          </div>
        </template>
        <template v-else>
          <WaybillInfoCard
            v-if="!isGobi && successWaybillList && successWaybillList.length > 0"
            :orderCompletedPageType="successOrderInfo?.orderCompletedPageType"
            :orderSuccessPageConfig="orderSuccessPageConfig"
            :list="successWaybillList"
          ></WaybillInfoCard>
        </template>

        <!-- 广告 -->
        <Advertisement v-if="showAdvertisement" :ad-list="adList"></Advertisement>
      </div>
      <Footer
        :data="successOrderInfo"
        :orderSuccessPageConfig="orderSuccessPageConfig"
        :waybillList="successWaybillList"
        :waybillNumber="waybillNumber"
      ></Footer>
      <GlobalContact />
    </div>
  </view>
  <ContactBusiness v-model:show="contactBusinessPopupVisible" :phone="contactBusinessPhone" />
  <!-- 默认设置 -->
  <Popup ref="popupRef" :popup-list="popupList"></Popup>
</template>
<script setup lang="tsx">
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import OrderStatus from './components/OrderStatus.vue'
import WaybillInfoCard from './components/WaybillInfoCard.vue'
import Footer from './components/Footer.vue'
import KyNoticeBar from '@order-public-sub-public/components/base/ky-noticebar/index.vue'
import { closeSkeleton } from '@order-public-sub-public/utils/skeleton'
import { useOrderSuccess } from './hooks/useOrderSuccess'
import { getPintAuth } from './hooks/useFooterConfig'
import { computed, onMounted, ref } from 'vue'
import { EmptyTypeEnum, OrderSuccessType, YesOrNoNumber } from '@order-public-sub-public/constants'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { updateInitConfigCache } from '@order-public-sub-root-pages/order-single/utils'
import { getQueryObject, isEmptyText } from '@order-public-sub-public/utils'
import { saveBatchId } from '@order-public-sub-public/configs'
import { useShare } from './hooks/useShare'
import Advertisement from '@order-public-sub-public/components/business/advertisement/index.vue'
import Popup from '@order-public-sub-public/components/business/advertisement/popup.vue'
import { getAdvertisement, loading } from '@order-public-sub-public/components/business/advertisement'
import { onBeforeRouteLeave } from '@order-public-sub-public/vue-router/index'
import { useRealAuth } from '@order-public-sub-root-pages/order-success/hooks/useRealAuth'
import { realAuthReportParams, clkAuthReportParams } from '@order-public-sub-root-pages/order-success/report'
import { isAliPayClient } from '@order-public-sub-public/utils/device'
import { questionShow } from '@/public/components/business/order-question/hooks/index'
import { isWxMiniApp } from '@/public/utils'
import Taro, { useDidShow } from '@tarojs/taro'
import GlobalContact from '@order-public-sub-public/components/business/contact-business/components/global-contact/index.vue'
import { getBatchId } from '@order-public-sub-public/configs'

import '@order-global-package-order-sub/styles/common.scss'
import { onlyNumber } from '@order-public-sub-public/utils/pattern'
import { contactBusinessPopupVisible, contactBusinessPhone } from './hooks/state'

defineOptions({
  name: 'order-success',
})
const successPageSkeleton = 'https://ic-img.ky-express.com/netc/20250619_13487_!!1750314693041_686_391.png'

const {
  isGobi,
  adList,
  popupList,
  gobiSrc,
  netWorkError,
  tipText,
  hasTips,
  waybillNumber,
  successOrderInfo,
  successWaybillList,
  orderSuccessPageConfig,
  getSuccessData,
  getSuccessWaybillData,
  download,
  successLoading,
  initEndFlag,
  resetInitData,
} = useOrderSuccess()

const {
  realAuthTipsText,
  realAuthFlag,
  getSuccessPageTipsData,
  showGoRealNameFlag,
  goRealNameAuth,
  realNameButtonType,
  shareRealName,
} = useRealAuth()

const popupRef = ref<InstanceType<typeof Popup>>()

// 判断是否是审核中状态
const authVisible = computed(() => {
  return successOrderInfo.value?.orderCompletedPageType
    ? [OrderSuccessType['调价审核'], OrderSuccessType['运单审核']].includes(
        successOrderInfo.value.orderCompletedPageType,
      )
    : false
})

// 支付宝环境下不展示广告
const showAdvertisement = computed(() => {
  return !isAliPayClient
})

/**
 * 分发 去认证 和 转发他人实名
 */
const realNameFun = () => {
  const senderMobile = successWaybillList.value?.[0]?.waybillDelivery?.mobile || ''
  realNameButtonType.value === YesOrNoNumber.NO
    ? shareRealName(waybillNumber.value, senderMobile)
    : goRealNameAuth(waybillNumber.value)
}

const setBatchIdFromUrl = () => {
  const { batchId } = getQueryObject()
  saveBatchId(batchId, false, {
    fromType: 'setBatchIdFromUrl',
  })
}

// 进入下单成功页先设置batchId
setBatchIdFromUrl()

const timer = ref<number>()

const onTouchStart = () => {
  timer.value = setTimeout(function () {
    download(gobiSrc.value)
  }, 300)
}

const onTouchEnd = () => {
  clearTimeout(timer.value)
}

const { wxInitShare } = useShare()

onBeforeRouteLeave(() => {
  loading.value = false
})

onMounted(async () => {
  const batchId = getBatchId()?.replace(/\s+/g, '')
  console.log('batchId--', batchId)
  if (batchId && batchId.length > 6 && onlyNumber.test(batchId)) {
    // 解决二维码下单 继续下单参数丢失报错问题（会使用原生扫码）
    questionShow.setQuestionStatus(false)
    resetInitData()
    loading.value = false
    getPintAuth()
    getSuccessPageTipsData()
    await getSuccessData()
    if (authVisible.value) {
      Taro.setNavigationBarTitle({ title: '提交成功' })
    }
    closeSkeleton()
    await getSuccessWaybillData()
    wxInitShare(waybillNumber.value)
    const result = await getAdvertisement()
    adList.value = result.adList
    popupList.value = result.popupList
    if (popupList.value.length) {
      popupRef.value?.open()
    }
    updateInitConfigCache()
  }
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
