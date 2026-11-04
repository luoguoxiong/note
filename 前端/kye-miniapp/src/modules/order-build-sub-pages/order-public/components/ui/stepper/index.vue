<template>
  <div class="stepper flex items-center">
    <ky-button
      icon="minus"
      :disabled="disabled || inputValueMin || disableMinus"
      @click="handleMinus"
      @touchstart="touchstart('minusTouchstart')"
    >
      <!-- <SvgIcon name="stepper-minus" /> -->
      <image
        v-if="disabled || inputValueMin || disableMinus"
        mode="aspectFit"
        src="https://ic-img.ky-express.com/default/20250825_18727_!!1756111493584_120_120.png"
        class="stepper-minus__icon"
      />
      <image
        v-else
        mode="aspectFit"
        src="https://ic-img.ky-express.com/default/20250825_21943_!!1756089458673_60_60.svg+xml"
        class="stepper-minus__icon"
      />
    </ky-button>
    <div
      :class="`stepper-form-content flex items-center ${isFoucs ? 'stepper-form-content-focus' : ''} ${
        valueSize === 0 ? 'empty' : 'notEmpty'
      }`"
    >
      <ky-input
        class="stepper-input"
        :disabled="disabled"
        v-model="inputValue"
        :formatter="formatter"
        :maxlength="maxlength"
        :enableNative="false"
        :always-system="!isAmapApp"
        :always-system-gd="false"
        :type="type"
        :data-validate="dataValidate"
        :id="dataValidate"
        :clearable="false"
        :isError="popoverConfig.content"
        autocomplete="off"
        @update:model-value="updateValue"
        @blur="onBlur"
        @focus="onFocus"
      ></ky-input>
      <span class="form-tips-des mr-16">{{ inputStuffix }}</span>
    </div>
    <ky-button
      icon="plus"
      :disabled="disabled || Number(inputValue) >= max"
      @click="handlePlus"
      @touchstart="touchstart('plusTouchstart')"
    >
      <!-- <SvgIcon name="stepper-plus" /> -->
      <image
        v-if="disabled || Number(inputValue) >= max"
        mode="aspectFit"
        src="https://ic-img.ky-express.com/default/20250825_14144_!!1756111591075_120_120.png"
        class="stepper-plus__icon"
      />
      <image
        v-else
        mode="aspectFit"
        src="https://ic-img.ky-express.com/default/20250825_37411_!!1756091025666_60_60.svg+xml"
        class="stepper-plus__icon"
      />
    </ky-button>
    <div v-if="disabled" class="overlay" @click="clickOverlay"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FieldType } from '@order-public-sub-public/hooks/useShowToast'
import { isAmapApp, isEmptyText } from '@order-public-sub-public/utils'
import { touchstartType } from './types'
import { useValidate } from '@order-public-sub-public/hooks/useValidate'

type KyStepperProps = {
  modelValue: number | string | null
  inputStuffix: string
  disabled?: boolean
  max: number
  min?: number
  maxlength?: number
  type?: FieldType
  canEmpty?: boolean
  disableMinus?: boolean
  formatter?: (value: string | number) => string
  dataValidate?: string
  focusClearZone?: boolean
  defaultInputValue?: number
}

const props = defineProps<KyStepperProps>()

const isFoucs = ref(false)
const { validateObj, removeValidateKey } = useValidate()
const emit = defineEmits([
  'change',
  'blur',
  'minus',
  'plus',
  'update:modelValue',
  'minusTouchstart',
  'plusTouchstart',
  'focus',
  'clickOverlay',
])

const popoverConfig = computed(() => {
  return validateObj[props.dataValidate as keyof validateObj] || {}
})
const inputValueMin = computed(() => {
  if (!isEmptyText(props.min)) {
    const min = props.min as number
    return Number(inputValue.value) <= min
  }
  return false
})

const inputValue = computed({
  get() {
    if (props?.canEmpty) {
      return props.modelValue as number
    }
    // 输入框获取焦点时 数据为0时，转为空
    if (isFoucs.value && props.focusClearZone && Number(props.modelValue) === 0) {
      return ''
    }
    return props.modelValue ?? 0
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const valueSize = computed(() => {
  return ('' + inputValue.value).length
})

const updateValue = (value: string) => {
  emit('update:modelValue', value)
  emit('change')

  // 当为0的时候重新设置光标
  if (Number(value) === 0 && props?.dataValidate && isFoucs.value) {
    const inputDom = document.getElementById(props.dataValidate as string) as HTMLInputElement
    const length = value.length
    if (inputDom) {
      inputDom?.setSelectionRange(length, length)
    }
  }
}

const handleMinus = () => {
  if (props?.disableMinus) return
  const val = inputValue.value as number
  const value = val.toString()
  const len = value?.includes('.') && value?.split('.')[1].length
  inputValue.value = (Number(value) - 1).toFixed(len || 0)
  isFoucs.value = false
  emit('minus')
  emit('change')
}

const handlePlus = () => {
  const val = inputValue.value as number
  const value = (val || '').toString()
  const len = value?.includes('.') && value?.split('.')[1].length
  inputValue.value = (Number(value) + 1).toFixed(len || 0)
  isFoucs.value = false
  emit('plus')
  emit('change')
}

const onBlur = () => {
  isFoucs.value = false
  emit('blur')
}

const onFocus = () => {
  isFoucs.value = true
  emit('focus')
  removeValidateKey(props.dataValidate)
}

const touchstart = (type: touchstartType) => {
  if (props.disabled) return
  emit(type)
}

const clickOverlay = () => {
  console.log('clickOverlay')
  emit('clickOverlay')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
