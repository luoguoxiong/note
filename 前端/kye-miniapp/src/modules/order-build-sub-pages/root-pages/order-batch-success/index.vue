<template>
  <!-- 下单成功页 -->
  <div class="order_batch_success order-page h-full flex-column space-between">
    <KyLoading class="order-loading" v-if="loading" text="加载中..." />
    <KyEmpty v-if="netWorkError" :type="EmptyTypeEnum.NETWORK"></KyEmpty>
    <div v-if="!netWorkError && (tipText || realAuthTipsText)">
      <!-- 实名认证提示条 -->
      <van-notice-bar
        class="notice-bar"
        v-if="!realAuthFlag"
        :scrollable="false"
        wrapable
        v-exposure-report="realAuthReportParams(showGoRealNameFlag)"
      >
        <template v-slot:default>
          <slot>
            {{ realAuthTipsText }}
          </slot>
        </template>
        <template v-slot:right-icon v-if="showGoRealNameFlag">
          <div class="go_real_auth" @click="goRealNameAuth" v-click-report="clkAuthReportParams()">去认证</div>
        </template>
      </van-notice-bar>
      <!-- 未绑码提示条 -->
      <KyNoticeBar v-if="realAuthFlag && tipText && successOrderInfo && successOrderInfo.resultType">
        <div v-html="tipText"></div>
      </KyNoticeBar>
    </div>
    <div v-if="!netWorkError" class="content">
      <OrderStatus
        :class="hasTips ? 'order-status-tips' : ''"
        v-if="successOrderInfo && successOrderInfo.resultType"
        :data="successOrderInfo"
        :list="successWaybillList || []"
        :activeTab="activeTab"
        :orderInfoList="orderInfoList || []"
        :orderTitle="orderTitle"
      ></OrderStatus>
      <AllFailed v-if="failedStatus === 30" :failuresNumber="failuresNumber" />
      <div
        v-if="failuresNumber && failedStatus !== 30"
        class="order-failed-content"
        :class="{ 'line-bg': singleState }"
      >
        <div class="order-failed-wrapper flex font-special">
          <SvgIcon name="error-tip2"></SvgIcon>
          <div class="order-failed-text">下单失败{{ failuresNumber }}票，可重新下单</div>
          <div class="order-failed-save" @click="failReorder()">重新下单</div>
          <SvgIcon name="right-arrow-fail"></SvgIcon>
        </div>
      </div>
      <!-- step1: 展示tabs -->
      <div
        v-if="successWaybillList && successWaybillList.length > 0 && failuresNumber === 0"
        class="h-40 bg1"
        :class="{ 'line-bg': singleState }"
      ></div>
      <div
        class="order_batch_success-content"
        :class="{ 'order_batch_success-tabs-content': !singleState }"
        v-if="successWaybillList && successWaybillList.length > 0"
      >
        <!-- step1: 单纯展示列表，不展示tabs -->
        <div v-if="singleState">
          <WaybillInfoCard
            type="list"
            :orderCompletedPageType="successOrderInfo?.orderCompletedPageType"
            :orderSuccessPageConfig="orderSuccessPageConfig"
            :list="successWaybillList"
            :promptInfo="orderInfoList?.[0].promptInfo || ''"
            :isShowBarcode="true"
            :isShowShare="true"
            :isShowGoods="true"
          ></WaybillInfoCard>
        </div>
        <!-- step2: 展示tabs -->
        <div v-else class="content_tabs">
          <van-tabs v-model:active="activeTab">
            <van-tab
              v-for="(item, index) in renderTabList"
              :key="index"
              :title="item.label"
              :name="item.name"
              title-class="ky-van-tab-item"
            >
              <WaybillInfoCard
                v-if="item.list"
                type="tab"
                :orderCompletedPageType="item.name"
                :orderSuccessPageConfig="orderSuccessPageConfig"
                :list="item.list"
                :promptInfo="item.promptInfo"
                :isShowBarcode="true"
                :isShowShare="true"
                :isShowGoods="true"
              ></WaybillInfoCard>
            </van-tab>
          </van-tabs>
        </div>

        <!-- 底部广告 -->
        <Advertisement :ad-list="adList"></Advertisement>
        <!-- 默认设置 -->
        <Popup ref="popupRef" :popup-list="popupList"></Popup>
      </div>
    </div>

    <Footer class="order_batch_success-footer" :data="successOrderInfo" :waybillNumber="waybillNumber"></Footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import OrderStatus from './components/OrderStatus.vue'
import WaybillInfoCard from './components/WaybillInfoCard.vue'
import Footer from './components/Footer.vue'
import KyNoticeBar from '@order-public-sub-public/components/base/ky-noticebar/index.vue'
import { closeSkeleton } from '@order-public-sub-public/utils/skeleton'
import { useOrderSuccess, getSuccessData } from './hooks/useOrderSuccess'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import AllFailed from './components/AllFailed.vue'
import KyLoading from '@order-public-sub-public/components/base/ky-loading/index.vue'
import { failReorder, getPintAuth } from './hooks/useFooterConfig'
import { getQueryObject } from '@order-public-sub-public/utils'
import { saveBatchId } from '@order-public-sub-public/configs'
import Advertisement from '@order-public-sub-public/components/business/advertisement/index.vue'
import Popup from '@order-public-sub-public/components/business/advertisement/popup.vue'
import { getAdvertisement, loading as batchAdLoading } from '@order-public-sub-public/components/business/advertisement'
import { onBeforeRouteLeave } from '@order-public-sub-public/vue-router/index'
import { useRealAuth } from '@order-public-sub-root-pages/order-success/hooks/useRealAuth'
import { clkAuthReportParams, realAuthReportParams } from '@order-public-sub-root-pages/order-success/report'

const failuresNumber = ref(0)
const orderTitle = ref('')
const loading = ref(false)
const failedStatus = ref(0)
defineOptions({
  name: 'order-batch-success',
})

const {
  adList,
  popupList,
  netWorkError,
  tipText,
  hasTips,
  waybillNumber,
  successOrderInfo,
  successWaybillList,
  orderSuccessPageConfig,
  singleState,
  renderTabList,
  activeTab,
  orderInfoList,
} = useOrderSuccess()

const { realAuthTipsText, realAuthFlag, getSuccessPageTipsData, showGoRealNameFlag, goRealNameAuth } = useRealAuth()

const popupRef = ref<InstanceType<typeof Popup>>()

const setBatchIdFromUrl = () => {
  const { batchId } = getQueryObject()
  saveBatchId(batchId, false, {
    fromType: 'setBatchIdFromUrl',
  })
}

// 进入下单成功页先设置batchId
setBatchIdFromUrl()

onBeforeRouteLeave(() => {
  batchAdLoading.value = false
})

onMounted(async () => {
  batchAdLoading.value = false
  loading.value = true
  realAuthFlag.value = true
  orderInfoList.value = []
  console.log('realAuthFlag: ', realAuthFlag)
  getPintAuth()
  getSuccessPageTipsData()
  try {
    const data = await getSuccessData()
    failuresNumber.value = data ? data.failuresNumber : 0
    orderTitle.value = data ? data.orderTitle : ''
    failedStatus.value = data?.status || 10
    closeSkeleton()
  } finally {
    loading.value = false
    if (failedStatus.value === 30) {
      document.title = '下单失败'
    }
  }
  const result = await getAdvertisement()
  adList.value = result.adList
  popupList.value = result.popupList
  if (popupList.value.length) {
    popupRef.value?.open()
  }
})
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
