<template>
  <view class="flex column h-screen order-win-box" id="order-success-page">
    <!-- <ky-navbar :leftArrow="true" :title="authVisible ? '提交成功' : '下单成功'" v-if="isWxMiniApp"></ky-navbar> -->
    <div class="order-page flex-column space-between h-full">
      <KyEmpty v-if="netWorkError" :type="EmptyTypeEnum.NETWORK">
        <KyButton
          loadingType="plain"
          text="重新加载"
          loading-text="重新加载"
          class="reload-btn"
          @click="initSuccessData"
        ></KyButton>
      </KyEmpty>
      <div v-else class="content">
        <KyReport eventCode="other_express_result_perception_v1"></KyReport>
        <!-- 实名认证提示条 -->
        <div
          class="order-success-notice-bar"
          v-if="!realAuthFlag && realAuthTipsText && initEndFlag"
          :scrollable="false"
          wrapable
        >
          <div class="order-success-notice-wrap">
            {{ realAuthTipsText }}
          </div>
          <div v-if="showGoRealNameFlag && successOrderInfo" @click="clkAuthReportParams(realNameButtonType)">
            <!-- 注意 微信小程序环境下，需要使用button调起分享 -->
            <!-- <KyReport
              eventCode="exp_express_result_kyc"
              :otherParams="{ kyc_type: realNameButtonType === YesOrNoNumber.YES ? '去认证' : '转发他人实名' }"
            ></KyReport> -->
            <template v-if="!isH5FSEnv">
              <!-- 转发他人实名 - 微信小程序端-->
              <ky-button
                v-if="realNameButtonType !== YesOrNoNumber.YES && isWechatEnv"
                class="go_real_bg"
                :class="btnDivClass"
                open-type="share"
                id="go_real"
                :text="btnDivText"
              >
              </ky-button>
              <div v-else class="go_real_bg" @click="realNameFun" :class="btnDivClass">
                {{ btnDivText }}
              </div>
            </template>
            <template v-else>
              <div
                v-if="realNameButtonType === YesOrNoNumber.YES"
                class="go_real_bg"
                @click="realNameFun"
                :class="btnDivClass"
              >
                {{ btnDivText }}
              </div>
            </template>
          </div>
        </div>
        <!-- 未绑码提示条 -->
        <KyNoticeBar
          v-if="initEndFlag && realAuthFlag && tipText && successWaybillList && successWaybillList.length > 0"
        >
          <div v-html="tipText"></div>
        </KyNoticeBar>
        <!-- 审核中等待状态 -->
        <AuditWaiting v-if="isAuditing" />
        <OrderStatus
          :class="hasTips ? 'order-status-tips' : ''"
          v-if="successOrderInfo && !isAuditing"
          :data="successOrderInfo"
          :list="successWaybillList ?? []"
        ></OrderStatus>
        <!-- 戈壁场景直接显示图片 -->
        <!-- <VanImage
          @touchstart.prevent="onTouchStart"
          @touchend="onTouchEnd"
          v-if="isGobi"
          class="gobi-barcode mt-64 mx-32"
          :src="gobiSrc"
        ></VanImage> -->
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
          >
            <template #bottom>
              <!-- 保存模板横幅（寄件模板无值场景） -->
              <div class="save-template-banner" v-if="showSaveBanner" @click="toSaveTemplate(true)">
                <img
                  class="banner-icon"
                  src="https://ic-img.ky-express.com/netc/20260907_6018_!!1788769070403_144_144.png"
                  alt=""
                />
                <div class="banner-left">
                  <div class="banner-main">保存为「寄件模板」</div>
                  <div class="banner-sub">保存为寄件模板，下次寄件直接用</div>
                </div>
                <KyButton class="banner-button" size="small" type="primary" text="保存模板" plain />
              </div>
            </template>
          </WaybillInfoCard>
        </template>

        <!-- 广告 -->
        <Advertisement v-if="showAdvertisement" :ad-list="adList"></Advertisement>
      </div>
      <Footer
        v-show="!netWorkError"
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
import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'
// import KyReport from '@order-public-sub-public/components/base/ky-report/index.vue'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import OrderStatus from './components/OrderStatus.vue'
import WaybillInfoCard from './components/WaybillInfoCard.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import Footer from './components/Footer.vue'
import KyNoticeBar from '@order-public-sub-public/components/base/ky-noticebar/index.vue'
import AuditWaiting from './components/auditWaiting/index.vue'
// import { closeSkeleton } from '@order-public-sub-public/utils/skeleton'
import { useOrderSuccess, extInfo } from './hooks/useOrderSuccess'
import { toSaveTemplate, getPintAuth } from './hooks/useFooterConfig'
import { computed, onMounted, ref, onBeforeMount } from 'vue'
import { EmptyTypeEnum, OrderSuccessType, YesOrNoNumber, Channel } from '@order-public-sub-public/constants'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
// import { updateInitConfigCache } from './utils'
import { getQueryObject } from '@order-public-sub-public/utils'
import { saveBatchId } from '@order-public-sub-public/configs'
// import { useShare } from './hooks/useShare'
import Advertisement from '@order-public-sub-public/components/business/advertisement/index.vue'
import Popup from '@order-public-sub-public/components/business/advertisement/popup.vue'
import { getAdvertisement, loading } from '@order-public-sub-public/components/business/advertisement'
import { onBeforeRouteLeave } from '@order-public-sub-public/vue-router/index'
import { useRealAuth } from './hooks/useRealAuth'
import { clkAuthReportParams, btnReportStatusMap, exp_express_result_default_setting_popup_v1 } from './report/index'
import { isAliPayClient } from '@order-public-sub-public/utils/device'
import { questionShow } from '@/public/components/business/order-question/hooks/index'
import { isWechatEnv, isH5FSEnv } from '@/public/utils'
import Taro, { ShareAppMessageObject, useShareAppMessage } from '@tarojs/taro'
import GlobalContact from '@order-public-sub-public/components/business/contact-business/components/global-contact/index.vue'
import { getBatchId } from '@order-public-sub-public/configs'
import { getOnlineH5Url } from '@order-public-sub-public/utils/env'
// import { pureBatteryFileUploadConfirm } from '@order-public-sub-public/components/business/product-info/components/goods-type-files/hooks'

import '@order-global-package-order-sub/styles/common.scss'
import { onlyNumber } from '@order-public-sub-public/utils/pattern'
import { contactBusinessPopupVisible, contactBusinessPhone } from './hooks/state'
import { getShareRealNameParams, defaultRealNameParams } from '@order-public-sub-public/utils/share'
import { getNotifyReceiveShareWx } from '@public/hooks/useNotifyReceiveShare'
import { getChannel } from '@order-public-sub-public/configs'
import { baseReportInstance } from '@order-public-sub-public/reportUmp'
import { initGlobalClickListener } from '@public/utils/report/reportPerformance'

defineOptions({
  name: 'order-success',
})
const successPageSkeleton = 'https://ic-img.ky-express.com/netc/20250619_13487_!!1750314693041_686_391.png'

const {
  isGobi,
  adList,
  popupList,
  // gobiSrc,
  netWorkError,
  tipText,
  hasTips,
  waybillNumber,
  successOrderInfo,
  successWaybillList,
  orderSuccessPageConfig,
  getSuccessData,
  getSuccessWaybillData,
  // download,
  successLoading,
  initEndFlag,
  resetInitData,
  isAuditing,
} = useOrderSuccess()

const {
  realAuthTipsText,
  realAuthFlag,
  getSuccessPageTipsData,
  showGoRealNameFlag,
  goRealNameAuth,
  realNameButtonType,
  shareRealName,
  extraData,
} = useRealAuth()

const popupRef = ref<InstanceType<typeof Popup>>()

const btnDivClass = computed(() => {
  // 有积分 展示背景图片
  if (extraData.value?.pointsAmount) {
    return 'go_real_gifts'
  }
  return realNameButtonType.value === YesOrNoNumber.YES ? 'go_real_auth' : 'go_real_auth_share'
})
const btnDivText = computed(() => {
  if (extraData.value?.pointsAmount) {
    return ''
  }
  // clkAuthReportParams(realNameButtonType.value)
  return realNameButtonType.value === YesOrNoNumber.YES ? '去认证' : '转发他人实名'
})

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

// 保存模板横幅（寄件模板无值场景，网络错误态不展示）
const showSaveBanner = computed(() => extInfo.value.showSaveBanner === true && !netWorkError.value)

/**
 * 分发 去认证 和 转发他人实名
 */
const realNameFun = () => {
  const senderMobile = successWaybillList.value?.[0]?.waybillDelivery?.mobile || ''
  if (realNameButtonType.value === YesOrNoNumber.YES) {
    goRealNameAuth(waybillNumber.value)
  } else {
    shareRealName(waybillNumber.value, senderMobile)
  }
}
useShareAppMessage((res: ShareAppMessageObject) => {
  console.log('useShareAppMessage', res)
  if (isWechatEnv && ['button', 'menu'].includes(res.from)) {
    if (res.target?.id === 'go_real') {
      const senderMobile = successWaybillList.value?.[0]?.waybillDelivery?.mobile || ''
      const params = defaultRealNameParams(senderMobile)
      const promise = new Promise(async (resolve) => {
        const res = await getShareRealNameParams(waybillNumber.value, senderMobile)
        resolve(res)
      })
      return {
        ...params,
        promise,
      }
    } else {
      const params = {
        waybillNumber: waybillNumber.value,
        onlineH5Url: getOnlineH5Url(),
        isPageShare: true,
      }
      return getNotifyReceiveShareWx(res, params)
    }
  }
})

const setBatchIdFromUrl = () => {
  const { batchId } = getQueryObject()
  saveBatchId(batchId, false, {
    fromType: 'setBatchIdFromUrl',
  })
}

// 进入下单成功页先设置batchId
setBatchIdFromUrl()

onBeforeRouteLeave(() => {
  loading.value = false
})
onBeforeMount(() => {
  baseReportInstance.add('waybill_number', waybillNumber.value)
})
onMounted(() => {
  initSuccessData()
  btnReportStatusMap.value = {}
  initGlobalClickListener({
    pageId: 'order-success-page',
  })
})

const initSuccessData = async () => {
  const batchId = getBatchId()?.replace(/\s+/g, '')
  const channel = getChannel()
  console.log('batchId--', batchId)
  // 这里是为了处理纯电池上传完文件后，需要给下单接口传一个表示，当下单接口调用完后，需要将这个值还原
  // pureBatteryFileUploadConfirm.value = YesOrNoString.NO
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
    // closeSkeleton()

    await getSuccessWaybillData()
    if (channel === Channel.修改运单) {
      Taro.setNavigationBarTitle({ title: '修改成功' })
    }
    if (successOrderInfo.value?.orderCompletedPageType === OrderSuccessType.保存草稿) {
      Taro.setNavigationBarTitle({ title: '保存成功' })
    }
    if (successOrderInfo.value?.orderCompletedPageType === OrderSuccessType.托寄物审核) {
      Taro.setNavigationBarTitle({ title: '下单审核' })
    }

    // wxInitShare(waybillNumber.value)
    const result = await getAdvertisement()
    adList.value = result.adList
    popupList.value = result.popupList
    if (popupList.value.length) {
      popupRef.value?.open()
      exp_express_result_default_setting_popup_v1()
    }
    // updateInitConfigCache()
  }
}
</script>

<style lang="scss" scoped></style>
