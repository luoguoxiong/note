<template>
  <div
    class="order-estimation-cost__popup_content"
    :class="showSafeAreaInsetBottom ? 'show-safe-area-inset-bottom' : ''"
  >
    <div>
      <view class="order-estimation-cost-dialog-content">
        <!-- 基础运费 -->
        <div class="order-estimation-cost__popup-title-wrap">
          <div class="order-estimation-cost__popup-title" style="margin-top: 0">
            <div class="title">
              <text class="title">基础运费</text>
              <text v-if="!showBasisDetail" class="title-desc">(按{{ feeFormula.billingTypeDesc }}计费)</text>
            </div>
            <div
              :class="['amount', showBasisDetail && 'no-amount-detail']"
              @click="toChangeShowBasisDetail"
              id="exp_express_cost_detail_v1"
              :exposure-report="{
                eventCode: 'exp_express_cost_detail_v1',
                regionCode: 'fare',
              }"
              v-click-report="{
                eventCode: 'clk_express_cost_detail_v1',
                regionCode: 'fare',
              }"
            >
              <span class="amount-mark" v-if="!showBasisDetail">￥</span>
              <span class="amount-number" v-if="!showBasisDetail">{{
                handleMoneyAmountShow(estimationFee.waybillAmount)
              }}</span>
              <i v-if="showBasisDetail" class="amount-icon-arrow icon-arrow-up-blue"></i>
              <i v-else class="amount-icon-arrow icon-arrow-down-blue"></i>
            </div>
          </div>

          <!-- 最低运费提醒 lowestWaybillFeeTips-->
          <div v-if="!showBasisDetail && prompt.lowestWaybillFeeTips" class="order-estimation-cost__popup-fee-tip">
            <SvgIcon name="dollar-reminder-line" class="warn-icon" />
            <span class="title-desc">{{ prompt.lowestWaybillFeeTips }}</span>
          </div>
          <!-- 最低批次费提醒 lowestBatchChargeTips-->
          <div
            class="order-estimation-cost__popup-fee-tip"
            v-if="isShowLowestBatchFeeTip && prompt.lowestBatchChargeTips"
          >
            <SvgIcon name="dollar-reminder-line" class="warn-icon" />
            <span class="title-desc">{{ prompt.lowestBatchChargeTips }}</span>
          </div>
        </div>

        <!-- 基础运费展开 -->
        <div v-show="showBasisDetail" class="order-estimation-cost__popup-detail-wrap">
          <!-- 计费公式 -->
          <div class="billing-tips-content-title">
            <text v-if="feeFormula?.billingTypeDesc"
              ><text>按</text><text class="billing-tips-content-mark">{{ feeFormula?.billingTypeDesc }}</text
              >计费，</text
            >基础运费:
            <text class="amount-mark">￥</text>
            <text class="amount-number">{{ handleMoneyAmountShow(estimationFee.waybillAmount) }}</text>
          </div>
          <div v-if="hasDetailContent" class="order-estimation-cost__popup-detail-content color-gray-special formula-line-height triangle">
            <div class="billing-tips-detail-item" v-if="billingSizeV1.length">
              <text class="content-item-label">{{ billingSizeV1[0] }}</text>
              <text class="content-item-value">{{ billingSizeV1[1] }}</text>
            </div>
            <div class="billing-tips-detail-item" v-if="billingWeightV1.length">
              <text class="content-item-label">{{ billingWeightV1[0] }}</text>
              <text class="content-item-value">{{ billingWeightV1[1] }}</text>
            </div>
            <div v-if="estimationFee.waybillAmount > 0" class="order-estimation-cost__popup-detail-title">
              <div>
                <span class="title-left">计费公式</span>
              </div>
              <div
                class="title-right"
                v-if="amountExampleList.length"
                @click="handleExampleShow"
                id="exp_express_cost_basis_v1"
                :exposure-report="{
                  eventCode: 'exp_express_cost_basis_v1',
                  regionCode: 'fare',
                }"
                v-click-report="{
                  eventCode: 'clk_express_cost_basis_v1',
                  regionCode: 'fare',
                }"
              >
                <span class="example-desc">示例说明</span>
                <svgIcon class="detail-icon-arrow" name="right-arrow-blue" />
              </div>
            </div>
            <div v-if="officialOrlowestWaybillTipContent" v-html="officialOrlowestWaybillTipContent"></div>
            <div v-else v-html="feeFormula?.freightFormula"></div>
          </div>
        </div>

        <!-- 增值服务费 -->
        <div class="order-estimation-cost__popup-title">
          <div class="title">
            <span>增值服务费</span>
            <span v-if="addedValueDetailTipList.length" class="title-desc"
              >({{ addedValueDetailTipList.length }}项)</span
            >
          </div>
          <div
            class="amount"
            @click="toChangeShowAddedDetail"
            id="exp_express_cost_increment_v1"
            :exposure-report="{
              eventCode: 'exp_express_cost_increment_v1',
              regionCode: 'fare',
            }"
          >
            <span class="amount-mark">￥</span>
            <span class="amount-number">{{ handleMoneyAmountShow(estimationFee.addedValueAmount) }}</span>
            <div v-if="addedValueDetailTipList.length" style="display: flex; align-items: center; height: 28px">
              <i v-if="showAddedDetail" class="amount-icon-arrow icon-arrow-up-blue"></i>
              <i v-else class="amount-icon-arrow icon-arrow-down-blue"></i>
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
          id="exp_express_cost_preferential_v1"
          :exposure-report="{
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
        <FeedbackIssue v-if="showFeedbackIssue" :waybillNumber="waybillNumber" />
      </view>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { useOrderExposureReport } from '@order-public/report/exposureReport' // 暂时注释，待后续恢复
// import umpOtherReport from '@order-public/reportUmp/sceneReport/umpotherReport' // 暂时注释，待后续恢复
import Taro from '@tarojs/taro'
import { ref, computed, watch, onMounted } from 'vue'
import SvgIcon from '../../../../ui/svg-icon/index.vue'
import FeedbackIssue from './components/feedback-issue.vue'
import { handleMoneyAmountShow } from '../../../../../utils'

// 内联 isWechatEnv/isWxAppIosEnv 判断（来自 @/public/utils，非 @order-public）
const isWechatEnv = typeof wx !== 'undefined'
const isWxAppIosEnv = (() => {
  if (!isWechatEnv) return false
  try {
    const systemInfo = Taro.getSystemInfoSync()
    return /ios/i.test(systemInfo.system || '')
  } catch {
    return false
  }
})()

// 内联 getTaroDom 实现（替代 @order-public/utils/common 中的 getTaroDom）
const getTaroDom = (selector: string): Promise<any> => {
  return new Promise((resolve) => {
    Taro.createSelectorQuery()
      .select(selector)
      .boundingClientRect((rect) => {
        resolve(rect || {})
      })
      .exec()
  })
}

interface Props {
  estimationFee: any
  couponFee: any
  index: number
  isShowLowestBatchFeeTip: boolean
  estimationPopupIndex: string
  showFeedbackIssue?: boolean
  showSafeAreaInsetBottom?: boolean
  waybillNumber?: string
  onIosDisablePenetration?: (val: boolean) => void
}
const props = withDefaults(defineProps<Props>(), {
  estimationFee: () => ({}),
  couponFee: () => ({}),
  index: 0,
  isShowLowestBatchFeeTip: false,
  estimationPopupIndex: '',
  showFeedbackIssue: true,
  showSafeAreaInsetBottom: true,
  waybillNumber: '',
})
// useOrderExposureReport([...]) // 暂时注释，待后续恢复

const emit = defineEmits(['scrollTo', 'handleExample'])

const systemInfo = Taro.getSystemInfoSync()
const windowHeight = ref(systemInfo.windowHeight)
const resetScrollHeight = () => {
  if (isWechatEnv) {
    try {
      windowHeight.value = wx.getWindowInfo().windowHeight
    } catch {
      windowHeight.value = systemInfo.windowHeight
    }
  } else {
    windowHeight.value = systemInfo.windowHeight
  }
}

const spread = ref(true)
const showBasisDetail = ref(true)
const showAddedDetail = ref(true)

onMounted(() => {
  resetScrollHeight()
})

const handleExampleShow = () => {
  emit('handleExample', {
    showExample: true,
    feeFormula: feeFormula.value,
    amountExampleList: amountExampleList.value,
    examplePopupOverlayIndex: examplePopupOverlayIndex.value,
  })
}

const officialOrlowestWaybillTipContent = computed(() => {
  const isIncludeWaybillAmount =
    (feeFormula.value?.freightFormula || '').lastIndexOf(props.estimationFee?.waybillAmount) !== -1
  const isLowestWaybill = isIncludeWaybillAmount && props.estimationFee?.waybillAmount <= freightLowestAmount.value
  const isOfficialState = isIncludeWaybillAmount && props.estimationFee?.officialState
  if (isLowestWaybill || isOfficialState) {
    const waybillAmount = handleMoneyAmountShow(props.estimationFee?.waybillAmount)
    const index = feeFormula.value?.freightFormula.lastIndexOf(props.estimationFee?.waybillAmount)
    const first = feeFormula.value?.freightFormula.slice(0, index)
    const last = feeFormula.value?.freightFormula
      .slice(index)
      .replace(waybillAmount, `<span style="color: #ff706d">${waybillAmount}</span>`)
    const htmlText = `${first}${last}`
    return htmlText
  }
  return ''
})

const examplePopupOverlayIndex = computed(() => Number(props.estimationPopupIndex) + 2 + '')
const feeFormula = computed(() => props.estimationFee?.feeFormula || {})
const freightLowestAmount = computed(() => props.estimationFee?.feeTipResponse?.freightLowestAmount || '')
const prompt = computed(() => props.estimationFee?.prompt || {})
const addedValueDetailTipList = computed(() => props.estimationFee?.addedValueDetailTipList || [])
const amountExampleList = computed(() => props.estimationFee?.feeFormula?.amountExampleList || [])
const reduceAmount = computed(() => props.estimationFee?.coupon?.amount || '')

watch(spread, (val) => {
  if (val) {
    emit('scrollTo', props.index)
  }
})

const billingWeightV1 = computed(() => {
  const billingWeightV1 = props.estimationFee?.feeFormula?.billingWeightV1
  if (billingWeightV1 && billingWeightV1.includes(':')) {
    return billingWeightV1.split(':')
  } else {
    return []
  }
})
const billingSizeV1 = computed(() => {
  const billingSizeV1 = props.estimationFee?.feeFormula?.billingSizeV1
  if (billingSizeV1 && billingSizeV1.includes(':')) {
    return billingSizeV1.split(':')
  } else {
    return []
  }
})

const hasDetailContent = computed(() => {
  return (
    billingSizeV1.value.length > 0 ||
    billingWeightV1.value.length > 0 ||
    props.estimationFee.waybillAmount > 0 ||
    !!officialOrlowestWaybillTipContent.value ||
    !!feeFormula.value?.freightFormula
  )
})

const getDomScroll = () => {
  setTimeout(async () => {
    let res = await getTaroDom('.order-estimation-cost-dialog-content')
    if (isWxAppIosEnv && props.onIosDisablePenetration) {
      props.onIosDisablePenetration(res?.height < windowHeight.value * 0.7)
    }
  }, 400)
}
const toChangeShowAddedDetail = () => {
  showAddedDetail.value = !showAddedDetail.value
  getDomScroll()
  // umpOtherReport('CLK', { // 暂时注释，待后续恢复
  //   eventCode: 'clk_express_cost_increment_v1',
  //   regionCode: 'fare',
  // })
}

const toChangeShowBasisDetail = () => {
  showBasisDetail.value = !showBasisDetail.value
  getDomScroll()
  // umpOtherReport('CLK', { // 暂时注释，待后续恢复
  //   eventCode: 'clk_express_cost_detail_v1',
  //   regionCode: 'fare',
  // })
}
</script>

<style lang="scss">
.order-feedback-issue {
  margin-top: 30px;
  font-size: 24px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 8px;
  &-label {
    color: #8c8f99;
  }
  &-link {
    color: #8365f6;
  }
}
</style>
