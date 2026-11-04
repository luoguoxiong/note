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
          <!-- <van-popover v-model="showPopover" placement="top-end" trigger="click">
            <template #reference>
              <span class="text-color-red-warn">{{ data?.noEstimateFeeText }}</span>
              <SvgIcon class="address-info-item-tips" name="address-info-item-tips"></SvgIcon>
            </template>
            <span
              class="icon-tip-info"
              style="font-size: 12px; padding: 16px 28px; border-radius: 20px; display: inline-block"
            >
              {{ data.estimateFeeTip }}
            </span>
          </van-popover> -->
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
            v-exposure-report="{
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
import { computed } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { EstimateFeeByTaskIdResponseResultItem } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { handleMoneyAmountShow, specialText } from '../../../../utils'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { AddedValueTipsType } from '@order-public-sub-public/constants'

const shapeImg = 'https://ic-img.ky-express.com/netc/20250619_72876_!!1750314639807_200_20.png'
const emits = defineEmits(['itemClick'])
// const showPopover = ref(false)
interface IProps {
  index: number
  data: EstimateFeeByTaskIdResponseResultItem
  isDetailMode?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isDetailMode: false, // 详情模式下不展示金额和运费提示
})

const itemClick = (data: EstimateFeeByTaskIdResponseResultItem, index: number) => {
  emits('itemClick', data, index)
}

const handleNoEstimateTips = (message: string) => {
  showKyDialog({
    title: '温馨提示',
    message,
    confirmButtonText: '我知道了',
    showCancelButton: false,
    allowHtml: false,
    zIndex: 99999,
  })
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
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
