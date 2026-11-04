<!-- 多个运单展示外层地址item -->
<template>
  <div class="detail-info-item">
    <AddressInfoItem :data="data" :index="index" :isDetailMode="true" />
    <CostItem
      :estimationFee="data.feeResponse"
      :couponFee="couponFee || {}"
      :isShowLowestBatchFeeTip="isShowLowestBatchFeeTip"
      :estimationPopupIndex="estimationPopupIndex"
      @handleExample="handleExample"
    />
    <div class="total-container">
      总计： <text class="amount"> ￥{{ handleMoneyAmountShow(data?.feeResponse?.totalAmount) }}</text>
    </div>
  </div>
</template>
<script setup lang="ts">
import { EstimateFeeByTaskIdResponseResultItem } from '@order-public-sub-public/apis/waybill/estimated-cost'
import CostItem from '../../costItem.vue'
import AddressInfoItem from '../addressInfoItem/index.vue'
import { handleMoneyAmountShow } from '../../../../utils'
const emit = defineEmits(['handleExample'])

interface IProps {
  index: number
  data: EstimateFeeByTaskIdResponseResultItem
  isShowLowestBatchFeeTip: boolean
  estimationPopupIndex: string
  couponFee?: Record<string, any>
}
withDefaults(defineProps<IProps>(), {
  isDetailMode: false, // 详情模式下不展示金额和运费提示
  isShowLowestBatchFeeTip: false,
  estimationPopupIndex: '',
})
const handleExample = (obj) => {
  emit('handleExample', obj)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
