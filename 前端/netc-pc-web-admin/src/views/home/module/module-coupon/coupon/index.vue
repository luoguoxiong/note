<template>
  <div
    class="coupon-content"
    :class="{
      'coupon-content--expired': isExpired,
      'coupon-content--single': isSingle,
      'coupon-content--package': isPackage,
    }"
  >
    <div class="coupon-type">共{{ totalTicketCount }}张</div>
    <div class="coupon-inner">
      <div v-if="isSingle && singleInfo" class="coupon-single">
        <div class="coupon-sigle-money" v-show="!isDiscountForm(singleInfo.reliefForm)">
          <span class="small">￥</span><span class="coupon-price-value">{{ singleInfo.amount }}</span>
          <span class="coupon-form-tag">{{ couponTypeEnum[singleInfo.reliefForm] }}</span>
        </div>
        <div class="coupon-sigle-money" v-show="isDiscountForm(singleInfo.reliefForm)">
          <span class="coupon-price-value">{{ formatDiscount(singleInfo.discountRate) }}</span
          ><span class="small">折</span>
          <span class="coupon-form-tag">{{ couponTypeEnum[singleInfo.reliefForm] }}</span>
        </div>
        <div class="coupon-single-desc">{{ singleInfo.couponDesc }}</div>
      </div>
      <div v-else-if="isPackage" class="coupon-multiple">
        <template v-for="(item, index) in couponList" :key="`${item.activityId}-${index}`">
          <article
            class="coupon-multiple-item"
            :class="{
              'coupon-multiple-item--warm-to-base': index % 2 === 0,
              'coupon-multiple-item--base-to-warm': index % 2 !== 0,
            }"
          >
            <div class="coupon-multiple-money" v-show="!isDiscountForm(item.reliefForm)">
              <span class="small">￥</span>
              <span class="coupon-price-value">{{ item.amount }}</span>
            </div>

            <div class="coupon-multiple-money" v-show="isDiscountForm(item.reliefForm)">
              <span class="coupon-price-value">{{ formatDiscount(item.discountRate) }}</span>
              <span class="small">折</span>
            </div>

            <div class="coupon-multiple-desc">
              <span>{{ couponTypeEnum[item.reliefForm] }}</span>
              <span class="coupon-multiple-item-count">x{{ item.ticketNumber || 1 }}</span>
            </div>
          </article>

          <div v-if="index !== couponList.length - 1" class="coupon-connector" aria-hidden="true">
            <img class="coupon-connector-image" :src="COUPON_CONNECTOR_IMAGES[index % 2]" alt="" />
          </div>
        </template>
      </div>
    </div>
    <div v-if="isSingle" class="coupon-single-connector" aria-hidden="true">
      <img
        class="coupon-single-connector-image"
        src="https://ic-img.ky-express.com/netc/20260828_7073_!!1787911229338_20_160.png"
        alt=""
      />
    </div>
    <div class="coupon-todo" :class="{ 'coupon-todo--package': isPackage }">
      <img
        v-if="isPackage"
        class="coupon-package-cover"
        src="https://ic-img.ky-express.com/netc/20260828_61081_!!1787906518663_252_160.png"
        alt=""
        aria-hidden="true"
      />
      <KButton
        :loading="isLoading"
        native-type="button"
        class="coupon-todo-btn"
        :disabled="isLoading || isExpired"
        @click="toSendOrGetCoupon"
      >
        <template #loading>
          <ButtonLoadingIcon :src="LOADING_IMG" :size="14" />
        </template>
        {{ canShip ? '立即寄件' : '立即领取' }}
      </KButton>
      <img
        v-if="isExpired"
        class="coupon-watermark"
        src="https://ic-img.ky-express.com/netc/20260828_5217_!!1787911970002_113_113.png"
        alt="已失效"
      />
      <img
        v-else-if="canShip"
        class="coupon-watermark"
        src="https://ic-img.ky-express.com/netc/20260828_57616_!!1787911970004_113_113.png"
        alt="已领取"
      />
    </div>
    <el-dialog v-model="showMessage" :show-close="false" width="416">
      <template v-slot:title>
        <span class="notice-message">
          <svg-icon name="no-coupon"></svg-icon>
          温馨提示</span
        >
      </template>
      <div class="notice-info">{{ messageInfo }}</div>
      <div class="button-wrap">
        <KButton type="primary" @click="handleInvalidCouponConfirm">我知道了</KButton>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
import ButtonLoadingIcon from '@/components/button-loading-icon/index.vue'
import { getCoupon, isCouponReadyToShip } from '@/apis/home'
import { HomePageActivityVO, CouponInfoVO } from '@/apis/home/types'
import { useHomeStore } from '@/hooks'
import { useUserStore } from '@/stores/user'
import { computed, ref } from 'vue'
import { locationRouteV2, parentMessageSend } from '@/utils/appBridge'

const LOADING_IMG = 'https://ic-img.ky-express.com/netc/20240506_23970395195_!!1714993379948_14_14.png'

const COUPON_ALREADY_RECEIVED_STATUS = 38010
const COUPON_CONNECTOR_IMAGES = [
  'https://ic-img.ky-express.com/netc/20260828_44049_!!1787906518664_32_128.png',
  'https://ic-img.ky-express.com/netc/20260828_63471_!!1787906518661_32_128.png',
] as const

const isLoading = ref(false)
const isExpired = ref(false)
const showMessage = ref(false)
const messageInfo = ref('')
const { updateCouponGetState, store } = useHomeStore()
const userStore = useUserStore()

// 券型标签文案：reliefForm 取数据字典 crm_marketing_coupon_info_relief_front，
// 按产品需求归并为 4 种券型（直减/折扣/满减/减免）
const couponTypeEnum: Record<CouponInfoVO['reliefForm'], string> = {
  '10': '满减券',
  '20': '折扣券',
  '30': '直减券',
  '40': '满减券',
  '50': '减免券',
  '60': '折扣券',
}

/** 折扣类券型（面值区显示折扣数而非金额）：20-折扣，60-折扣（第二类，amount 为 null） */
const isDiscountForm = (form: CouponInfoVO['reliefForm']) => form === 20 || form === 60

interface CouponContentProps {
  couponInfo: HomePageActivityVO
}

const props = defineProps<CouponContentProps>()
// 按原始券配置判断，避免券面合并丢失自动发放标识。
const canShip = computed(() => isCouponReadyToShip(props.couponInfo))
const emit = defineEmits<{
  (event: 'invalid', id: number): void
}>()

const getCouponGroupKey = (coupon: CouponInfoVO) => {
  const faceValue = isDiscountForm(coupon.reliefForm) ? coupon.discountRate : coupon.amount
  return `${coupon.reliefForm}-${faceValue}`
}

// 同类型且同金额/折扣的券合并为单券样式，数量累加；不同券面才按券包拆分展示。
const couponList = computed(() => {
  const groupedCoupons = new Map<string, CouponInfoVO>()

  for (const coupon of props.couponInfo.couponInfoList || []) {
    const groupKey = getCouponGroupKey(coupon)
    const groupedCoupon = groupedCoupons.get(groupKey)
    const ticketNumber = coupon.ticketNumber || 1

    if (groupedCoupon) {
      groupedCoupon.ticketNumber += ticketNumber
    } else {
      groupedCoupons.set(groupKey, {
        ...coupon,
        ticketNumber,
      })
    }
  }

  return Array.from(groupedCoupons.values())
})
const isSingle = computed(() => couponList.value.length === 1)
const isPackage = computed(() => couponList.value.length >= 2)
const singleInfo = computed(() => couponList.value[0])
const totalTicketCount = computed(() => {
  return couponList.value.reduce((total, item) => total + (item.ticketNumber || 1), 0)
})

const reportCouponAction = (buttonName: string, getStatus?: string) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_homepage_coupon_area_get_v1',
    },
    {
      region_code: 'coupon_area',
      button_name: buttonName,
      ...(getStatus ? { get_status: getStatus } : {}),
    }
  )
}

const refreshCouponList = async () => {
  try {
    await store.updateCouponList()
  } catch {
    // 请求层已经统一提示错误，此处只防止刷新失败产生未处理的 Promise。
  }
}

const toSendOrGetCoupon = async () => {
  if (isLoading.value || isExpired.value) return

  if (canShip.value) {
    locationRouteV2.push({
      path: '/admin/order-config-single',
      query: {
        needQuerySave: 'false',
      },
    })
    reportCouponAction('立即寄件')
    return
  }

  isLoading.value = true
  try {
    const {
      data: { receiveStatus, receiveDesc },
    } = await getCoupon(props.couponInfo.id, userStore.user?.phone || '', 10)

    if (receiveStatus === 0) {
      updateCouponGetState(props.couponInfo.id, true)
      parentMessageSend({
        message: '领取成功',
        type: 'success',
      })
      reportCouponAction('立即领取', '领取成功')
    } else if (receiveStatus === COUPON_ALREADY_RECEIVED_STATUS) {
      updateCouponGetState(props.couponInfo.id, true)
      parentMessageSend({
        message: receiveDesc || '您已领取过该优惠券',
        type: 'warning',
      })
      reportCouponAction('立即领取', '重复领取')
      void refreshCouponList()
    } else {
      isExpired.value = true
      messageInfo.value = receiveDesc || '领取失败，该优惠券已失效'
      showMessage.value = true
      reportCouponAction('立即领取', '优惠券失效')
    }
  } catch {
    // 请求层统一处理网络、超时及服务异常提示。
  } finally {
    isLoading.value = false
  }
}

const formatDiscount = (discountRate: number) => {
  return ((100 - discountRate) * 0.1).toFixed(1)
}

const handleInvalidCouponConfirm = () => {
  showMessage.value = false
  emit('invalid', props.couponInfo.id)
  void refreshCouponList()
}
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
