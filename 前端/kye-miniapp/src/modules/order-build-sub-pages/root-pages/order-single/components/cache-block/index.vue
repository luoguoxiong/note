<template>
  <!--  <ky-navbar v-if="isWxMiniApp" :leftArrow="true" title="快速寄件"></ky-navbar>-->
  <view class="order-page-container masker_root_order">
    <view class="order-content" id="orderContent" v-if="cacheNeedRender">
      <div class="block" v-if="cacheNeedRender?.Banner?.visible">
        <div class="row">
          <Banner v-bind="cacheNeedRender?.Banner" />
        </div>
      </div>
      <div class="block">
        <div class="row">
          <OrderCustomer v-if="cacheNeedRender?.OrderCustomer" :cacheCustomerValue="cacheCustomerValue" />
        </div>
      </div>
      <div class="block block-template-list">
        <div class="row">
          <TemplateList v-bind="cacheNeedRender?.TemplateList" />
        </div>
      </div>
      <div class="block">
        <div class="row">
          <Sender v-bind="cacheNeedRender?.Sender" />
          <Receive v-bind="cacheNeedRender?.Receive" />
        </div>
      </div>
      <div class="block">
        <div class="row">
          <!--          寄件方式-->
          <!--          <PickupMode v-bind="cacheNeedRender?.PickupMode" />-->
          <PickupModeFallback
            v-if="
              moduleDimension?.pickupMode?.pickupModeList?.length &&
              showPickupMode &&
              cacheNeedRender?.PickupMode.visible
            "
            v-bind="cacheNeedRender?.PickupMode"
          />
          <!--          货好时间-->
          <!--          <GoodsTime v-bind="cacheNeedRender?.GoodsTime" />-->
          <GoodsTimeFallback v-bind="cacheNeedRender?.GoodsTime" />

          <!--          付款方式-->
          <!--          <PayMode v-bind="cacheNeedRender?.PayMode" />-->
          <PayModeFallback v-bind="cacheNeedRender?.PayMode" />
          <!--          托寄物-->
          <ProductInfo
            v-if="cacheNeedRender?.ProductInfo?.moduleStyle === ModuleStyle.平铺"
            v-bind="cacheNeedRender?.ProductInfo"
          />
          <ProductInfoFallback v-else v-bind="cacheNeedRender?.ProductInfo" />
          <!--          服务方式-->
          <!--          <ServiceMode v-bind="cacheNeedRender?.ServiceMode" />-->
          <ServiceModeFallback v-bind="cacheNeedRender?.ServiceMode" />
          <!--          自定义编码-->
          <!--          <KaCustomerMap v-bind="cacheNeedRender?.KaCustomerMap" />-->
          <KaCustomerMapFallback
            v-bind="{
              ...cacheNeedRender?.KaCustomerMap,
              moduleDimension: moduleDimension?.kaCustomerMap,
              required: kaCustomerMapRequired,
            }"
          />
        </div>
      </div>
      <div class="block" v-if="deferRender">
        <div class="row">
          <ReturnWaybillFallback v-if="returnWaybill" v-bind="cacheNeedRender?.ReturnWaybill" />
        </div>
      </div>
      <div class="block" v-if="deferRender">
        <div class="row">
          <!--          <ProtectPrice v-bind="cacheNeedRender?.ProtectPrice" />-->
          <ProtectPriceFallback v-bind="cacheNeedRender?.ProtectPrice" />
          <AddedService v-bind="cacheNeedRender?.AddedService" />
        </div>
      </div>
    </view>
    <view style="position: relative" v-if="cacheNeedRender">
      <OrderFooter class="" />
    </view>
  </view>
  <Skeleton v-if="!cacheNeedRender" :show-image="skeletonImage" />
</template>
<script setup lang="ts">
import Sender from '@order-public-sub-public/components/business/sender/index.vue'
import OrderCustomer from '@order-public-sub-public/components/business/order-customer/index.vue'
import Receive from '@order-public-sub-public/components/business/receive/index.vue'
import TemplateList from '@order-public-sub-public/components/business/template-list/index.vue'
import Banner from '@order-public-sub-public/components/business/banner/index.vue'
// import ServiceMode from '@order-public-sub-public/components/business/service-model/index.vue'
import ServiceModeFallback from '@order-public-sub-public/components/business/service-model/fallback-view/index.vue'
import ProductInfo from '@order-public-sub-public/components/business/product-info/index.vue'
import ProductInfoFallback from '@order-public-sub-public/components/business/product-info/fallback-view/index.vue'
// import PayMode from '@order-public-sub-public/components/business/pay-mode/index.vue'
import PayModeFallback from '@order-public-sub-public/components/business/pay-mode/fallback-view/index.vue'
// import GoodsTime from '@order-public-sub-public/components/business/goods-time/index.vue'
import GoodsTimeFallback from '@order-public-sub-public/components/business/goods-time/fallback-view/index.vue'
// import KaCustomerMap from '@order-public-sub-public/components/business/ka-customer-map/index.vue'
import KaCustomerMapFallback from '@order-public-sub-public/components/business/ka-customer-map/fallback-view/index.vue'
import AddedService from '@order-public-sub-public/components/business/added-service/index.vue'
// import ProtectPrice from '@order-public-sub-public/components/business/protect-price/index.vue'
import ProtectPriceFallback from '@order-public-sub-public/components/business/protect-price/fallback-view/index.vue'
// import ReturnWaybill from '@order-public-sub-public/components/business/return-waybill/index.vue'
import ReturnWaybillFallback from '@order-public-sub-public/components/business/return-waybill/fallback-view/index.vue'
// import PickupMode from '@order-public-sub-public/components/business/pickup-mode/index.vue'
import PickupModeFallback from '@order-public-sub-public/components/business/pickup-mode/fallback-view/index.vue'

import { onBeforeMount, ref } from 'vue'
import { getCacheInitData } from '@order-public-sub-root-pages/order-single/utils'
import { decryptModuleConfig } from '@order-public-sub-root-pages/order-single/hooks/utils'
import { actionsAfterInitConfig, orderHomeRoute } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { Module, PlainObject } from '@order-public-sub-public/types'
import { saveWaybillInfo } from '@order-public-sub-public/hooks/useStaticAndDynamicData'
import OrderFooter from '@order-public-sub-root-pages/order-single/components/orderFooter.vue'

import Skeleton from '@order-public-sub-root-pages/order-single/components/skeleton/index.vue'
import { ModuleStyle } from '@order-public-sub-public/constants'
import { Channel } from '@order-public-sub-public/constants'
import { getQueryObject } from '@order-public-sub-public/utils'

const cacheNeedRender: Record<string, Module> | PlainObject | null = ref(null)
const deferRender = ref(true)
const skeletonImage = ref(false)
const moduleDimension = ref({})
const returnWaybill = ref(false)
const kaCustomerMapRequired = ref(false)
const cacheCustomerValue = ref(undefined)
const showPickupMode = ref(true)

onBeforeMount(() => {
  const { channel } = orderHomeRoute.value || getQueryObject()
  const data = getCacheInitData()
  if (!data || (channel !== Channel.快速寄件 && channel !== Channel.修改运单 && channel)) {
    skeletonImage.value = true
    return
  }
  const { processCheckResponse, pageInitConfigResponse } = data || {}
  returnWaybill.value = processCheckResponse?.configDimension?.dynamicConfig?.returnWaybill?.visible
  showPickupMode.value = processCheckResponse?.configDimension?.dynamicConfig?.pickupModeExtraInfo?.visible !== false

  // const { handleInitData } = useStaticAndDynamicData()
  // handleInitData(processCheckResponse)
  moduleDimension.value = processCheckResponse?.moduleDimension
  //自定义编码的必填
  moduleDimension.value?.kaCustomerMap?.rows?.forEach((row) => {
    if (row?.requiredStatus) {
      kaCustomerMapRequired.value = true
    }
  })
  cacheCustomerValue.value = processCheckResponse?.moduleDimension?.orderCustomer
  console.log(
    'processCheckResponse?.moduleDimension?.orderCustomer',
    processCheckResponse?.moduleDimension?.orderCustomer,
  )
  //渲染配置
  const decryptedSchema = decryptModuleConfig(data?.pageInitConfigResponse.configDimension?.staticConfig?.schema)
  cacheNeedRender.value = decryptedSchema.module
  console.log('测试数据', cacheNeedRender.value)
  //运单数据
  if (processCheckResponse && channel !== Channel.修改运单) {
    saveWaybillInfo(processCheckResponse)
  }
  if (pageInitConfigResponse) {
    actionsAfterInitConfig(pageInitConfigResponse)
  }
  setTimeout(() => {
    deferRender.value = true
  }, 100)
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './../../index.scss';
</style>
