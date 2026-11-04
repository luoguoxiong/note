<template>
  <div class="order-estimation-cost" v-if="showModal">
    <FeePopup
      @onClose="onClose"
      :title="title"
      :customStyle="{ maxHeight: '92%', paddingBottom: footerSectionHeight + 20 + 'px' }"
      :customClass="'estimation-get-zindex'"
      @getEstimationPopupIndex="getEstimationPopupIndex"
      v-bind="$attrs"
      v-model:modelValue="show"
      :safe-area-inset-bottom="true"
      :showFooter="false"
      class="order-estimation-cost__popup"
      :no-padding="true"
      :footerSectionHeight="footerSectionHeight"
      @onClickHeader="onClickHeader"
      :showBackIcon="isDetailMode"
      @goBack="onClickHeader"
    >
      <EstimationCostContent
        popContainer=".order-estimation-cost"
        :estimationFee="estimationFee || {}"
        :couponFee="couponFee"
        :isShowLowestBatchFeeTip="true"
        :estimationPopupIndex="estimationPopupIndex"
        :results="results"
        @handleExample="handleExample"
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
import { ref, PropType } from 'vue'
import FeePopup from '@order-public-sub-public/components/business/estimated-cost/components/fee-popup/index.vue'
import example from '@order-public-sub-public/components/business/estimated-cost/components/estimation-cost-content/components/example.vue'
import EstimationCostContent from '../estimation-cost-content/index.vue'
import { isDetailMode, goBack } from '../estimation-cost-content/hooks'
import { EstimateFeeByTaskIdResponseResultItem } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { onClickHeaderReport } from '@order-public-sub-public/components/business/estimated-cost/report/report'

defineProps({
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
})
const emit = defineEmits(['getEstimationPopupIndex', 'onClickHeader'])
const estimationPopupIndex = ref()
const show = ref(false)
const levelTwoShow = ref(false)
const getEstimationPopupIndex = (val: number) => {
  console.log('getEstimationPopupIndex val', val)
  estimationPopupIndex.value = val
  emit('getEstimationPopupIndex', val)
}
const onClickHeader = () => {
  onClickHeaderReport()
  goBack()
  // emit('onClickHeader')
  console.log('onClickHeader')
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
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
