<template>
  <ky-cell
    v-if="visible"
    :class="`${props?.moduleStyle === 'popup' ? 'product-info-count-popup' : ''}`"
    :style="{ overflow: 'unset' }"
    id="product-spec-piece-id"
    v-exposure-report="{
      eventCode: 'exp_express_single_consignment_num_v1',
    }"
  >
    <template #title>
      <div class="flex space-between w-full product-stepper-content">
        <div class="font-level3 flex items-center">
          总件数/箱数<SvgIcon class="product-spec-required" name="required" v-if="required" />
        </div>
        <div>
          <KyStepper
            input-stuffix="件"
            :disabled="disabled"
            :disableMinus="disableMinus"
            v-model.number="count"
            :min="0"
            :max="9999"
            type="number"
            :maxlength="4"
            data-validate="productInfo.count"
            id="productInfo_count"
            :focusClearZone="true"
            @blur="onChange"
            @minus="onChange"
            @plus="onChange"
            @minusTouchstart="minusTouchstart"
            @plusTouchstart="plusTouchstart"
            @click-overlay="onClickOverlay"
            v-click-report="{
              eventCode: 'clk_express_single_consignment_num_v1',
            }"
            v-keyboard
          ></KyStepper>
        </div>
      </div>
    </template>
  </ky-cell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { SubComponentsProps } from '@order-public-sub-public/components/business/product-info/types'
import { useCount, useActualWeight, usePreWaybillGoodsSizeList } from '../../hooks/useState'
import { useOverLengthAndWeight } from '../../hooks/useOverLengthAndWeigth'
import { useValidate } from '../../hooks/useValidate'
import KyStepper from '@order-public-sub-public/components/ui/stepper/index.vue'
import { touchstartType } from '@order-public-sub-public/components/ui/stepper/types'
import { closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { getTotalCount } from '../../utils/index'
import { debounce } from 'lodash-es'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useUpdateStore } from '@order-public-sub-public/components/business/product-info/hooks/useModuleStore'
import { MIN_DEBOUNCE_TIME, MAX_DEBOUNCE_TIME, ModuleType } from '@order-public-sub-public/constants'

import { ProductInfoDimensionEditable } from '@order-public-sub-public/types'
import vKeyboard from '@order-public-sub-public/directives/keyboard'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { count, setCount } = useCount()
const { actualWeight } = useActualWeight()
const { preWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()

const props = defineProps<SubComponentsProps>()

const { useProductInfoValidate } = useValidate()

const emit = defineEmits(['change'])

const productInfoDimension = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['货物信息件数编辑'])
})

const onChange = debounce(
  async () => {
    if (!count.value) {
      setCount(0)
    }

    emit('change', count.value)

    if (props?.moduleStyle !== 'unfold') {
      try {
        closeTippy()
        await useProductInfoValidate('count', true)
      } catch (error) {
        console.error(error)
      }
    }

    if (props?.moduleStyle === 'unfold') {
      useUpdateStore({
        count: count.value,
      })
    }
    updateOverLengthAndWeight()
    window.$umpOtherReport(
      'OTHER',
      { eventCode: 'other_express_single_consignment_num_v1' },
      { number_quantity: count.value },
    )
  },
  MIN_DEBOUNCE_TIME,
  { leading: true },
)

const updateOverLengthAndWeight = debounce(async () => {
  await useOverLengthAndWeight(
    count.value,
    actualWeight.value,
    preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index })),
  )
}, MAX_DEBOUNCE_TIME)

const disableMinus = computed(() => {
  return count.value <= getTotalCount.value || count.value < 1
})

const map: Record<touchstartType, string> = {
  minusTouchstart: 'clk_express_single_consignment_num_reduce_v1',
  plusTouchstart: 'clk_express_single_consignment_num_add_v1',
}

//置灰，减少按钮点击提醒
const minusTouchstart = () => {
  const totalCount = getTotalCount.value
  const countValue = count.value
  const totalCountOverCount = countValue && countValue <= totalCount
  if (totalCountOverCount) {
    showToast(`件数/箱数不能小于规格尺寸件数之和${totalCount}件`)
  }
  window.$umpOtherReport('CLK', { eventCode: map['minusTouchstart'] }, { number_quantity: count.value })
}

const plusTouchstart = () => {
  window.$umpOtherReport('CLK', { eventCode: map['plusTouchstart'] }, { number_quantity: count.value })
}

/**
 * @description 禁用条件：不可编辑（配置、一票多件修改运单）
 */
const disabled = computed(() => {
  return props.editable === false || productInfoDimension.value?.countEditable === false
})

const showDisableToast = () => {
  if (productInfoDimension.value?.countEditable === false) {
    showToast(productInfoDimension.value.disabledTips)
  }
}

/**
 * @description 兼容PC小程序的点击
 */
const onClickOverlay = () => {
  showDisableToast()
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
