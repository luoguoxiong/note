<!--
  验证码输入组件
  显示分隔的验证码输入框
-->
<template>
  <view class="code-input">
    <view v-for="(item, index) in length" :key="index" class="code-input__item">
      <view class="code-input__text">{{ value[index] }}</view>
      <view v-if="focused && value.length === index" class="code-input__cursor"></view>
    </view>
    <input
      class="code-input__input"
      type="number"
      :maxlength="length"
      :value="value"
      :cursor="value.length"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'

defineOptions({ name: 'CodeInput' })

// Props
interface Props {
  length?: number
  onSubmit?: (value: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  length: 4,
})

// Emits
const emit = defineEmits<{
  submit: [value: string]
}>()

// 状态
const value = ref('')
const focused = ref(false)

// 方法
const onInput = (e: any) => {
  const inputValue = e.detail.value
  value.value = inputValue
  if (inputValue.length === props.length) {
    Taro.hideKeyboard()
    // 支持两种调用方式：prop和事件
    props.onSubmit && props.onSubmit(inputValue)
    emit('submit', inputValue)
  }
}

const onFocus = () => {
  focused.value = true
}

const onBlur = () => {
  focused.value = false
}

const clearValue = () => {
  value.value = ''
}

// 暴露方法给父组件
defineExpose({
  clearValue,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
