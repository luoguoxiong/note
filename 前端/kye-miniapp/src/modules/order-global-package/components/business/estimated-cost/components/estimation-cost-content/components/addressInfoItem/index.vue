<!-- 多个运单展示外层地址item -->
<template>
  <div class="address-info-item">
    <div :class="`row ${isDetailMode && 'is-detail'}`">
      <div class="bg-index">{{ index + 1 }}</div>
      <div :class="`left-content ${isDetailMode && 'is-detail'}`">
        <div class="show-text show-text-left">
          <span class="name-text">{{ data?.estimateFeeAddressInfo?.sendPerson || '' }}</span>
          <span class="city-text">{{ data?.estimateFeeAddressInfo?.sendAddress || '' }}</span>
        </div>
        <img class="shape-img" :src="shapeImg" />
        <div class="show-text show-text-right">
          <span class="name-text">{{ data?.estimateFeeAddressInfo?.receivePerson || '' }}</span>
          <span class="city-text">{{ data?.estimateFeeAddressInfo?.receiveAddress || '' }}</span>
        </div>
      </div>
      <div class="right" v-if="!isDetailMode">
        <div
          v-if="data?.noEstimateFeeText && (!data.feeResponse.waybillAmount || data.feeResponse.waybillAmount === 0)"
          class="no-price"
        >
          <span class="text-color-red-warn" @click="() => handleNoEstimateTips(data.estimateFeeTip)">{{
            data?.noEstimateFeeText
          }}</span>
          <SvgIcon
            class="address-info-item-tips"
            name="address-info-item-tips"
            @click="() => handleNoEstimateTips(data.estimateFeeTip)"
          ></SvgIcon>
        </div>
        <div v-else @click="itemClick(data, index)" class="look-detail">
          <div class="special-text" v-if="specialText(data.noEstimateFeeText)">{{ data.noEstimateFeeText }}</div>
          <div class="amount" v-else>￥{{ handleMoneyAmountShow(data?.feeResponse?.totalAmount) }}</div>
          <div
            class="view-detail"
            id="exp_express_cost_detail_v1"
            :exposure-report="{
              eventCode: 'exp_express_cost_detail_v1',
              otherParams: {
                waybill_number: data?.waybillNumber,
              },
            }"
          >
            查看明细 <SvgIcon class="arrow-warn" name="right-arrow-blue" />
          </div>
        </div>
      </div>
    </div>
    <div class="tip-container border-top" v-if="!isDetailMode && addedValueTipsShow">
      <span class="error-tips">
        {{ data?.feeResponse?.addedValueTips }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
// import { useOrderExposureReport } from '@order-public/report/exposureReport' // 暂时注释，待后续恢复

import { computed } from 'vue'
import SvgIcon from '../../../../../../ui/svg-icon/index.vue'
import { EstimateFeeByTaskIdResponseResultItem, AddedValueTipsType } from '../../../../../../../types/estimated-cost'
import { handleMoneyAmountShow, specialText } from '../../../../../../../utils'

const shapeImg = 'https://ic-img.ky-express.com/netc/20250619_72876_!!1750314639807_200_20.png'
const emits = defineEmits(['itemClick', 'noEstimateTips'])

interface IProps {
  index: number
  data: EstimateFeeByTaskIdResponseResultItem
  isDetailMode?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isDetailMode: false,
})
// useOrderExposureReport(['exp_express_cost_detail_v1']) // 暂时注释，待后续恢复

const itemClick = (data: EstimateFeeByTaskIdResponseResultItem, index: number) => {
  emits('itemClick', data, index)
}

// showKyDialog 替换为 emit noEstimateTips event，由适配层监听处理
const handleNoEstimateTips = (message: string) => {
  emits('noEstimateTips', message)
}

const addedValueTipsShow = computed(() => {
  return (
    !props.isDetailMode &&
    props.data?.feeResponse?.addedValueTips &&
    props.data?.feeResponse?.addedValueTipsType !== AddedValueTipsType.取派专车费
  )
})
</script>

<style lang="scss">
@import '../../../../../../../styles/index.scss';
@import './index.scss';
</style>
