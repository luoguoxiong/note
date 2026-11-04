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
      class="code-input__input"
      type="number"
      ref="inputRef"
      :maxlength="length"
      :value="modelValue"
      :cursor-spacing="100"
      :enableNative="false"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import './index.scss'

const props = defineProps({
  length: { type: Number, default: 6 },
  modelValue: { type: String, default: '' },
  error: { type: Boolean, default: false },
  /* 挂载后是否自动聚焦拉起软键盘 */
  autoFocus: { type: Boolean, default: true },
})

defineOptions({ name: 'CodeInput' })

const emits = defineEmits(['update:modelValue', 'complete'])

const focused = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const focus = () => {
  inputRef.value?.focus()
}

onMounted(() => {
  if (!props.autoFocus) return
  setTimeout(focus, 400)
})

const onInput = (event: Event) => {
  const targetValue = (event.target as HTMLInputElement).value
  const value = targetValue.replace(/[^0-9]/g, '')

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

defineExpose({
  focus,
})
</script>
