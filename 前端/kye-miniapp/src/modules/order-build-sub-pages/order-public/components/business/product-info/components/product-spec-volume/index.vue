<template>
  <ky-cell
    v-if="visible"
    :class="`${props?.moduleStyle === 'popup' ? 'product-info-volume-size-popup' : ''}`"
    :style="{ overflow: 'unset' }"
    v-exposure-report="{
      eventCode: 'exp_express_single_consignment_vol_v1',
    }"
  >
    <template #title>
      <div class="flex space-between product-volume w-full product-stepper-content">
        <div class="font-level3 flex items-center product-volume-item" id="volumeContainer">
          <span class="volume-label">
            总体积<SvgIcon class="product-spec-required" name="required" v-if="required" />
          </span>
          <!-- 抛重提示 -->
          <span v-if="isShowGrossWeightTips" class="gross-weight-tips">{{ grossWeightTips }}</span>
        </div>
        <div>
          <KyStepper
            input-stuffix="m³"
            :disabled="!editable"
            v-model.number="volumeSize"
            :min="0"
            :max="9999"
            type="digit"
            :disable-minus="volumeSize < 1 ? true : false"
            data-validate="productInfo.volumeSize"
            id="productInfo_volumeSize"
            :formatter="formatter"
            :focusClearZone="true"
            @plus="onVolumeChange"
            @minus="onVolumeChange"
            @blur="onVolumeChange"
            @minusTouchstart="minusTouchstart"
            @plusTouchstart="plusTouchstart"
            v-click-report="{
              eventCode: 'clk_express_single_consignment_vol_v1',
            }"
            v-keyboard
          />
        </div>
      </div>
    </template>
  </ky-cell>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { SubComponentsProps } from '@order-public-sub-public/components/business/product-info/types'
import { useActualWeight, useCount, usePreWaybillGoodsSizeList, useVolumeSize } from '../../hooks/useState'
import { useValidate } from '../../hooks/useValidate'
import { useOverLengthAndWeight, isShowGrossWeightTips, grossWeightTips } from '../../hooks/useOverLengthAndWeigth'
import KyStepper from '@order-public-sub-public/components/ui/stepper/index.vue'
import { touchstartType } from '@order-public-sub-public/components/ui/stepper/types'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { debounce } from 'lodash-es'
import { MIN_DEBOUNCE_TIME, MAX_DEBOUNCE_TIME } from '@order-public-sub-public/constants'
import vKeyboard from '@order-public-sub-public/directives/keyboard'

const { actualWeight } = useActualWeight()
const { preWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()
const { count } = useCount()

const { volumeSize, setVolumeSize } = useVolumeSize()

const props = defineProps<SubComponentsProps>()

const emit = defineEmits(['change'])

const { useProductInfoValidate } = useValidate()

const onVolumeChange = debounce(async () => {
  if (!volumeSize.value || String(volumeSize.value) === '.') {
    setVolumeSize(0)
  }
  emit('change', volumeSize.value)

  if (props?.moduleStyle !== 'unfold') {
    try {
      closeTippy()
      await useProductInfoValidate('volumeSize', true)
    } catch (error) {
      console.error(error)
    }
  }

  onChange()
  window.$umpOtherReport(
    'OTHER',
    { eventCode: 'other_express_single_consignment_vol_v1' },
    { number_quantity: volumeSize.value },
  )
}, MIN_DEBOUNCE_TIME)

const formatter = (value: string | number) => {
  value = value.toString().replace(/^[。.]/, '')
  value = value.toString().replace(/[^\d.]/g, '')

  const parts = value.split('.')
  if (parts[0].length > 4) {
    parts[0] = parts[0].substring(0, 4)
  }

  if (parts[1] && parts[1].length > 3) {
    parts[1] = parts[1].substring(0, 3)
  }

  value = parts.join('.')

  return value.toString()
}
const onChange = debounce(async () => {
  await useOverLengthAndWeight(
    count.value,
    actualWeight.value,
    preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
  )
}, MAX_DEBOUNCE_TIME)

const map: Record<touchstartType, string> = {
  minusTouchstart: 'clk_express_single_consignment_vol_reduce_v1',
  plusTouchstart: 'clk_express_single_consignment_vol_add_v1',
}

const minusTouchstart = () => {
  window.$umpOtherReport('CLK', { eventCode: map['minusTouchstart'] }, { number_quantity: volumeSize.value })
}

const plusTouchstart = () => {
  window.$umpOtherReport('CLK', { eventCode: map['plusTouchstart'] }, { number_quantity: volumeSize.value })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
