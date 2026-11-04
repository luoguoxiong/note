<template>
  <div class="waybill-info-card mx-32 mt-40">
    <section :key="waybill.waybillNumber" v-for="waybill in waybillList" class="card w-full">
      <!-- 运单号头部 -->
      <header class="waybill flex items-center space-between px-24">
        <div class="flex items-center">
          <div class="color-sub-title">运单号</div>
          <div v-copy="waybill.waybillNumber" class="waybill-number ml-16 mr-12">{{ waybill.waybillNumber }}</div>
          <SvgIcon v-copy="waybill.waybillNumber" class="ky-icon" name="icon-copy"></SvgIcon>
          <SvgIcon
            v-if="waybill.waybillFlag && waybill.waybillFlag !== WaybillFlagType.普通运单"
            class="icon-tag ml-20"
            :name="waybill.waybillFlag === WaybillFlagType.去程单 ? 'go-waybill' : 'return-waybill-order'"
          ></SvgIcon>
        </div>
        <div
          v-if="isShowBarcodeFun(waybill)"
          class="flex items-center pointer"
          @click="showQrcode(waybill.waybillCodeUrl)"
        >
          <SvgIcon class="ky-icon" name="icon-send-qrcode2"></SvgIcon>
          <div class="color-purple ml-5">寄件码</div>
        </div>
      </header>
      <!-- 寄收信息 -->
      <main @click="handleCardClick(waybill.waybillNumber)" class="content flex-column mt-24 pb-24">
        <div class="mx-24">
          <AddressInfo
            type="delivery"
            :waybillNumber="waybill.waybillNumber"
            :waybillInfo="waybill.waybillDelivery"
            :showRealName="!realAuthFlag && waybill.waybillFlag !== WaybillFlagType.返程单"
          ></AddressInfo>

          <AddressInfo
            type="pickup"
            :waybillInfo="waybill.waybillPickup"
            :waybillNumber="waybill.waybillNumber"
          ></AddressInfo>
          <div class="split-addr-extra-line"></div>
          <ExtraInfo :waybill="waybill" />
        </div>
      </main>
      <slot v-if="waybill.waybillFlag !== WaybillFlagType.返程单" name="bottom"></slot>
    </section>
    <!-- 寄件码弹窗 -->
    <QrCode v-model:visible="qrCodeVisible" :src="src"></QrCode>
  </div>
</template>
<script setup lang="ts">
import { OrderSuccessPageConfig, PickupType, SuccessWaybill } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import vCopy from '@order-public-sub-public/directives/copy'
import AddressInfo from './AddressInfo.vue'
import ExtraInfo from './ExtraInfo.vue'
import QrCode from './QrCode.vue'
import { OrderSuccessType, WaybillFlagType } from '@order-public-sub-public/constants'
import { computed, ref, reactive, watchEffect } from 'vue'
import { goWaybillRoute } from '../hooks/useFooterConfig'
import { useRealAuth } from '../hooks/useRealAuth'

const props = defineProps<{
  list: SuccessWaybill[]
  orderCompletedPageType?: OrderSuccessType
  orderSuccessPageConfig: OrderSuccessPageConfig
}>()

const { realAuthFlag } = useRealAuth()

// 判断是否是审核中状态
const authVisible = computed(() =>
  props.orderCompletedPageType
    ? [OrderSuccessType['调价审核'], OrderSuccessType['运单审核'], OrderSuccessType['托寄物审核']].includes(
        props.orderCompletedPageType,
      )
    : false,
)

// 下单失败:卡片不可点击跳转
const isFailed = computed(() => props.orderCompletedPageType === OrderSuccessType.下单失败)
const handleCardClick = (waybillNumber: string) => {
  if (isFailed.value) return
  goWaybillRoute(waybillNumber, authVisible.value)
}

const stop = watchEffect(() => {
  // 如果是审核中，文档标题为提交成功
  if (authVisible.value) {
    document.title = '提交成功'
    stop && stop()
  }
})

const waybillList = reactive<SuccessWaybill[]>(
  props.list.map((waybill) => {
    return {
      ...waybill,
      shareVisible: false,
    }
  }),
)

// 是否显示寄件码，当运单需要审核时不显示
const showBarcode = computed(() => {
  const barcode = props.orderSuccessPageConfig?.showBarcode
  const flag = barcode?.toString() === 'true' ? true : false
  return flag && !authVisible.value
})

const isShowBarcodeFun = (waybill: SuccessWaybill) => {
  return (
    waybill.waybillCodeUrl &&
    showBarcode.value &&
    waybill?.pickupMode?.pickupMode !== PickupType.服务点自寄 &&
    props?.orderCompletedPageType !== OrderSuccessType.保存草稿
  )
}

const qrCodeVisible = ref(false)

const src = ref('')

/**
 * @description 显示寄件码
 * @param url
 */
const showQrcode = (url: string) => {
  src.value = url
  qrCodeVisible.value = true
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
