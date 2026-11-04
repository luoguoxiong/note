<template>
  <div class="mx-32 waybill-info-card-wrap" :class="{ 'first-no-mt': type === 'list' }">
    <div v-if="promptInfo" class="waybill-tab-prompt font-special flex">
      <div>{{ promptInfo }}</div>
    </div>
    <section
      :key="waybill.waybillNumber"
      v-for="(waybill, index) in waybillList"
      class="card w-full"
      :class="showRadioChecked ? 'card-radio' : ''"
    >
      <!-- 运单号头部 -->
      <header class="waybill flex items-center space-between px-24">
        <div class="flex items-center">
          <div class="color-sub-title">运单号</div>
          <div class="waybill-number mx-16">{{ waybill.waybillNumber }}</div>
          <SvgIcon v-copy="waybill.waybillNumber" class="ky-icon" name="icon-copy"></SvgIcon>
        </div>
        <div v-if="isShowBarcodeFun(waybill)" class="flex items-center">
          <SvgIcon class="ky-icon" name="icon-send-qrcode2"></SvgIcon>
          <div @click="showQrcode(waybill.waybillCodeUrl)" class="color-purple ml-5">寄件码</div>
        </div>
      </header>
      <!-- 寄收信息 -->
      <main class="content-card flex-column items-center px-24 mt-24" @click="handleToDetailPage(waybill)">
        <div class="h-140 h-full w-full flex items-center">
          <div class="items-check" v-if="showRadioChecked">
            <SvgIcon v-if="waybill?.waybillRadioChecked" class="items-check-icon" name="radio-checked"></SvgIcon>
            <SvgIcon v-else class="items-check-icon" name="radio-unchecked"></SvgIcon>
          </div>
          <div class="flex-1 flex items-center space-between">
            <AddressInfo type="delivery" :waybillInfo="waybill.waybillDelivery"></AddressInfo>
            <div class="flex-column flex-center">
              <div :class="authTextClass" v-if="authVisible">审核中</div>
              <SvgIcon class="icon-arrow" :name="iconName"></SvgIcon>
              <div class="service-mode-text">{{ waybill.serviceModeText }}</div>
            </div>
            <AddressInfo type="pickup" :waybillInfo="waybill.waybillPickup"></AddressInfo>
          </div>
        </div>
        <!-- 托寄物 -->
        <div class="goods-container w-full flex mt-20 align-self-start" v-if="isShowGoods">
          <div class="goods-title color-sub-title">托寄物：</div>
          <div class="flex goods">
            <div class="goods-type">{{ waybill.goodsType }}</div>
            <span>/</span>
            <span>{{ waybill.actualWeight }}kg/</span>
            <span>{{ waybill.count }}件</span>
          </div>
        </div>
      </main>
      <!-- 通知收件人 -->
      <div class="px-24 pb-20 flex flex-column" v-if="needShare && isShowShare">
        <VanDivider class="divider"></VanDivider>
        <KyButton
          @click="shareWaybill(index)"
          class="button-normal align-self-end items-end"
          plain
          size="small"
          text="通知收件人"
        ></KyButton>
      </div>
      <!-- 通知收件人 -->
      <ShareWaybill :waybill-number="waybill.waybillNumber"></ShareWaybill>
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
import QrCode from './QrCode.vue'
import { OrderSuccessType } from '@order-public-sub-public/constants'
import { computed, ref } from 'vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import ShareWaybill from '@order-public-sub-root-pages/order-success/components/ShareWaybill.vue'
import { useShare } from '../hooks/useShare'
import { $native, getH5OrderUrl } from '@order-public-sub-public/utils'
import { getOnlineH5Url } from '@order-public-sub-public/utils/env'
import { openURL } from '@/modules/webview/utils'
const props = defineProps<{
  list: SuccessWaybill[]
  orderCompletedPageType?: OrderSuccessType
  orderSuccessPageConfig: OrderSuccessPageConfig
  promptInfo: string | undefined
  isShowBarcode?: boolean
  isShowShare?: boolean
  isShowGoods?: boolean
  showRadioChecked?: boolean
  type?: string
}>()

const emit = defineEmits(['radioChecked'])

// 判断是否是审核中状态
const authVisible = computed(() =>
  props.orderCompletedPageType
    ? [OrderSuccessType['调价审核'], OrderSuccessType['运单审核']].includes(props.orderCompletedPageType)
    : false,
)

// const stop = watchEffect(() => {
//   // 如果是审核中，文档标题为提交成功
//   if (authVisible.value) {
//     document.title = '提交成功'
//     stop()
//   }
// })

// 根据审核中状态决定显示icon
const iconName = computed(() => `service-mode-arrow${authVisible.value ? '-auth' : ''}`)

const authTextClass = computed(() => ['font-level5', authVisible.value ? 'color-warning' : ''])

// const waybillList = reactive<SuccessWaybill[]>(
//   props.list.map((waybill) => {
//     return {
//       ...waybill,
//       shareVisible: false,
//     }
//   })
// )
const waybillList = computed<SuccessWaybill[]>(() =>
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
    props.isShowBarcode &&
    waybill.pickupMode?.pickupMode !== PickupType.服务点自寄
  )
}

// 是否显示通知收件人，当运单需要审核时不显示
const needShare = computed(() => {
  const needShare = props.orderSuccessPageConfig?.needShare
  const flag = needShare?.toString() === 'true' ? true : false
  return flag && !authVisible.value
})

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

const { share } = useShare()

const shareWaybill = (index: number) => {
  share(waybillList.value[index].waybillNumber)
}

/**
 * @description 跳转审核列表
 */
const goApprovalList = async () => {
  const h5OrderUrl = await getH5OrderUrl()
  const baseUrl = h5OrderUrl ? `${h5OrderUrl}#` : getOnlineH5Url()
  const url = `${baseUrl}/price-adjustment-approval-list/`
  openURL(url, { type: 'redirectTo', needLogin: true })
}

// 跳转到详情
const handleToDetailPage = (waybill: SuccessWaybill) => {
  if (props.showRadioChecked) {
    emit('radioChecked', waybill)
    return
  }
  if (props.orderCompletedPageType === OrderSuccessType.运单审核) {
    // 审核中运单跳转 到老下单审核界面
    return goApprovalList()
  } else if (props.orderCompletedPageType === OrderSuccessType.调价审核) {
    // 调价审核调价 调老运单 不带orderState
    return goApprovalList()
  } else {
    $native?.navigateTo({
      page: 'waybillRoute',
      type: 'redirectTo',
      params: {
        waybillNo: waybill.waybillNumber,
      },
    })
  }
}
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
