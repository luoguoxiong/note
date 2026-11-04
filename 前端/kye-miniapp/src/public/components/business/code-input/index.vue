<template>
  <view :class="['code-input', { ['code-input--error']: error }]">
    <view
      v-for="(_, index) in length"
      :key="index"
      class="code-input__code"
      :class="
        focused && (modelValue.length === index || (modelValue.length === length && index === length - 1))
          ? 'code-input__code--hover'
          : ''
      "
    >
      <view class="code-input__text">{{ modelValue[index] }}</view>
      <view v-show="focused && modelValue.length === index" class="code-input__cursor"></view>
    </view>

    <input
      v-if="!removeInputComponent"
      class="code-input__input"
      type="number"
      ref="inputRef"
      :value="modelValue"
      :cursor-spacing="100"
      :enableNative="false"
      :always-system="true"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, defineExpose } from 'vue'
import './index.scss'

const props = defineProps({
  length: { type: Number, default: 6 },
  modelValue: { type: String, default: '' },
  error: { type: Boolean, default: false },
  removeInputComponent: { type: Boolean, default: false },
})

defineOptions({ name: 'CodeInput' })

const emits = defineEmits(['update:modelValue', 'complete'])

const focused = ref(false)
const inputRef = ref<any>(null)

const onInput = (event: any) => {
  const targetValue = event.target.value
  const value = targetValue.replace(/[^0-9]/g, '').slice(0, props.length)

  if (value === props.modelValue) return

  emits('update:modelValue', value)
  if (value.length === props.length) {
    emits('complete', value)
  }
}

const onBlur = () => {
  focused.value = false
}

const onFocus = () => {
  focused.value = true
}

const focus = () => {
  inputRef.value?.focus?.()
}

defineExpose({ focus })
</script>
