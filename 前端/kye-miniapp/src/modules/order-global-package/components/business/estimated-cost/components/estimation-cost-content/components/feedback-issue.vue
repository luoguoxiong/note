<template>
  <!-- 费用反馈 -->
  <div class="order-feedback-issue">
    <span
      class="order-feedback-issue-label"
      id="exp_express_cost_feedback_v1"
      :exposure-report="{
        eventCode: 'exp_express_cost_feedback_v1',
      }"
      >对费用有疑问？</span
    >
    <span class="order-feedback-issue-link" @click="handleFeedback">立即反馈</span>
  </div>
</template>

<script setup lang="ts">
// import { useOrderExposureReport } from '@order-public/report/exposureReport' // 暂时注释，待后续恢复
// import umpOtherReport from '@order-public/reportUmp/sceneReport/umpotherReport' // 暂时注释，待后续恢复
import Taro from '@tarojs/taro'

const props = withDefaults(
  defineProps<{
    waybillNumber: string
  }>(),
  {
    waybillNumber: '',
  }
)

// 删除 piniaStore fallback，waybillNumber 必须由调用方传入
const handleFeedback = () => {
  // umpOtherReport('CLK', { // 暂时注释，待后续恢复
  //   eventCode: 'clk_express_cost_feedback_v1',
  // })
  Taro.navigateTo({
    url: `/modules/order-build-sub-pages/pages/questionnaire-fee/index?waybillNumber=${props.waybillNumber}`,
  })
}
// useOrderExposureReport(['exp_express_cost_feedback_v1']) // 暂时注释，待后续恢复
</script>

<style lang="scss">
.order-feedback-issue {
  margin-top: 30px;
  font-size: 24px;
  display: flex;
  justify-content: flex-end;
  &-label {
    color: #8c8f99;
  }
  &-link {
    color: #8365f6;
  }
}
</style>
