<template>
  <div class="added-service-bottom-wrapper" :class="addedClass">
    <div
      class="added-service-bottom flex items-center space-between"
      :class="bottomPadding ? 'added-service-bottom-padding' : ''"
    >
      <div
        class="added-service-bottom-content flex column"
        v-if="freightLookAuthFlag === FreightLookAuthFlagEnum['有权限'] && visible && waybillAmount"
      >
        <div>
          <div class="flex items-center pb-16 added-service-bottom-fee-content">
            <span class="fee-content-label">增值费用</span>
            <div class="flex items-center" v-if="!concatLoading">
              <div class="flex items-center">
                <span class="font-level3 color-error fee-content-unit">￥</span>
                <span class="added-service-bottom-fee color-error" :class="{ 'data-small-size': isLowerAmountSize }">{{
                  showText
                }}</span>
              </div>
              <div
                class="flex items-center"
                :style="{
                  flexShrink: 0,
                }"
                @click="handlePopupVisible"
                v-exposure-report="{
                  eventCode: 'exp_express_single_insurance_cost_v1',
                  regionCode: 'pop',
                }"
                v-click-report="clk_express_single_insurance_cost_v1(moduleStyle)"
              >
                <span class="ml-8 added-service-bottom-detail">费用明细</span>
                <SvgIcon
                  name="arrow-down-icon"
                  :class="`fee-expand-icon ${detailPopupVisible ? 'expand' : ''}`"
                ></SvgIcon>
              </div>
            </div>
            <div class="loading-img-content" v-else>
              <LazyRender>
                <img
                  class="loading-img"
                  src="https://ic-img.ky-express.com/netc/20250619_28163_!!1750314415702_148_148.png"
                  alt=""
                />
              </LazyRender>
            </div>
          </div>
          <div class="font-level4 color-sub-title">实际费用以报单为准</div>
        </div>
      </div>
      <div
        :class="`added-service-bottom-btn ${
          freightLookAuthFlag === FreightLookAuthFlagEnum['有权限'] && visible && waybillAmount ? '' : 'single-btn'
        }`"
      >
        <KyButton :loading="props.buttonLoading" @click="handleClick" loading-text="确定" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
// import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import { AddedServiceDimension } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { FreightLookAuthFlagEnum } from '@order-public-sub-public/components/business/added-service/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { concatLoading } from '@order-public-sub-public/components/business/estimated-cost/hooks/data'
import {
  useVisibleType,
  useDetailPopupVisible,
  useUnfoldReceiptVisible,
  useUnfoldPackageVisible,
  // usePopupVisible,
} from '../../hooks/useVisible'
import { clk_express_single_insurance_cost_v1 } from '@order-public-sub-public/components/business/added-service/hooks/report'
import { addedServiceFee } from '../../hooks/data'
import { estimatedCostItem } from '@order-public-sub-public/apis/types'
import LazyRender from '@order-public-sub-public/components/ui/lazy-render/index.vue'
const piniaStore = useStore()

const props = defineProps<{
  buttonLoading: boolean
  isUnfold: boolean
  moduleStyle?: string
  bottomPadding?: boolean
}>()

const { visibleType } = useVisibleType()
const { detailPopupVisible, setDetailPopupVisible } = useDetailPopupVisible()
const { setUnfoldReceiptVisible } = useUnfoldReceiptVisible()
const { setUnfoldPackageVisible } = useUnfoldPackageVisible()
// const { setPopupVisible } = usePopupVisible()

const dynamicConfig = computed(() => {
  return (piniaStore.globalData.dynamicConfig('estimatedCost') as estimatedCostItem) || {}
})

const addedClass = computed(() => {
  return `added-service-bottom-wrapper-${props.moduleStyle}`
})

const visible = computed(() => {
  const { visible = false, noEstimateFeeText } = dynamicConfig.value
  // 因切换条件导致没有预估费用，如果上次有费用,则不应该增值费（如果有费用 过程中noEstimateFeeText不会有值）
  return visible && !noEstimateFeeText && !props.isUnfold
})

const handlePopupVisible = () => {
  if (visibleType.value === 'unfoldReceipt') {
    setUnfoldReceiptVisible(detailPopupVisible.value)
  }
  if (visibleType.value === 'unfoldPackage') {
    setUnfoldPackageVisible(detailPopupVisible.value)
  }
  // 增值明细弹窗时需要展示 增值服务popup
  // if (visibleType.value === 'popup') {
  // setPopupVisible(detailPopupVisible.value)
  // }
  setDetailPopupVisible(!detailPopupVisible.value)
}

const freightLookAuthFlag = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.freightLookAuthFlag
})

const showText = computed(() => {
  return handleMoneyAmountShow(addedServiceFee.value?.addedValueAmount || 0)
})

// 基础运费 > 0 才显示增值费（解决暂无报价，后端返回增值费，依然显示费用问题）
const waybillAmount = computed(() => {
  let amount = handleMoneyAmountShow(addedServiceFee?.value?.waybillAmount)
  return Number(amount) > 0
})

const isLowerAmountSize = () => {
  const feeTotal = addedServiceFee.value?.addedValueAmount || 0
  const len = (Math.floor(feeTotal) + '').length
  return len >= 6
}

const emit = defineEmits(['click'])

const handleClick = () => {
  setDetailPopupVisible(false)
  emit('click')
}

const handleMoneyAmountShow = (v: number | undefined) => (v || 0)?.toFixed(2)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
