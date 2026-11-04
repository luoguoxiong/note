<template>
  <ProductSpecWeightBus class="freight-time-product-spec-weight">
    <template #stepper>
      <KyStepper
        :data-validate="'productInfo.actualWeight'"
        id="productInfo_actualWeight"
        input-stuffix="kg"
        v-model.number="actualWeight"
        :min="0"
        :max="60000"
        type="digit"
        :formatter="formatter"
        :disable-minus="actualWeight < 1 ? true : false"
        :focusClearZone="true"
        @focus="onFocus"
        @blur="onActualWeightChange"
        @minus="onActualWeightChange"
        @plus="onActualWeightChange"
        @minusTouchstart="minusTouchstart"
        @plusTouchstart="plusTouchstart"
        v-keyboard
        :isError="popoverConfig.content"
      ></KyStepper>
    </template>
  </ProductSpecWeightBus>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ProductSpecWeightBus from '@order-global-package-freight-time/components/business/product-spec-weight-bus/index.vue'
import KyStepper from '@order-global-package-freight-time/components/ui/stepper-ui/index.vue'
import { useFreightTimeStore } from '@freight-time/store'
import { useValidate } from '@freight-time/validate/useValidate'
import { openValidateKey, closeValidateKey, getSingleWeightSum, getDisplayWeightSum } from './useActualWeightValidate'
import { reportOther } from '@freight-time/report'

const { validateObj } = useValidate()

const popoverConfig = computed(() => {
  return validateObj['productInfo.actualWeight'] || {}
})

const store = useFreightTimeStore()

// 记录 minus 前的值，用于拦截回退
const isMinusBlocked = ref(false)
const prevActualWeight = ref(0)

const actualWeight = computed({
  get: () => store.getActualWeight,
  set: (val: number) => store.setActualWeight(val),
})

const formatter = (value: number | string) => {
  value = value.toString().replace(/^[。.]/, '')
  value = value.toString().replace(/[^\d.]/g, '')

  // 如果有多个小数点，只保留第一个出现的小数点
  const partsDigit = value.split('.')
  if (partsDigit.length > 2) {
    // 如果分割后的数组长度大于2，意味着有超过一个小数点
    value = partsDigit[0] + '.' + partsDigit.slice(1).join('') // 只保留第一个小数点，其余的去掉
  } else {
    value = partsDigit.join('.') // 原始情况，直接连接
  }

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

const onActualWeightChange = () => {
  // minus 拦截回退：如果 minus 被拦截，恢复之前的值
  if (isMinusBlocked.value) {
    store.setActualWeight(prevActualWeight.value)
    isMinusBlocked.value = false
    return
  }

  if (!actualWeight.value || String(actualWeight.value) === '.') {
    store.setActualWeight(0)
  }
  // 失焦校验：总重量不能小于单件重量*件数之和
  const weightSum = getSingleWeightSum()
  if (weightSum > 0 && (actualWeight.value || 0) < weightSum) {
    const displaySum = getDisplayWeightSum()
    openValidateKey(`总重量不能小于单件重量*件数之和${displaySum.toFixed(2)}kg`)
  }

  reportOther('other_express_single_consignment_weight_v1', {
    number_weight: actualWeight.value,
  })
}

const onFocus = () => {
  closeValidateKey()
}

const minusTouchstart = () => {
  closeValidateKey()
  // 点击-校验：若总重量-1后小于单件重量*件数之和，则拦截并toast提示
  const weightSum = getSingleWeightSum()
  if (weightSum > 0 && (actualWeight.value || 0) - 1 < weightSum) {
    isMinusBlocked.value = true
    prevActualWeight.value = actualWeight.value || 0
    const displaySum = getDisplayWeightSum()
    openValidateKey(`总重量不能小于单件重量*件数之和${displaySum.toFixed(2)}kg`)
  }
}

const plusTouchstart = () => {
  closeValidateKey()
}
</script>
