<!-- 适用于一行输入的input -->
<template>
  <section class="ky-textarea" :class="{ 'ky-textarea__focus': isFocus }">
    <ElInput
      v-bind="{ ...$props, ...$attrs, type: 'textarea', showWordLimit: false }"
      :class="{ 'is-error': isError, clearable: needShowClearBtn }"
      autocomplete="off"
      @update:model-value="updateModelValue"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
    >
    </ElInput>

    <div class="limit-wrapper">
      <span class="limit" v-if="maxlength">
        <span v-if="currentLength >= maxlength && (isFocus || permanentMaxLengthTip)" class="warn">字数已达上限</span>
        <span>{{ ('' + modelValue).length }}</span>
        <span>/{{ maxlength }}</span>
      </span>
      <span :class="{ 'clear-btn': needShowClearBtn }">
        <SvgIcon :name="'clear'" v-show="needShowClearBtn" @click="onClear" class="icon-clear" />
      </span>

      <slot name="default"></slot>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ElInput } from 'element-plus'
import { KyTextAreaProps } from '@/components/base/ky-input/types'

const emits = defineEmits(['update:modelValue', 'clear', 'onInput', 'onBlur', 'onFocus'])
const props = defineProps<KyTextAreaProps>()
const isFocus = ref(false)

const needShowClearBtn = computed(() => {
  return !!props.clearable && (props.modelValue as string)?.length > 0
})

const currentLength = computed(() => {
  const { modelValue = '', maxlength } = props

  if (!maxlength) return 0

  return ('' + modelValue).length
})

function updateModelValue(value: string) {
  emits('update:modelValue', value)
}

function onClear() {
  emits('update:modelValue', '')
  emits('onInput', '')
  emits('clear')
}

function onInput(value: string) {
  emits('onInput', value)
}

function onBlur(e: FocusEvent) {
  isFocus.value = false
  emits('onBlur', e)
}

function onFocus(e: FocusEvent) {
  isFocus.value = true
  emits('onFocus', e)
}
</script>

<style scoped lang="scss">
@import './textarea.scss';
.ky-textarea {
  position: relative;
  padding: 8px 2px 8px 8px;
  border: 1px solid #e6e8ed;
  border-radius: 4px;

  > .limit-wrapper {
    font-size: $font-size-xs;

    > .limit {
      position: absolute;
      padding-top: 3px;
      color: #686b75;
      font-weight: 400;

      > .warn {
        margin-right: 8px;
        color: $red-color-text;
      }
    }
  }
  &:hover {
    border-color: $text-color-level4;
  }
  &__focus {
    border-color: $primary;
    &:hover {
      border-color: $primary;
    }
  }
}
</style>
