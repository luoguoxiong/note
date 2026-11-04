<template>
  <scroll-view
    :style="{ maxHeight: '70vh' }"
    :scroll-y="true"
    :bounces="false"
    :enhanced="true"
    :catchTouchMove="() => false"
    :catchtouchend="() => false"
    class="order-estimation-cost__popup"
  >
    <Noticebar leftIcon v-if="batchEstimateFeeTip">{{ batchEstimateFeeTip }}</Noticebar>
    <!-- 批量总 最低批次费提醒 lowestBatchChargeTips-->
    <div
      class="order-estimation-cost__popup-fee-tip batch"
      v-if="orderBatch && estimationFee.batchTips && !isDetailMode"
    >
      <SvgIcon name="dollar-reminder-line" class="warn-icon" />
      <span class="title-desc">{{ estimationFee.batchTips }}</span>
    </div>
    <div v-if="showSingleEstimatedCost" class="address-info-container">
      <DetailItem
        v-for="(item, index) in filterResults"
        :key="index"
        :index="getBatchSingleWaybillIndex(item.waybillNumber)"
        :data="item"
        :isShowLowestBatchFeeTip="true"
        @handleExample="handleExample"
        @noEstimateTips="(msg) => emit('noEstimateTips', msg)"
        :estimationPopupIndex="estimationPopupIndex"
        :onIosDisablePenetration="onIosDisablePenetration"
      />
    </div>
    <div v-else-if="results.length > 1 || orderBatch" class="address-info-container">
      <div
        v-if="!isDetailMode"
        :class="results.length >= 4 ? 'address-info-overflow' : ''"
        id="detailFeeReport"
        :exposure-report="detailFeeReport(orderBatch)"
      >
        <AddressInfoItem
          v-for="(item, index) in results"
          @itemClick="itemClick(item, index)"
          @noEstimateTips="(msg) => emit('noEstimateTips', msg)"
          :key="index"
          :index="getBatchSingleWaybillIndex(item.waybillNumber)"
          :data="item"
        />
      </div>
      <div v-else>
        <DetailItem
          v-for="(item, index) in filterResults"
          :key="index"
          :index="getBatchSingleWaybillIndex(item.waybillNumber)"
          :data="item"
          :isShowLowestBatchFeeTip="true"
          @handleExample="handleExample"
          @noEstimateTips="(msg) => emit('noEstimateTips', msg)"
          :estimationPopupIndex="estimationPopupIndex"
          :onIosDisablePenetration="onIosDisablePenetration"
        />
      </div>
    </div>
    <CostItem
      v-else
      :estimationFee="estimationFee"
      @handleExample="handleExample"
      :couponFee="couponFee"
      :isShowLowestBatchFeeTip="isShowLowestBatchFeeTip"
      :estimationPopupIndex="estimationPopupIndex"
      :onIosDisablePenetration="onIosDisablePenetration"
      :waybillNumber="waybillNumber"
    />
  </scroll-view>
</template>

<script setup lang="ts">
// import { useOrderExposureReport } from '@order-public/report/exposureReport' // 暂时注释，待后续恢复

import { ref, watch, computed } from 'vue'

import Noticebar from '../../../../base/ky-noticebar/noticebar.vue'
import CostItem from './costItem.vue'
import AddressInfoItem from './components/addressInfoItem/index.vue'
import DetailItem from './components/detailItem/index.vue'
import { EstimateFeeByTaskIdResponseResultItem } from '../../../../../types/estimated-cost'
import SvgIcon from '../../../../ui/svg-icon/index.vue'

// useOrderExposureReport(['detailFeeReport']) // 暂时注释，待后续恢复

interface Props {
  estimationFee: any
  couponFee: any
  index: number
  isShowLowestBatchFeeTip: boolean
  estimationPopupIndex: string
  results: EstimateFeeByTaskIdResponseResultItem[]
  // 由适配层注入的 props（原来自 hooks/store）
  isDetailMode?: boolean
  currentIndex?: number
  orderBatch?: boolean
  showSingleEstimatedCost?: boolean
  batchWaybillInfoList?: any[]
  waybillNumber?: string
  onIosDisablePenetration?: (val: boolean) => void
}
const props = withDefaults(defineProps<Props>(), {
  estimationFee: () => ({}),
  couponFee: () => ({}),
  index: 0,
  isShowLowestBatchFeeTip: false,
  estimationPopupIndex: '',
  results: () => [],
  isDetailMode: false,
  currentIndex: 0,
  orderBatch: false,
  showSingleEstimatedCost: false,
  batchWaybillInfoList: () => [],
  waybillNumber: '',
})

const emit = defineEmits(['scrollTo', 'handleExample', 'update:isDetailMode', 'update:currentIndex', 'noEstimateTips'])

const spread = ref(true)

const filterResults = computed(() => {
  if (props.showSingleEstimatedCost) {
    let list = props.results?.filter((_, index) => index === 0)
    return list
  }
  return props.results?.filter((_, index) => index === props.currentIndex)
})

const itemClick = (_: EstimateFeeByTaskIdResponseResultItem, index: number) => {
  emit('update:isDetailMode', true)
  emit('update:currentIndex', index)
}

const batchEstimateFeeTip = computed(() => {
  return props.isDetailMode || (props.showSingleEstimatedCost && props.orderBatch)
    ? filterResults.value[0]?.estimateFeeTip
    : ''
})

const handleExample = (obj) => {
  emit('handleExample', obj)
}

watch(spread, (val) => {
  if (val) {
    emit('scrollTo', props.index)
  }
})

const detailFeeReport = (orderBatch: boolean) => {
  if (orderBatch) {
    return {
      eventCode: 'exp_express_cost_viewdetail_v1',
      regionCode: 'fare',
    }
  } else {
    return {}
  }
}

const getBatchSingleWaybillIndex = (waybillNumber: string | undefined) => {
  let result = 0
  let batchWaybillList = props.batchWaybillInfoList || []
  if (batchWaybillList.length === 0 && props.results.length > 0) {
    batchWaybillList = props.results as any
  }
  if (batchWaybillList && batchWaybillList.length > 0) {
    batchWaybillList.forEach((item, index) => {
      if (item.waybillNumber === waybillNumber) {
        result = index
      }
    })
  }
  return result
}
</script>

<style lang="scss">
@import '../../../../../styles/index.scss';
@import './index.scss';
</style>
