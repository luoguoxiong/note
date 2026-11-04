<template>
  <ky-textarea
    class="order-custom-textarea"
    :class="customInputClassCmp"
    v-bind="$attrs"
    :rows="rows"
    :autosize="autosize"
    :modelValue="modelValue"
    type="textarea"
    :formatter="typeof formatter === 'function' ? formatter : filterEmojis"
    :maxLength="maxlength"
    :placeholder="placeholder"
    :show-word-limit="showWordLimit"
    :readonly="readonly"
    clear-trigger="always"
    clear-icon="none"
    :right-icon="value && 'clear'"
    @clear="onClear"
    @click="onClick"
    :clearable="clearable"
    ref="textAreaRef"
    autocomplete="off"
  >
    <slot name="extra" />
    <slot name="input" />
  </ky-textarea>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { filterEmojis } from '../../utils/pattern'
import './index.scss'

export interface KyTextAreaProps {
  customInputClass?: string
  value?: string
  rows?: number | string
  autosize?: boolean
  formatter?: (value: string) => string
  maxlength?: number
  placeholder?: string
  showWordLimit?: boolean
  readonly?: boolean
  clearable?: boolean
  modelValue?: string
  dataValidate?: string
}

const textAreaRef = ref<InstanceType<any> | null>()

defineExpose({
  textAreaRef,
})

const props = defineProps<KyTextAreaProps>()

const customInputClassCmp = computed(() => {
  let str = `textarea-${props.rows}`
  if (props.customInputClass) {
    str += ` ${props.customInputClass}`
  }
  return str
})

const emit = defineEmits(['clear', 'click'])

const onClear = () => {
  emit('clear')
}
const onClick = () => {
  emit('click')
}
</script>
