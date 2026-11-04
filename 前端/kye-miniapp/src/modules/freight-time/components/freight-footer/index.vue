<template>
  <view :class="styles['freight-footer']" v-if="showFooter">
    <view :class="[styles['footer-inner'], styles['footer-inner--new-auth']]" v-if="isNewCustomerWithAuth">
      <ky-button type="primary" plain size="large" text="去绑码" @tap="handleBindCode" />
      <ky-button type="primary" size="large" text="联系商务" @tap="handleContactBiz" />
    </view>
    <view :class="[styles['footer-inner'], styles['footer-inner--unlock']]" v-else-if="isNewCustomerNoAuth">
      <ky-button type="primary" text="解锁企业专属价" @tap="handleUnlockPrice" />
      <view :class="styles['auth-coupon-badge']" 
      v-if="store.authCoupon"
      id="exp_freight_enterprise_v1"
      v-exposure
      :exposure-report="{
      eventCode: 'exp_freight_enterprise_v1'
    }">
      限时加赠！解锁来领券
    </view>
    </view>
    <view :class="styles['footer-inner']" v-else-if="showBindCodePanel">
      <view :class="styles['footer-text-wrap']">
        <image :class="styles['footer-tip-icon']" src="https://ic-img.ky-express.com/netc/20260618_68756_!!1781774088309_48_48.png" mode="aspectFit" />
        <text :class="styles['footer-text']">查看预估运费，需绑定客户编码后专属商务为您开通查看权限</text>
      </view>
      <ky-button type="primary" size="normal" plain text="去绑码" @tap="handleBindCode" />
      <ky-button type="primary" size="normal" text="去寄件" :loading="store.getGoSendLoading" @tap="handleGoSend" />
    </view>
    <view :class="[styles['footer-inner']]" v-else-if="showApplyPanel">
      <view :class="styles['footer-text-wrap']">
        <image :class="styles['footer-tip-icon']" src="https://ic-img.ky-express.com/netc/20260618_68756_!!1781774088309_48_48.png" mode="aspectFit" />
        <text :class="styles['footer-text']">您还没有查看预估运费的权限</text>
      </view>
      <ky-button type="primary" size="normal" plain text="申请查看" @tap="applyPopup.open()" />
      <ky-button type="primary" size="normal" text="去寄件" :loading="store.getGoSendLoading" @tap="handleGoSend" />
    </view>
    <view :class="[styles['footer-inner']]" v-else-if="showApplyingPanel">
      <view :class="styles['footer-text-wrap']">
        <image :class="styles['footer-tip-icon']" src="https://ic-img.ky-express.com/netc/20260618_68756_!!1781774088309_48_48.png" mode="aspectFit" />
        <text :class="styles['footer-text']">{{ applyHeadTip }}</text>
      </view>
      <ky-button type="primary" size="normal" plain text="申请中" @tap="applyPopup.open()" />
      <ky-button type="primary" size="normal" text="去寄件" :loading="store.getGoSendLoading" @tap="handleGoSend" />
    </view>
    <view :class="[styles['footer-inner'], styles['footer-inner--send']]" v-else-if="showSendPanel">
      <text :class="styles['footer-text']">货急找跨越，跨省最快8小时</text>
      <ky-button type="primary" size="large" text="去寄件" :class="styles['btn-send']" :loading="store.getGoSendLoading" @tap="handleGoSend" />
    </view>

    <!-- 申请查看运费弹窗 -->
    <EstimatedShippingPopup
      ref="applyPopupRef"
      :bind-customer-status="bindCustomerStatus"
      :apply-status="feeAuthApplyStatus"
      @submit-success="$emit('refresh')"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import KyButton from '@order-global-package-freight-time/components/base/ky-button/index.vue'
import EstimatedShippingPopup from '../estimated-shipping-popup/index.vue'
import { useFreightFooter } from './hooks/useFreightFooter'
import { useFreightTimeStore } from '../../store'
import styles from './index.module.scss'
import useExposureReport from '@freight-time/hooks/useExposureReport'
useExposureReport(['exp_freight_enterprise_v1'])
const store = useFreightTimeStore()

defineEmits<{
  refresh: []
}>()

const applyPopupRef = ref<InstanceType<typeof EstimatedShippingPopup>>()

const applyPopup = computed(() => ({
  open: () => applyPopupRef.value?.open(),
}))

const applyHeadTip = computed(() => applyPopupRef.value?.applyHeadTip || '联系商务')

const {
  bindCustomerStatus,
  isNewCustomerWithAuth,
  isNewCustomerNoAuth,
  showBindCodePanel,
  showApplyPanel,
  showApplyingPanel,
  showSendPanel,
  showFooter,
  feeAuthApplyStatus,
  handleBindCode,
  handleContactBiz,
  handleUnlockPrice,
  handleGoSend,
} = useFreightFooter()

// 申请中状态时预加载文案数据（handleSearch 触发 setBindCustomerStatus 后自动请求）
watch(showApplyingPanel, async (applying) => {
  if (applying) {
    await nextTick()
    applyPopupRef.value?.fetchApplyContent()
  }
}, { immediate: true })
</script>
