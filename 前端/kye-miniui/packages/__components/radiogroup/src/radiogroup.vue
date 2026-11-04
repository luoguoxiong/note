<template>
  <view class="ky-radio-group" :class="`ky-radio-group--${direction}`" v-bind="$attrs">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed, provide } from 'vue'
import { RADIO_KEY } from '@packages/__components/radiogroup/src/types'
import { RadioType } from '@packages/__components/radio/src/types'

export type RadioGroupProps = Partial<{
  modelValue: string | number | boolean
  type: RadioType
  direction: 'vertical' | 'horizontal'
  size: 'large' | 'medium' | 'normal' | 'small' | 'mini'
  disabled: boolean
  isError: boolean
  iconSize: number
  manualUpdate: boolean // 是否使用手动更新
  checkedHighlight: boolean
}>
const props = withDefaults(defineProps<RadioGroupProps>(), {
  size: 'normal',
  direction: 'vertical',
  disabled: false,
  isError: false,
  manualUpdate: false,
  checkedHighlight: false,
})

const emit = defineEmits(['change', 'update:modelValue'])

console.log('props.modelValue', props.modelValue)

/* 更新modelValue */
const updateValue = (value: string | boolean | number) => {
  console.log('updateValue', value)
  // 手动更新-不执行modelValue变更
  if (props.manualUpdate) {
    return
  }
  emit('update:modelValue', value)
  emit('change', value)
}

/* group通信暴露 */
provide(RADIO_KEY, {
  name: computed(() => props.modelValue), // 当前选中
  disabled: computed(() => props.disabled),
  type: computed(() => props.type),
  isError: computed(() => props.isError),
  size: computed(() => props.size),
  direction: computed(() => props.direction),
  iconSize: computed(() => props.iconSize),
  checkedHighlight: computed(() => props.checkedHighlight),
  updateValue,
})
</script>
