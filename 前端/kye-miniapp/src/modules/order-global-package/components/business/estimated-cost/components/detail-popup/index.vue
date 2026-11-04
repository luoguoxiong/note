<template>
  <div class="order-estimation-cost" v-if="showModal">
    <FeePopup
      @onClose="onClose"
      :titleHtml="titleHtml"
      :customClass="'estimation-get-zindex'"
      @getEstimationPopupIndex="getEstimationPopupIndex"
      v-bind="$attrs"
      v-model:modelValue="show"
      :safe-area-inset-bottom="true"
      :showFooter="false"
      :showTitle="true"
      class="order-estimation-cost__popup"
      :no-padding="true"
      :footerSectionHeight="footerSectionHeight"
      @onClickHeader="onClickHeader"
      :showBackIcon="isDetailMode"
      @goBack="onGoBack"
    >
      <EstimationCostContent
        popContainer=".order-estimation-cost"
        :estimationFee="estimationFee || {}"
        :couponFee="couponFee"
        :isShowLowestBatchFeeTip="true"
        :estimationPopupIndex="estimationPopupIndex"
        :results="results"
        @handleExample="handleExample"
        v-model:isDetailMode="internalIsDetailMode"
        v-model:currentIndex="internalCurrentIndex"
        :orderBatch="orderBatch"
        :showSingleEstimatedCost="showSingleEstimatedCost"
        :batchWaybillInfoList="batchWaybillInfoList"
        :waybillNumber="waybillNumber"
        :onIosDisablePenetration="onIosDisablePenetration"
        @noEstimateTips="(msg) => emit('noEstimateTips', msg)"
      />
    </FeePopup>
    <!-- 示例说明弹框外提 -->
    <example
      v-model:modelValue="levelTwoShow"
      :feeFormula="exampleObj.feeFormula"
      :amountExampleList="exampleObj.amountExampleList"
      @close="levelTwoShow = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, computed, watch } from 'vue'
import FeePopup from '../fee-popup/index.vue'
import example from '../estimation-cost-content/components/example.vue'
import EstimationCostContent from '../estimation-cost-content/index.vue'
import { EstimateFeeByTaskIdResponseResultItem } from '../../../../../types/estimated-cost'

const props = defineProps({
  onClose: {
    type: Function as PropType<() => void>,
    required: true,
  },
  title: {
    type: String,
  },
  footerSectionHeight: {
    type: Number,
    required: true,
  },
  estimationFee: {
    type: Object,
  },
  couponFee: {
    type: Object,
  },
  showModal: {
    type: Boolean,
    default: false,
  },
  isShowTotal: {
    type: Boolean,
    default: false,
  },
  results: {
    type: Object as PropType<EstimateFeeByTaskIdResponseResultItem[]>,
  },
  // 新增 props（由适配层注入）
  isDetailMode: {
    type: Boolean,
    default: false,
  },
  currentIndex: {
    type: Number,
    default: 0,
  },
  orderBatch: {
    type: Boolean,
    default: false,
  },
  showSingleEstimatedCost: {
    type: Boolean,
    default: false,
  },
  batchWaybillInfoList: {
    type: Array,
    default: () => [],
  },
  waybillNumber: {
    type: String,
    default: '',
  },
  onIosDisablePenetration: {
    type: Function as PropType<(val: boolean) => void>,
    default: undefined,
  },
})

const emit = defineEmits([
  'getEstimationPopupIndex',
  'onClickHeader',
  'update:isDetailMode',
  'update:currentIndex',
  'goBack',
  'noEstimateTips',
])

const titleHtml = computed(() => {
  return `${props.title}<span class="estimation-cost-title-subtitle" style="font-size: 12px;font-weight: 400;color: #8C8F99;margin-left: 4px">以下费用仅供参考，实际以最终费用为准</span>`
})

const estimationPopupIndex = ref()
const show = ref(false)
const levelTwoShow = ref(false)

// v-model:isDetailMode 桥接
const internalIsDetailMode = computed({
  get: () => props.isDetailMode,
  set: (val) => emit('update:isDetailMode', val),
})

// v-model:currentIndex 桥接
const internalCurrentIndex = computed({
  get: () => props.currentIndex,
  set: (val) => emit('update:currentIndex', val),
})

const getEstimationPopupIndex = (val: number) => {
  estimationPopupIndex.value = val
  emit('getEstimationPopupIndex', val)
}

const onClickHeader = () => {
  emit('onClickHeader')
}

const onGoBack = () => {
  emit('goBack')
}

const exampleObj = ref({
  feeFormula: {},
  amountExampleList: [],
})

const handleExample = (obj) => {
  exampleObj.value = obj
  levelTwoShow.value = obj.showExample
}

defineExpose({
  show,
})
</script>

<style lang="scss">
@import '../../../../../styles/index.scss';
@import './index.scss';
</style>
