<template>
  <div>
    <div class="notice-bar" id="BindCustomerBar">
      <div
        v-if="isShowNoticeBar"
        v-exposure-report="{
          eventCode: 'exp_express_nocustomercode_v1',
          otherParams: () => {
            return {
              button_name: '绑码提示条',
            }
          },
        }"
      >
        <NoticeBar @operationalEvents="goBind" @close="close" :text="tipText" isShowOperate />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NoticeBar from '@order-public-sub-public/components/base/ky-noticebar/index.vue'
import { computed } from 'vue'
import { OrderConfigType } from '@order-public-sub-public/constants'
import { clickBindCodeReport, clickCloseBarReport } from '@order-public-sub-public/report/orderCustomer'
import { isAliPayClient } from '@order-public-sub-public/utils/device'
import { useBindCustomer } from '@public/hooks/useBindCustomer'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { openCustomerPage } = useBindCustomer()

// 提示栏显示条件：1.勾选了绑码提示条 2.绑码标记为true
const isShowNoticeBar = computed(() => {
  // 是否勾选了绑码提示条
  const noticeBarConfig = piniaStore.schema.getSchemaOrderConfig(OrderConfigType['未绑码提示条'])
  // 显示标记
  const bindCustomerCodeBar = piniaStore.extend.orderCustomer?.bindCustomerCodeBar

  return noticeBarConfig && bindCustomerCodeBar
})

const tipText = computed(() => {
  let tipsMsg = '下单需绑定客户编码，以保证公司信息安全'
  if (isAliPayClient) {
    tipsMsg = '如您已有客户编码，请绑定以享受专属优惠'
  }
  return tipsMsg
})

const goBind = () => {
  openCustomerPage()
  clickBindCodeReport()
}

const close = () => {
  clickCloseBarReport()
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
// @import'./index.scss';
</style>
