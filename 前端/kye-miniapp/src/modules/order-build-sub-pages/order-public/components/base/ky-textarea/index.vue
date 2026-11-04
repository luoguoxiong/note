<template>
  <ky-textarea
    class="order-custom-textarea"
    :class="customInputClassCmp"
    v-bind="$attrs"
    :rows="rows"
    :isError="popoverConfig.content"
    :autosize="autosize"
    :modelValue="modelValue"
    type="textarea"
    :formatter="typeof formatter === 'function' ? formatter : filterEmoji"
    :maxLength="maxlength"
    :maxlength="maxlength"
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
import { computed } from 'vue'
import { filterEmoji } from '../ky-input/utils'
import { ref } from 'vue'
import { useValidate } from '@order-public-sub-public/hooks/useValidate'

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
const { validateObj, removeValidateKey } = useValidate()

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
const popoverConfig = computed(() => {
  return validateObj[props.dataValidate as keyof validateObj] || {}
})

const emit = defineEmits(['clear', 'click'])

const onClear = () => {
  emit('clear')
  removeValidateKey(props.dataValidate)
}
const onClick = () => {
  emit('click')
  removeValidateKey(props.dataValidate)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
