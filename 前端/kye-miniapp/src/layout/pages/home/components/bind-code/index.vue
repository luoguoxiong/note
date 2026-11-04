<template>
  <view
    class="bind-code"
    id="exp-bind-code"
    v-exposure
    :exposure-report="{
      eventCode: 'exp_homepage_binding_code_v1',
      otherParams: {
        page_code: 'page_homepage_v1',
        region_code: 'binding_code',
      },
    }"
  >
    <view class="bind-code__card">
      <view class="bind-code__card__left">
        <text class="bind-code__card__title">
          {{ bindText === '去切换' ? '需切换客户编码' : '您需先绑定客户编码，享更多服务' }}</text
        >
        <text class="bind-code__card__desc">{{
          bindText === '去切换'
            ? '您已存在绑定的客户编码，暂无当前绑定，需先切换'
            : '在跨越速运寄件、查件、对账、开票都需要先绑定客户编码'
        }}</text>
      </view>
      <ky-button type="primary" class="bind-code__card__button" @click="handleBindCode">{{ bindText }}</ky-button>
    </view>
    <CustomerBindDialog express-type="首页" v-model:visible="isShowCustomerBindDialog" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { report_CLK_event } from '@/public/utils'
import { useExposureReport } from '@/public/hooks/useExposureReport'
import { useUpdateSomeUserInfoV1 } from '@/public/hooks/useUpdateSomeUserInfoV1'
import CustomerBindDialog from '@/modules/user/pages/customer-code/customer-code-popup/index.vue'
import './index.scss'

defineOptions({ name: 'bind-code' })

useExposureReport(['exp-bind-code'])

const { globalUserStore } = useUpdateSomeUserInfoV1()

const isShowCustomerBindDialog = ref(false)

const bindText = computed(() => {
  const { hasCurBind, bindAuth, existedRelationBind } = globalUserStore.data?.customerInfo || {}
  // 没有当前绑定
  if (!hasCurBind) {
    return bindAuth && existedRelationBind ? '去切换' : '立即绑码'
  }
  // 有当前绑定
  return bindAuth || existedRelationBind ? '去切换' : '去更换'
})

const handleBindCode = () => {
  // 埋点
  report_CLK_event('clk_homepage_binding_code_button_v1', {
    page_code: 'page_homepage_v1',
    region_code: 'binding_code',
    button_name: bindText.value,
  })
  isShowCustomerBindDialog.value = true
}
</script>
