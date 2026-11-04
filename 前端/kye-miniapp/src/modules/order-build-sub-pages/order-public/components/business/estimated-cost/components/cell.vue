<!--
 * @Description: cell
 * @Date: 2023-10-30 20:05:16
-->

<template>
  <div class="waybill-item-info-content-cell flex items-center" v-if="visible">
    <div class="estimated-cost-cell flex items-center" :class="gray ? 'item-gray' : ''">
      <div class="flex custom-title">预估费用</div>
      <div class="receiver-item__order-right" @click="clickHandel">
        <div v-if="curWaybillNumber && waybillEstimateLoading.includes(curWaybillNumber)" class="value-content">
          <img
            class="loading-img"
            src="https://ic-img.ky-express.com/netc/20250619_28163_!!1750314415702_148_148.png"
            alt=""
          />
        </div>
        <div v-else class="value-content">
          <span class="font-level3 flex items-center value-number">{{ totalAmountText }}</span>
        </div>
      </div>
      <div class="flex" @click="clickHandel" v-if="isShowArrow">
        <SvgIcon :name="`${gray ? 'right-arrow-gray' : 'right-arrow'}`"></SvgIcon>
      </div>
    </div>
    <DetailPopup
      key="detail-popup"
      ref="detailPopRef"
      :footerSectionHeight="footerSectionHeight"
      :showModal="showModal"
      :estimationFee="feeResponseItem"
      :onClose="onClose"
      title="预估费用"
      :results="resultsItem"
    />
  </div>
</template>

<script setup lang="ts">
import DetailPopup from './detail-popup/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { ref, computed } from 'vue'
import { showSingleEstimatedCost } from '../hooks/data'
import { FeeResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { waybillEstimateLoading } from '@order-public-sub-public/hooks/estimated-cost/useProcess'
import { isEmptyText } from '@order-public-sub-public/utils'
import { isAuthFlag } from '../hooks'
import { estimatedCostItem } from '@order-public-sub-public/apis/types'
import { specialText } from '../utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const props = defineProps({
  gray: {
    type: Boolean,
  },
  item: {
    type: Object,
  },
})

const footerSectionHeight = ref(0)

const curWaybillNumber = computed(() => {
  return props?.item?.waybillNumber || ''
})

const detailPopRef = ref<{ show: boolean }>({ show: false })
// const visible = ref(true)
// 需要等后端做临时数据处理
const visible = computed(() => props.item?.dynamicConfig?.estimatedCost?.visible && isAuthFlag.value === '10')
const showModal = ref(false)
const handleMoneyAmountShow = (v: number | undefined) => (!isEmptyText(v) ? `￥${Number(v).toFixed(2)}` : '')
const responsesMap = computed(() => piniaStore.globalData.estimatedCost?.responsesMap || {})
const feeResponseItem = computed(() => {
  if (Array.isArray(resultsItem.value) && resultsItem.value.length) {
    let feeResponse = resultsItem.value[0]?.feeResponse as FeeResponse
    return feeResponse as FeeResponse
  }
  return {} as FeeResponse
})

const responsesItem = computed(() => responsesMap.value[curWaybillNumber.value])

const totalAmountText = computed(() => {
  if (responsesItem.value?.noEstimateFeeText) {
    return responsesItem.value?.noEstimateFeeText
  } else {
    // bug #447282
    return (
      handleMoneyAmountShow(responsesItem.value?.feeResponse?.totalAmount) ||
      (piniaStore.globalData.dynamicConfig('estimatedCost') as estimatedCostItem)?.noEstimateFeeText ||
      ''
    )
  }
})

const isShowArrow = computed(() => {
  return totalAmountText.value.match(/\d+/) || specialText(responsesItem.value?.noEstimateFeeText, ['免单'])
})

const resultsItem = computed(() => {
  if (responsesItem.value) {
    return [responsesItem.value]
  }
  return []
})
const clickHandel = () => {
  // 免单场景 也可查看明细
  if (
    (!responsesItem.value || responsesItem.value?.noEstimateFeeText) &&
    !specialText(responsesItem.value?.noEstimateFeeText, ['免单'])
  ) {
    return
  }
  showModal.value = true
  showSingleEstimatedCost.value = true
  if (detailPopRef.value) {
    detailPopRef.value.show = showModal.value
  }
}
const onClose = () => {
  showModal.value = false
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
.estimated-cost-cell {
  width: 100%;
  .value-content {
    display: flex;
    justify-content: flex-end;
  }
  .receiver-item__order-right {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    align-items: center;
  }
  .value-number {
    color: $error;
    font-weight: 600;
  }
  @keyframes trans360 {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .loading-img {
    width: 32px;
    height: 32px;
    margin-left: 4px;
    animation: trans360 0.8s linear infinite;
  }
  .custom-title {
    color: #55596c;
    font-size: 26px;
  }
  svg {
    margin-left: 16px;
  }

  &.item-gray {
    .custom-title {
      color: #8c8f99;
    }
    .receiver-item__order-right {
      .value-number {
        color: #8c8f99;
        font-weight: 500;
      }
    }
  }
}
</style>
