<template>
  <div class="order-estimation-cost__popup_content">
    <!-- 基础运费 -->
    <div class="order-estimation-cost__popup-title-wrap">
      <div class="order-estimation-cost__popup-title" style="margin-top: 0">
        <div class="title">
          <span class="title">基础运费</span>
          <span v-if="!showBasisDetail" class="title-desc">({{ feeFormula.billingTypeName }})</span>
        </div>
        <div
          class="amount"
          @click="showBasisDetail = !showBasisDetail"
          v-exposure-report="{
            eventCode: 'exp_express_cost_detail_v1',
            regionCode: 'fare',
          }"
          v-click-report="{
            eventCode: 'clk_express_cost_detail_v1',
            regionCode: 'fare',
          }"
        >
          <span class="amount-mark">￥</span>
          <span class="amount-number">{{ handleMoneyAmountShow(estimationFee.waybillAmount) }}</span>
          <img v-if="showBasisDetail" class="icon-arrow" :src="iconMap.arrowUpIcon" alt="" />
          <img v-else class="icon-arrow" :src="iconMap.arrowDownIcon" alt="" />
        </div>
      </div>

      <!-- 最低运费提醒 lowestWaybillFeeTips-->
      <div v-if="!showBasisDetail && prompt.lowestWaybillFeeTips" class="order-estimation-cost__popup-fee-tip">
        <!-- <img class="warn-icon" :src="iconMap.warnIcon" alt="" /> -->
        <SvgIcon name="dollar-reminder-line" class="warn-icon" />
        <span class="title-desc">{{ prompt.lowestWaybillFeeTips }}</span>
      </div>
      <!-- 最低批次费提醒 lowestBatchChargeTips-->
      <div class="order-estimation-cost__popup-fee-tip" v-if="isShowLowestBatchFeeTip && prompt.lowestBatchChargeTips">
        <!-- <img class="warn-icon" :src="iconMap.warnIcon" alt="" /> -->
        <SvgIcon name="dollar-reminder-line" class="warn-icon" />
        <span class="title-desc">{{ prompt.lowestBatchChargeTips }}</span>
      </div>
    </div>

    <!-- 基础运费展开 -->
    <div v-show="showBasisDetail" class="order-estimation-cost__popup-detail-wrap">
      <!-- 计费公式 -->
      <div class="detail-marginT">
        <div class="order-estimation-cost__popup-detail-title">
          <div>
            <span class="title-left">计费公式</span>
          </div>
          <div
            class="title-right"
            v-if="amountExampleList.length"
            @click="handleExampleShow"
            v-exposure-report="{
              eventCode: 'exp_express_cost_basis_v1',
              regionCode: 'fare',
            }"
            v-click-report="{
              eventCode: 'clk_express_cost_basis_v1',
              regionCode: 'fare',
            }"
          >
            <span class="example-desc">示例说明</span>
            <img class="detail-icon-arrow" :src="iconMap.arrowRightIcon" alt="" />
          </div>
        </div>
        <div
          v-if="officialOrlowestWaybillTipContent"
          v-html="officialOrlowestWaybillTipContent"
          class="order-estimation-cost__popup-detail-content color-gray-special formula-line-height triangle"
        ></div>

        <div
          v-else
          v-html="feeFormula?.freightFormula"
          class="order-estimation-cost__popup-detail-content color-gray-special formula-line-height triangle"
        ></div>
      </div>
      <!-- 计费类型 -->
      <div class="detail-marginT">
        <div class="order-estimation-cost__popup-detail-title" style="margin-top: 0">
          <div class="title-left">
            <span>计费类型</span><span class="detail-title-desc">({{ chargeMethodDesc }})</span>
          </div>
        </div>
        <div
          class="order-estimation-cost__popup-detail-content triangle fee-type"
          v-if="feeFormula.billingWeight || feeFormula.billingSize"
        >
          <div v-if="feeFormula.billingSize" class="color-gray-special">
            <div class="estimation-flex-space-between">
              <span class="color-gray-special">{{ feeFormula.billingSize?.split('：')[0] }}</span>
              <span class="color-black-special">{{ feeFormula.billingSize?.split('：')[1] }}</span>
            </div>
          </div>
          <div v-if="feeFormula.billingWeight" class="color-gray-special">
            <div class="estimation-flex-space-between">
              <span class="color-gray-special">{{ feeFormula.billingWeight?.split('：')[0] }}</span>
              <span class="color-black-special">{{ feeFormula.billingWeight?.split('：')[1] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 增值服务费 -->
    <div class="order-estimation-cost__popup-title">
      <div class="title">
        <span>增值服务费</span>
        <span v-if="addedValueDetailTipList.length" class="title-desc">({{ addedValueDetailTipList.length }}项)</span>
      </div>
      <div
        class="amount"
        @click="showAddedDetail = !showAddedDetail"
        v-exposure-report="{
          eventCode: 'exp_express_cost_increment_v1',
          regionCode: 'fare',
        }"
        v-click-report="{
          eventCode: 'clk_express_cost_increment_v1',
          regionCode: 'fare',
        }"
      >
        <span class="amount-mark">￥</span>
        <span class="amount-number">{{ handleMoneyAmountShow(estimationFee.addedValueAmount) }}</span>
        <div v-if="addedValueDetailTipList.length" style="display: flex; align-items: center; height: 28px">
          <img v-if="showAddedDetail" class="icon-arrow" :src="iconMap.arrowUpIcon" alt="" />
          <img v-else class="icon-arrow" :src="iconMap.arrowDownIcon" alt="" />
        </div>
      </div>
    </div>

    <!-- 增值服务费展开 -->
    <div
      v-if="addedValueDetailTipList.length && showAddedDetail"
      class="order-estimation-cost__popup-detail-content triangle special"
    >
      <div class="added-value-marginT" v-for="item in addedValueDetailTipList" :key="item.sortId">
        <div class="estimation-flex-space-between">
          <span class="color-gray-special">{{ item.feeName }}</span>
          <span class="color-black-special">￥{{ handleMoneyAmountShow(item.feeAmount) }}</span>
        </div>
        <div v-if="item.feeTips" class="added-value-tips">{{ item.feeTips }}</div>
      </div>
    </div>

    <!-- 优惠金额 -->
    <div
      class="order-estimation-cost__popup-title"
      v-if="reduceAmount"
      v-exposure-report="{
        eventCode: 'exp_express_cost_preferential_v1',
      }"
    >
      <div class="title">
        <span>优惠金额</span>
      </div>
      <div class="amount discount-marginR">
        <span class="amount-mark coupon-color">-￥</span>
        <span class="amount-number coupon-color">{{ handleMoneyAmountShow(reduceAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { handleMoneyAmountShow, iconMap } from '../../utils'

interface Props {
  // 预估运费所有数据
  estimationFee: any
  couponFee: any
  index: number
  // 是否展示最低批次费提醒
  isShowLowestBatchFeeTip: boolean
  estimationPopupIndex: string
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
const showBasisDetail = ref(false)
const showAddedDetail = ref(false)

type chargeMethodMapKey = '10' | '20'
const chargeMethodMap = {
  10: '按重量计费',
  20: '按体积计费',
}

const handleExampleShow = () => {
  emit('handleExample', {
    showExample: true,
    feeFormula: feeFormula.value,
    amountExampleList: amountExampleList.value,
    examplePopupOverlayIndex: examplePopupOverlayIndex.value,
  })
}

// 命中官价或者最低运费时提醒文案
const officialOrlowestWaybillTipContent = computed(() => {
  // 公式文案中是否包含基础运费金额
  const isIncludeWaybillAmount =
    (feeFormula.value?.freightFormula || '').lastIndexOf(props.estimationFee?.waybillAmount) !== -1
  const isLowestWaybill = isIncludeWaybillAmount && props.estimationFee?.waybillAmount <= freightLowestAmount.value
  const isOfficialState = isIncludeWaybillAmount && props.estimationFee?.officialState
  if (isLowestWaybill || isOfficialState) {
    const waybillAmount = handleMoneyAmountShow(props.estimationFee?.waybillAmount)
    // 解决百分百和金额一致的问题，只替换金额的颜色
    const index = feeFormula.value?.freightFormula.lastIndexOf(props.estimationFee?.waybillAmount)
    const first = feeFormula.value?.freightFormula.slice(0, index)
    const last = feeFormula.value?.freightFormula
      .slice(index)
      .replace(waybillAmount, `<span style="color: #ff706d">${waybillAmount}</span>`)
    // 改变文案中金额样式
    const htmlText = `${first}${last}`
    return htmlText
  }
  return ''
})

const examplePopupOverlayIndex = computed(() => Number(props.estimationPopupIndex) + 2 + '')
// 运费公式
const feeFormula = computed(() => props.estimationFee?.feeFormula || {})
const chargeMethodDesc = computed(
  () => feeFormula.value?.billingType && chargeMethodMap[feeFormula.value?.billingType as chargeMethodMapKey],
)
// 最低运费金额
const freightLowestAmount = computed(() => props.estimationFee?.feeTipResponse?.freightLowestAmount || '')
// 提醒文案
const prompt = computed(() => props.estimationFee?.prompt || {})
const addedValueDetailTipList = computed(() => props.estimationFee?.addedValueDetailTipList || [])
// 示例说明列表
const amountExampleList = computed(() => props.estimationFee?.feeFormula?.amountExampleList || [])
const reduceAmount = computed(() => props.estimationFee?.coupon?.amount || '')

watch(spread, (val) => {
  if (val) {
    emit('scrollTo', props.index)
  }
})
</script>
