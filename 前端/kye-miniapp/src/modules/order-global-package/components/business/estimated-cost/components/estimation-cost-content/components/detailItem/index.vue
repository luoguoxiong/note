<!-- 多个运单展示外层地址item -->
<template>
  <div class="detail-info-item">
    <AddressInfoItem :data="data" :index="index" :isDetailMode="true" @noEstimateTips="(msg) => emit('noEstimateTips', msg)" />
    <CostItem
      :estimationFee="data.feeResponse"
      :couponFee="couponFee || {}"
      :isShowLowestBatchFeeTip="isShowLowestBatchFeeTip"
      :estimationPopupIndex="estimationPopupIndex"
      @handleExample="handleExample"
      :onIosDisablePenetration="onIosDisablePenetration"
      :showFeedbackIssue="false"
      :showSafeAreaInsetBottom="false"
    />
    <div class="total-container">
      总计： <text class="amount"> ￥{{ handleMoneyAmountShow(data?.feeResponse?.totalAmount) }}</text>
    </div>
    <FeedbackIssue :waybillNumber="data.waybillNumber" class="mb-16" style="padding-right: 16px" />
  </div>
</template>
<script setup lang="ts">
import { EstimateFeeByTaskIdResponseResultItem } from '../../../../../../../types/estimated-cost'
import CostItem from '../../costItem.vue'
import AddressInfoItem from '../addressInfoItem/index.vue'
import FeedbackIssue from '../feedback-issue.vue'
import { handleMoneyAmountShow } from '../../../../../../../utils'

const emit = defineEmits(['handleExample', 'noEstimateTips'])

interface IProps {
  index: number
  data: EstimateFeeByTaskIdResponseResultItem
  isShowLowestBatchFeeTip: boolean
  estimationPopupIndex: string
  couponFee?: Record<string, any>
  onIosDisablePenetration?: (val: boolean) => void
}
withDefaults(defineProps<IProps>(), {
  isDetailMode: false,
  isShowLowestBatchFeeTip: false,
  estimationPopupIndex: '',
})
const handleExample = (obj) => {
  emit('handleExample', obj)
}
</script>

<style lang="scss">
@import '../../../../../../../styles/index.scss';
@import './index.scss';
</style>
