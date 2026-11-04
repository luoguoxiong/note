<template>
  <div class="order-estimation-cost__popup">
    <Noticebar leftIcon>{{ batchEstimateFeeTip || '以下费用仅供参考，实际费用以最终费用为准' }}</Noticebar>
    <!-- 批量总 最低批次费提醒 lowestBatchChargeTips-->
    <div
      class="order-estimation-cost__popup-fee-tip batch"
      v-if="orderBatch && estimationFee.batchTips && !isDetailMode"
    >
      <!-- <img class="warn-icon" :src="iconMap.warnIcon" alt="" /> -->
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
        :estimationPopupIndex="estimationPopupIndex"
      />
    </div>
    <div v-else-if="results.length > 1 || orderBatch" class="address-info-container">
      <div
        v-if="!isDetailMode"
        :class="results.length >= 4 ? 'address-info-overflow' : ''"
        v-exposure-report="detailFeeReport(orderBatch)"
      >
        <AddressInfoItem
          v-for="(item, index) in results"
          @itemClick="itemClick(item, index)"
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
          :estimationPopupIndex="estimationPopupIndex"
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
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import Noticebar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'
import CostItem from './costItem.vue'
import AddressInfoItem from './components/addressInfoItem/index.vue'
import DetailItem from './components/detailItem/index.vue'
import { EstimateFeeByTaskIdResponseResultItem } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { currentIndex, isDetailMode } from './hooks'
import { orderBatch, showSingleEstimatedCost } from '../../hooks/data'
// import { iconMap } from '../../utils'

import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface Props {
  // 预估运费所有数据
  estimationFee: any
  couponFee: any
  index: number
  // 是否展示最低批次费提醒
  isShowLowestBatchFeeTip: boolean
  estimationPopupIndex: string
  results: EstimateFeeByTaskIdResponseResultItem[]
}
const props = withDefaults(defineProps<Props>(), {
  estimationFee: {},
  couponFee: {},
  index: 0,
  isShowLowestBatchFeeTip: false,
  estimationPopupIndex: '',
  results: () => [],
})

const emit = defineEmits(['scrollTo', 'handleExample'])

const spread = ref(true)
// const isDetailMode = ref(false)
// const currentIndex = ref(0)

const filterResults = computed(() => {
  if (showSingleEstimatedCost.value) {
    let list = props.results?.filter((_, index) => index === 0)
    return list
  }
  return props.results?.filter((_, index) => index === currentIndex.value)
})

const itemClick = (_: EstimateFeeByTaskIdResponseResultItem, index: number) => {
  isDetailMode.value = true
  currentIndex.value = index
}

const batchEstimateFeeTip = computed(() => {
  // 四级地址特殊提示，批量场景-总费用明细列表展示
  return isDetailMode.value || (showSingleEstimatedCost.value && orderBatch.value)
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
  let batchWaybillList = piniaStore.order.batchWaybillInfoList || []
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
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
