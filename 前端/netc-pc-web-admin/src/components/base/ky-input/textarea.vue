<template>
  <!-- section 这个壳子需要存在，deep修改 Element-Plus 的样式才会生效 -->
  <template v-if="rows === 1">
    <section class="ky-textarea one-row" :class="{ 'ky-textarea__focus': isFocus }">
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
          <span v-else>{{ startCount(modelValue) }}</span>
          <span>/{{ maxlength }}</span>
        </span>
        <span :class="{ 'clear-btn': needShowClearBtn }">
          <SvgIcon :name="'clear'" v-show="needShowClearBtn" @click="onClear" class="icon-clear" />
        </span>

        <slot name="default"></slot>
      </div>
    </section>
  </template>
  <template v-else>
    <section class="ky-textarea" :class="{ 'ky-textarea__focus': isFocus }">
      <ElInput
        v-bind="{ ...$props, ...$attrs, type: 'textarea', showWordLimit: false }"
        :class="{ 'is-error': isError, clearable: needShowClearBtn }"
        :autosize="{ minRows: rows || 2, maxRows: 6 }"
        autocomplete="off"
        @update:model-value="updateModelValue"
        @input="onInput"
        @blur="onBlur"
        :formatter="formatter"
        @focus="onFocus"
      >
      </ElInput>

      <aside>
        <div>
          <slot name="before"></slot>
        </div>
        <div class="aside-right">
          <span class="limit" v-if="maxlength">
            <span v-if="currentLength >= maxlength && (isFocus || permanentMaxLengthTip)" class="warn"
              >字数已达上限</span
            >
            <span v-else>{{ startCount(modelValue) }}</span>
            <span>/{{ maxlength }}</span>
          </span>
          <span :class="{ 'clear-btn': needShowClearBtn }">
            <SvgIcon :name="'clear'" v-show="needShowClearBtn" @click="onClear" class="icon-clear" />
          </span>
          <slot name="default"></slot>
        </div>
      </aside>
    </section>
  </template>
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

  return startCount(modelValue)
})

function startCount(modelValue: string | undefined | null | number) {
  return ('' + modelValue)?.replace(/^\s/g, '')?.length
}

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
</style>
