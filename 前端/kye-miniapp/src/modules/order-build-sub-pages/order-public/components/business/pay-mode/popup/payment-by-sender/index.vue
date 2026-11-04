<template>
  <div class="payment-by-receiving">
    <div class="body">
      <div class="cur-companyName" v-if="companyName">
        <span class="label">当前付款公司：</span>
        <span class="value">{{ companyName }}</span>
      </div>
      <div class="tips">
        <SvgIcon class="star-tips" name="star-tips"></SvgIcon>
        <span class="text">寄方付：货物交于跨越小哥后，下单人可通过线上支付、扫收款码支付、月结帐户支付等方式付款</span>
      </div>
    </div>
    <div class="footer-content">
      <KyButton
        color="#8365F6"
        loading-text="确定"
        :loading="loading"
        class="confirm-btn"
        value="确定"
        @click="onClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PayModelProps } from '@order-public-sub-public/components/business/pay-mode/type'
import { computed } from 'vue'
import { MAX_DELAY_TIME } from '@order-public-sub-public/constants'
import { PayMode } from '@order-public-sub-public/constants/waybill'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { debounce } from 'lodash-es'
import { getPaymodeItem } from '@order-public-sub-public/components/business/pay-mode/hooks/state'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { beforeConfirmReport } from '../../hooks/useReport'
const props = defineProps<PayModelProps>()
const emit = defineEmits(['confirmHandel', 'loadChange'])

const companyName = computed(() => {
  return getPaymodeItem(PayMode.寄方付)?.customerName || ''
})

const loading = computed(() => {
  return props.loading
})

const onClick = debounce(() => {
  beforeConfirmReport()
  emit('loadChange', true)
  emit('confirmHandel', { payMode: PayMode['寄方付'] })
}, MAX_DELAY_TIME)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
