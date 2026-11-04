<template>
  <ky-textarea
    class="kye-order-custom-textarea"
    :class="customInputClassCmp"
    v-bind="$attrs"
    :rows="rows"
    :autosize="autosize"
    :modelValue="modelValue"
    type="textarea"
    :formatter="typeof formatter === 'function' ? formatter : filterEmoji"
    :maxLength="maxlength"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :placeholder-style="'line-height: 40rpx;'"
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
import { computed } from 'vue'
import { filterEmoji } from '../ky-input-base/utils'
import { ref } from 'vue'

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

<style lang="scss">
@import '../../../styles/index.scss';
@import './index.scss';
</style>
