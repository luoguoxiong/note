<template>
  <ky-cell
    v-if="visible"
    :class="`product-info-actual-weight ${props?.moduleStyle === 'popup' ? 'product-info-actual-weight-popup' : ''}`"
    :style="{ overflow: 'unset' }"
    v-exposure-report="{
      eventCode: 'exp_express_single_consignment_weight_v1',
    }"
  >
    <template #title>
      <div class="w-full">
        <div class="flex space-between w-full product-stepper-content">
          <div class="font-level3 flex items-center">
            总重量<SvgIcon class="product-spec-required" name="required" v-if="required" />
          </div>
          <div>
            <KyStepper
              input-stuffix="kg"
              :disabled="!editable"
              v-model.number="actualWeight"
              :min="0"
              :max="60000"
              type="digit"
              :formatter="formatter"
              :disable-minus="actualWeight < 1 ? true : false"
              data-validate="productInfo.actualWeight"
              id="productInfo_actualWeight"
              :focusClearZone="true"
              @change="onChange"
              @blur="onActualWeightChange"
              @minus="onActualWeightChange"
              @plus="onActualWeightChange"
              @minusTouchstart="minusTouchstart"
              @plusTouchstart="plusTouchstart"
              v-click-report="{
                eventCode: 'clk_express_single_consignment_weight_v1',
              }"
              v-keyboard
            ></KyStepper>
          </div>
        </div>
        <div
          v-exposure-report="{
            eventCode: 'exp_express_goods_overweight_v1',
            otherParams: () => ({ content: overLengthAndWeightFee?.overWeightTips }),
          }"
          v-if="isShowOverWeightTip && overLengthAndWeightFee?.overWeightTips"
        >
          <div class="flex items-center font-level4 reminder">
            <SvgIcon class="reminder__icon" name="dollar-reminder-line" />
            <span class="color-error">{{ overLengthAndWeightFee?.overWeightTips }}</span>
          </div>
        </div>
        <!-- 货好时间提示的优先级要大 -->
        <template v-else>
          <span v-if="overLengthAndWeightFee?.goodsTimeOptimiTips?.length">
            <span v-html="overLengthAndWeightFee.goodsTimeOptimiTips"></span>
          </span>
        </template>
      </div>
    </template>
  </ky-cell>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { SubComponentsProps, AgentTipType } from '@order-public-sub-public/components/business/product-info/types'
import { PayModeType, PickModule, ProductInfoConfig } from '@order-public-sub-public/types'
import { useActualWeight, useCount, usePreWaybillGoodsSizeList } from '../../hooks/useState'
import { overLengthAndWeightFee, useOverLengthAndWeight } from '../../hooks/useOverLengthAndWeigth'
import { useValidate } from '../../hooks/useValidate'
import KyStepper from '@order-public-sub-public/components/ui/stepper/index.vue'
import { touchstartType } from '@order-public-sub-public/components/ui/stepper/types'
import { debounce } from 'lodash-es'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { MIN_DEBOUNCE_TIME, MAX_DEBOUNCE_TIME, ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
const piniaStore = useStore()

const { actualWeight, setActualWeight } = useActualWeight()
const { preWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()
const { count } = useCount()

const { useProductInfoValidate } = useValidate()

const props: PickModule<ProductInfoConfig> | undefined = inject('productInfoProps')

defineProps<SubComponentsProps>()

const emit = defineEmits(['change'])

const onActualWeightChange = debounce(
  async () => {
    if (!actualWeight.value || String(actualWeight.value) === '.') {
      setActualWeight(0)
    }
    emit('change', actualWeight.value)

    if (props?.moduleStyle !== 'unfold') {
      try {
        closeTippy()
        await useProductInfoValidate('actualWeight', false)
      } catch (error) {
        console.error(error)
      }
    }

    onChange()
    window.$umpOtherReport(
      'OTHER',
      { eventCode: 'other_express_single_consignment_weight_v1' },
      { number_quantity: actualWeight.value },
    )
  },
  MIN_DEBOUNCE_TIME,
  { leading: true },
)

const isShowOverWeightTip = computed(() => {
  const agentType = overLengthAndWeightFee?.agent?.agentTipType
  const payModeData = piniaStore.order.moduleFormData(ModuleType.付款方式)
  if (!agentType && payModeData.payMode) {
    return true
  }
  return agentType === AgentTipType.OVERLENTH && payModeData.payMode
})

const onChange = () => {
  updateOverLengthAndWeight()
}
const updateOverLengthAndWeight = debounce(async () => {
  await useOverLengthAndWeight(
    count.value,
    actualWeight.value,
    preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
  )
}, MAX_DEBOUNCE_TIME)

const formatter = (value: number | string) => {
  value = value.toString().replace(/^[。.]/, '')
  value = value.toString().replace(/[^\d.]/g, '')

  const parts = value.split('.')
  if (parts[0].length > 5) {
    parts[0] = parts[0].substring(0, 5)
  }

  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2)
  }

  value = parts.join('.')
  if (Number(value) > 60000) {
    value = value.slice(0, 4)
  }
  if (Number(value) === 60000 && value.indexOf('.') !== -1) {
    value = value.slice(0, -1)
  }
  return value.toString()
}

const map: Record<touchstartType, string> = {
  minusTouchstart: 'clk_express_single_consignment_weight_reduce_v1',
  plusTouchstart: 'clk_express_single_consignment_weight_add_v1',
}

const minusTouchstart = () => {
  window.$umpOtherReport('CLK', { eventCode: map['minusTouchstart'] }, { number_quantity: actualWeight.value })
}

const plusTouchstart = () => {
  window.$umpOtherReport('CLK', { eventCode: map['plusTouchstart'] }, { number_quantity: actualWeight.value })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
