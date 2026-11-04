<template>
  <div class="order-footer-left" id="order-footer-left">
    <div class="order-footer-left-content" v-if="visible && !feeAuthApplyFailed">
      <!-- 1.没权限查看 -->
      <div
        class="order-footer-left-estimation-looks"
        v-if="isAuthFlag === '20'"
        @click="showApplyModal"
        v-click-report="{
          eventCode: 'clk_express_cost_application_v1',
        }"
        v-exposure-report="{
          eventCode: 'exp_express_cost_application_v1',
        }"
      >
        <span class="order-footer-left-desc">{{ estimatedLabel }}</span>
        <span class="no-fee-auth-tips" v-if="applyData?.status === FeeAuthApplyStatus.申请查看">无查看权限</span>
        <span class="looks-content" :class="{ breath: applyData?.status === FeeAuthApplyStatus.申请查看 }">
          <span class="order-footer-left-looks">{{ applyDesc }}</span>
          <span v-if="applyDesc" class="icon-content"
            ><SvgIcon class="arrow-right" name="arrow-right-blue-line"></SvgIcon
          ></span>
        </span>
      </div>
      <!-- 2.显示预估运费 -->
      <div
        class="order-footer-left-estimation estimation"
        v-else-if="showFreightLookAuthFlag"
        :class="[!showAmount && 'estimation-flex']"
      >
        <div
          class="left-estimation-has-looks"
          v-exposure-report="{
            eventCode: 'exp_express_cost_v1',
          }"
        >
          <span class="order-footer-left-desc" :class="{ 'freight-title-animation': !concatLoading && !showAmount }">{{
            estimatedLabel
          }}</span>
          <LazyRender>
            <img
              class="loading-img"
              v-if="concatLoading"
              src="https://ic-img.ky-express.com/netc/20250619_28163_!!1750314415702_148_148.png"
              alt=""
            />
          </LazyRender>
          <div v-if="!concatLoading && !showAmount" class="order-footer-left-money" @click="toogle">
            <span class="money" v-if="!specialText(dataValue?.noEstimateFeeText || totalCountCmp)">￥</span>
            <span
              class="order-footer-left-money-count"
              :data-small="isLowerAmountSize(totalCountCmp || 0)"
              :class="{
                'special-text': specialText(dataValue?.noEstimateFeeText || totalCountCmp),
                'data-small': isLowerAmountSize(totalCountCmp || 0),
              }"
              >{{
                specialText(dataValue?.noEstimateFeeText)
                  ? dataValue?.noEstimateFeeText
                  : handleMoneyAmountText(totalCountCmp)
              }}
            </span>
            <span
              v-if="!concatLoading"
              class="order-footer-left-text"
              v-click-report="{
                eventCode: 'clk_express_cost_v1',
                regionCode: 'fare',
              }"
              >费用明细</span
            >
            <SvgIcon
              name="arrow-down-icon"
              class="order-footer-left-forbidden-svg"
              :class="`${showModal ? 'expand' : ''}`"
            />
          </div>
          <span v-if="!concatLoading && showAmount" class="order-footer-left-desc-not">
            {{ dataValue?.noEstimateFeeText || isFreeShipping }}
          </span>
        </div>
        <div
          v-if="!concatLoading && dataValue?.estimateFeeTip"
          class="order-footer-left-detail"
          :class="{ 'default-color': redFeeTip }"
        >
          <div class="fee-tip">{{ dataValue?.estimateFeeTip }}</div>
        </div>
      </div>
      <DetailPopup
        key="detail-popup"
        ref="detailPopRef"
        :footerSectionHeight="footerSectionHeight"
        :showModal="showModal"
        :estimationFee="dataValue || {}"
        :onClose="detailPopupClose"
        :title="estimatedTitle"
        :isShowLineInfo="orderBatch"
        @getEstimationPopupIndex="getEstimationPopupIndex"
        @onClickHeader="onClickHeader"
        :estimationPopupIndex="btnSectionIndex"
        :results="resultsCmp || []"
      ></DetailPopup>
      <ApplyPopup
        v-model="applyInputValue"
        :data="applyData"
        :title="applyDesc"
        :inputValue="applyInputValue"
        :modal-show="applyModalShow"
        :onClose="applyOnclose"
        :onConfirm="applyOnConfirm"
        :footerText="footerText"
        :textDisable="textDisable"
      ></ApplyPopup>
    </div>
    <!-- 电子运单契约 -->
    <Agreement
      v-if="!isBackRoute"
      v-model="isAgreement"
      type="waybill"
      ref="order-agreement"
      prop="order-agreement"
      popover-message="请先阅读并勾选协议"
      @agreeContentShow="agreeContentShow"
      @argeeCallback="argeeCallback"
      @change="agreeChange"
      :defaultChecked="defaultChecked"
      :isScrollRead="noNeedRead"
    ></Agreement>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useData, showNoPrice, showFreightLookAuthFlag, isAuthFlag } from './hooks'
import { handleMoneyAmountText, isLowerAmountSize, specialText } from './utils'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import DetailPopup from './components/detail-popup/index.vue'
import Agreement from './components/netc-agreement/index.vue'
import useApplyPopUp from './hooks/useApplyPopup'
import ApplyPopup from './components/apply-popup/index.vue'
// import { defaultChecked } from './hooks/useExpose'
import { goBack, isDetailMode } from './components/estimation-cost-content/hooks'

import { FeeAuthApplyStatus, ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { FeeResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import {
  showEstimatedCostModal as showModal,
  moduleVisible as visible,
  orderBatch,
  orderBatchWaybill,
  concatLoading,
  showSingleEstimatedCost,
  showBatchFeeTipsStroe,
  dataValue,
  lowestWaybillContent,
} from './hooks/data'
import { isEmptyText } from '@order-public-sub-public/utils'
import { estimatedCostItem } from '@order-public-sub-public/apis/types'
import LazyRender from '@order-public-sub-public/components/ui/lazy-render/index.vue'
import { singleFeeData } from './hooks/singleFeePolling'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { data, results, totalCount, isLoading, orderPageType } = singleFeeData()
const {
  applyData,
  showApplyModal,
  inputValue: applyInputValue,
  modalShow: applyModalShow,
  onClose: applyOnclose,
  onConfirm: applyOnConfirm,
  applyDesc,
  footerText,
  textDisable,
  feeAuthApplyFailed,
} = useApplyPopUp()

const isBackRoute = computed(() => {
  return piniaStore.root.getOrderPageType === OrderPageType.返程单
})

const defaultChecked = ref(false)

const detailPopRef = ref<{ show: boolean }>({ show: false })
defineProps({
  footerSectionHeight: {
    type: Number,
    required: true,
  },
})
const emit = defineEmits(['changeFooterStyle', 'changeFooterClass', 'changeFooterBatchFee'])
const { noNeedRead } = useData()

const showBatchFeeTips = (tips: string) => {
  const bol = !!(visible?.value && tips)
  showBatchFeeTipsStroe.value = bol
  if (bol) {
    emit('changeFooterClass', {
      moreText: tips?.length > 26,
    })
  } else {
    emit('changeFooterClass', {})
  }
  return bol
}

watch(
  () => piniaStore.globalData.userDefaultSettingInfo,
  (val) => {
    const { agreementInfo = {} } = val || {}
    defaultChecked.value = agreementInfo.waybillSelectFlag ? true : false
  },
)

// 如果在loading中，则隐藏计算费用弹窗
watch(
  () => isLoading.value,
  (val) => {
    if (val) {
      showModal.value = false
    }
  },
)

// 特殊处理兼容不是暂无报价情况下还是返回0的情况
const showAmount = computed(() => {
  // if (specialText(dataValue.value?.noEstimateFeeText)) {
  //   return true
  // }
  console.log('totalCountCmp.value', totalCountCmp.value)
  // if (totalCountCmp.value && ['￥--'].includes(String(totalCountCmp.value))) {
  //   return true
  // }
  return isEmptyText(totalCountCmp.value)
})

const btnSectionIndex = ref() // 显示预估运费弹窗
const isAgreement = ref(false)
const isAgreeContentShow = ref(false)
// const isShow = ref(true)
// const height = ref(defaultEstimateTipsHeight) // 预估运费气泡提示高度

const estimatedTitle = computed(() => (orderBatch.value && !isDetailMode.value ? '预估总价' : '预估费用'))
const estimatedLabel = computed(() => (orderBatch.value ? '预估总价' : '预估费用'))
/**
 * @description: 预估费用 头部返回
 * 点击返回 需返回到预估总价popup
 */
const onClickHeader = () => {
  showModal.value = false
}

/**
 * @description: 批量和 明细的预估费用公用弹框，关闭时需要把明细标识置为false
 * @return {*}
 */
const closeSingleEstimated = () => {
  showSingleEstimatedCost.value = false
  goBack()
}

const detailPopupClose = () => {
  closeSingleEstimated()
  onClose()
}

// 预估运费popup

const toogle = () => {
  // 批量 标识
  showModal.value = !showModal.value
  if (detailPopRef.value) {
    detailPopRef.value.show = showModal.value
  }
  if (orderBatch.value) {
    closeSingleEstimated()
  }
}

/**
 * @description: 更新批次费是否显示
 * @param {*} show
 * @return {*}
 */
const changeFooter = (show = true) => {
  let tips = ''
  if (orderBatch.value) {
    tips = (dataValue?.value as any)?.batchTips || ''
  } else {
    tips = dataValue?.value?.addedValueTips || ''
  }
  showBatchFeeTips(tips)
  console.log(lowestWaybillContent.value, 'lowestWaybillContent')
  emit('changeFooterBatchFee', {
    show: show,
  })
}

// 清空预估运费
watch(
  data,
  () => {
    if (data?.value === null) {
      piniaStore.schema.updateModuleDimensionByType({
        type: ModuleType['预估费用'],
        data: {
          response: {} as FeeResponse,
        },
      })
    }

    console.log(data.value, 'lowestWaybillContent-val')
    changeFooter()
  },
  {
    immediate: true,
  },
)

// 如果是暂无报价情况，需要撑开高度
watch(
  [
    () => dataValue?.value?.estimateFeeTip,
    () => showFreightLookAuthFlag.value,
    () => showNoPrice.value,
    () => dataValue?.value?.noEstimateFeeText,
  ],
  (val) => {
    const visibleValue = val[0]
    const isFreightLookAuthFlagValue = val[1]
    const showNoPriceValue = val[2]
    const feeTextValue = val[3]
    if (visibleValue && isFreightLookAuthFlagValue && showNoPriceValue && !orderBatchWaybill.value && feeTextValue) {
      emit('changeFooterClass', { isHeightest: true })
    } else {
      emit('changeFooterClass', { isHeightest: false })
    }
    changeFooter()
  },
  {
    immediate: true,
  },
)

// 默认没有费用时 色值调整
const redFeeTip = computed(() => dataValue?.value?.estimateFeeTip === '请先填写必填项重量、件数，获取预估运费')

watch(
  () => showModal.value,
  (val) => {
    // 打开明细弹窗时隐藏提示，关闭弹窗时再显示提示
    if (!val) {
      changeFooter(true)
      emit('changeFooterStyle', {})
    } else {
      changeFooter(false)
    }
  },
)

const estimatedCostStore = computed(() => piniaStore.globalData.estimatedCost)

// 单票 results
const singleResult = computed(() => {
  let waybillNumber = piniaStore.order.waybillNumber
  let estimatedCost = estimatedCostStore.value
  let responsesMap = estimatedCost?.responses?.find((x) => x.waybillNumber === waybillNumber)
  return responsesMap ? [responsesMap] : []
})

const isFreeShipping = computed(() => {
  const list = estimatedCostStore.value?.responses || []
  let total = 0
  list.length > 0 && list.map((item) => (total += Number(item.feeResponse?.totalAmount) || 0))
  if (total === 0 && list.some((x) => specialText(x.noEstimateFeeText))) {
    // 如果金额为0，且是免单时，也展示暂无报价
    return '暂无报价'
  }
  return null
})

// eslint-disable-next-line complexity
const totalCountCmp = computed(() => {
  if (orderBatch.value) {
    // let estimatedCost = estimatedCostStore.value
    // return estimatedCost.batchAmount
    const estimatedCost = estimatedCostStore.value
    const list = estimatedCost?.responses || []
    // 多条数据是暂无报价则显示暂无报价
    const isNotPrice = list?.length > 0 && list.every((item) => item.noEstimateFeeText === '暂无报价')
    if (isNotPrice || list.length === 0 || estimatedCost?.noEstimateFeeText) {
      // return '暂无报价'
      return null
    }
    let total = 0
    list.length > 0 && list.map((item) => (total += Number(item.feeResponse?.totalAmount) || 0))
    // 1,全部免单: 则显示免单, 2， 有免单，新增无费用 显示免单（新增数据不符合轮费用条件）3，部分免单，有暂无报价或¥-- 显示 暂无报价
    if (total === 0) {
      if (list.every((x) => specialText(x.noEstimateFeeText, ['免单']))) {
        return '免单'
      } else if (list.some((x) => specialText(x.noEstimateFeeText))) {
        return null
      }
    }
    return total
  } else if (orderBatchWaybill.value) {
    if (singleResult.value?.length) {
      return singleResult.value[0]?.feeResponse?.waybillAmount > 0
        ? singleResult.value[0]?.feeResponse.totalAmount
        : null
    }
    return null
  }
  // 往返寄results会固定两条
  if (results.value?.length === 2) {
    if (orderPageType.value === OrderPageType.返程单) {
      if (singleResult.value?.length) {
        return singleResult.value[0]?.feeResponse?.waybillAmount > 0
          ? singleResult.value[0]?.feeResponse.totalAmount
          : null
      }
      return null
    } else {
      return totalCount.value
    }
  } else {
    const feeData = piniaStore.globalData.dynamicConfig('estimatedCost') as estimatedCostItem
    // 过程中返回 没有必填项 不展示金额
    if (feeData?.noEstimateFeeText) {
      return null
    } else if (data.value) {
      // 存在使用免单券的情况 totalAmount 为0 基础运费会大于0
      return data.value.waybillAmount > 0 ? data.value.totalAmount : null
    }
  }
  // 单票有两条 results 往返寄
  return null
})

// 费用 list
const resultsCmp = computed(() => {
  let estimatedCost = estimatedCostStore.value
  if (orderBatch.value) {
    const list = estimatedCost?.responses
    list?.forEach((x, index) => {
      x.showIndex = index + 1
    })
    // 考虑暂无报价的情况，暂无报价的也要统计
    return list?.filter((x) => x?.feeResponse)
  } else if (orderBatchWaybill.value) {
    return singleResult.value
  }
  return results.value
})

const onClose = () => {
  showModal.value = false
  detailPopRef.value.show = false
}
const getEstimationPopupIndex = (zIndex: number) => {
  btnSectionIndex.value = Number(zIndex) + 2
  // 更改footer样式
  emit('changeFooterStyle', { zIndex: btnSectionIndex.value })
}

// 协议内容展开回调
const agreeContentShow = (val: boolean) => {
  isAgreeContentShow.value = val
}

const agreeChange = (val: boolean) => {
  defaultChecked.value = val
  const defaultInfoData = piniaStore.globalData.userDefaultSettingInfo
  defaultInfoData.agreementInfo.waybillSelectFlag = val
  piniaStore.globalData.serUserDefaultSettingInfo({ data: { ...defaultInfoData } })
}

// 点击同意协议的回调
const argeeCallback = async () => {
  // await updateAgreementStatus({
  //   agreementCode: 10,
  // })
  // this.$refs['order-agreement']?.togglePopup(false)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './indes.scss';
</style>
