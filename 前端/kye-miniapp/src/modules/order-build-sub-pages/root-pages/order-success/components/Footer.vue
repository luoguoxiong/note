<template>
  <div class="order-footer" v-if="currentConfig" :class="currentConfig.length > 2 ? 'footer-tab' : ''">
    <div class="footer-tab flex items-center" v-if="currentConfig.length > 2">
      <div
        class="footer-tab-item"
        v-for="item in currentConfig"
        :key="item.text"
        @click="item.action()"
        v-exposure-report="exp_express_print_v1(item.text)"
      >
        <SvgIcon class="footer-tab-icon" v-if="item.iconName" :name="item.iconName" />
        <div class="footer-tab-item-title">{{ item.text }}</div>
      </div>
    </div>
    <div class="flex items-center" v-if="currentConfig.length === 2">
      <KyButton
        v-for="(item, index) in currentConfig"
        :key="`${item.text}${index}`"
        class="button-footer"
        :class="item.type === 'default' ? 'button-left mr-24 border-purple' : ''"
        @click="item.action()"
        :type="buttonTypeFunc(item.type)"
        size="normal"
        :text="item.text"
      ></KyButton>
    </div>
    <!-- 通知收件人 -->
    <!-- <ShareWaybill :waybill-number="waybillNumber"></ShareWaybill> -->
  </div>
</template>
<script setup lang="ts">
import { OrderSuccessPageConfig, SuccessOrderInfo, SuccessWaybill } from '@order-public-sub-public/types'
import { toRefs, computed } from 'vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { useFooter } from '../hooks/useFooterConfig'

// import ShareWaybill from '@order-public-sub-root-pages/order-success/components/ShareWaybill.vue'
import { exp_express_print_v1 } from '@order-public-sub-root-pages/order-success/hooks/report'

const props = defineProps<{
  data?: SuccessOrderInfo
  waybillNumber: string
  orderSuccessPageConfig: OrderSuccessPageConfig
  waybillList?: SuccessWaybill[]
}>()

const { data } = toRefs(props)

const buttonTypeFunc = (type: string) => {
  return type as any
}
// 从hooks中获取当前配置
const currentConfig = computed(() =>
  useFooter(data, props.waybillNumber, props.orderSuccessPageConfig, props.waybillList),
)
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.order-footer {
  &.footer-tab {
    padding: 0;
    padding-bottom: calc(20px + env(safe-area-inset-bottom, 20px));
    box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.05);
  }
  .footer-tab-item {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 120px;
    &-title {
      margin-top: 8px;
      font-size: 22px;
    }
    &::after {
      position: absolute;
      left: 0;
      top: 38px;
      content: '';
      width: 2px;
      height: 54px;
      background: #f2f0f4;
    }
  }
  .footer-tab-item {
    &:first-child::after {
      display: none;
    }
  }
  .footer-tab-icon {
    width: 48px;
    height: 48px;
    overflow: hidden;
    background-size: cover;
  }
  .border-purple {
    border-color: #8365f6;
  }
}
</style>
