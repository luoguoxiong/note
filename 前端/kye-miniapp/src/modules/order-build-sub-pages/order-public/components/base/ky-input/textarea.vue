<template>
  <div class="ky-textarea">
    <ky-textarea
      v-bind="$attrs"
      :rows="rows"
      :value="value"
      :autosize="autosize"
      type="textarea"
      :formatter="typeof formatter === 'function' ? formatter : filterEmoji"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :show-word-limit="showWordLimit"
      :readonly="readonly"
      clear-trigger="always"
      clear-icon="none"
      :right-icon="value && 'clear'"
      @clear="onClear"
      :clearable="clearable"
      ref="textAreaRef"
      autocomplete="off"
    >
      <slot name="extra" />
      <slot name="input" />
    </ky-textarea>
  </div>
</template>

<script setup lang="ts">
// import { Field } from 'vant'
import { filterEmoji } from './utils'
import { ref } from 'vue'

export interface KyTextAreaProps {
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
}

const textAreaRef = ref<InstanceType<typeof Field> | null>()

defineExpose({
  textAreaRef,
})

defineProps<KyTextAreaProps>()

const emit = defineEmits(['clear'])

const onClear = () => {
  emit('clear')
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './textarea.scss';
</style>
