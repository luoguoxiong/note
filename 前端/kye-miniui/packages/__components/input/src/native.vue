<template>
  <view :class="wrapperClass">
    <slot name="left"></slot>
    <view class="ky-input-placeholder" v-if="customPlaceholder && !modelValue" :style="placeholderStylesString">
      <text class="ky-input-placeholder-text">{{ placeholder }}</text>
    </view>
    <view :class="[className('input-container'), 'ky-input-box--container']" @click="handleClick">
      <view v-if="disabled || readonly" :class="className('disabled-masker')"></view>
      <template v-if="isEnvWeApp">
        <!--  微信移动端-原生input组件参数显式写入   -->
        <custom-input
          v-bind="inputPropsNativePlatform"
          :class="nativeId"
          class="ky-input-native"
          :type="type"
          :value="currentValue"
          :placeholder="placeholderValue"
          :placeholder-style="placeholderStylesString"
          :disabled="disabled"
          :cursorSpacing="cursorSpacing"
          :cursor="cursor"
          :password="password"
          :maxlength="maxlength"
          :inputDebounce="inputDebounce"
          :adjustPosition="adjustPosition"
          :selectionStart="inputPropsNativePlatform['selection-start']"
          :selectionEnd="inputPropsNativePlatform['selection-end']"
          :hold-keyboard="inputPropsNativePlatform['hold-keyboard']"
          :always-embed="inputPropsNativePlatform['always-embed']"
          :focus="focusState"
          :formatter="inputPropsNativePlatform['formatter']"
          @input="handleNaitveInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @confirm="handleConfirm"
          @keyboardHeightChange="handleKeyboardHeightChange"
        ></custom-input>
      </template>
      <template v-else>
        <input
          v-bind="inputPropsNativePlatform"
          :type="type"
          :value="currentValue"
          :placeholder="placeholderValue"
          :disabled="disabled"
          :maxlength="maxlength"
          :password="password"
          :placeholder-style="placeholderStylesString"
          :alwaysSystem="alwaysSystemValue"
          :enableNative="enableNative"
          :cursorSpacing="cursorSpacing"
          :adjust-position="adjustPosition"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @confirm="handleConfirm"
          @keyboardHeightChange="handleKeyboardHeightChange"
          :style="`font-weight: ${currentValue ? 'bold' : 'normal'}`"
        />
      </template>
    </view>
    <view
      :class="[className('clear'), { 'input-clear-icon-hidden': !showClear }]"
      v-if="clearable && !disabled"
      @click="handleClear"
    >
      <view :class="className('clear-icon')"></view>
    </view>
    <view class="ky-input--clear-mask" v-show="showClearMask"></view>
    <view :class="className('right-slot')" v-if="$slots.right">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script setup lang="ts" name="ky-input">
import { computed, useAttrs, watch, onMounted, onBeforeUnmount } from 'vue'
import './index.scss'
import { KyInputProps } from '@packages/__components/input/src/types'
import { isWxAppOhosEnv, getSystemInfo } from '@ky-miniui-lib/utils'
import { useCommon } from './useCommon'

const props = withDefaults(defineProps<KyInputProps>(), {
  disabled: false,
  modelValue: '',
  type: 'text',
  clearable: true,
  isError: false,
  size: 'normal',
  border: 'all',
  clearTrigger: 'focus',
  textAlign: 'left',
  alwaysSystem: false,
  enableNative: true,
  customPlaceholder: false,
  inputDebounce: 0,
  cursorSpacing: 0,
  cursor: -1,
  clearDisplaySpace: false,
  clearDisplay: false,
  adjustPosition: true,
  readonly: false,
})

const emit = defineEmits([
  'change',
  'update:modelValue',
  'focus',
  'blur',
  'clear',
  'input',
  'confirm',
  'keyboardHeightChange',
  'click',
])

const {
  nativeId,
  isAliApp,
  isEnvWeApp,
  focusState,
  showClear,
  showClearMask,
  currentValue,
  wrapperClass,
  updateFocusState,
  handleBlur,
  handleClear,
  handleConfirm,
  handleFocus,
  handleInput,
  handleClick,
  handleNaitveInput,
  handleKeyboardHeightChange,
  className,
} = useCommon(props, emit)

/* 环境变量 */
const attrs = useAttrs()

const systemInfo = getSystemInfo()

/* 动态props传参-适配不同端 */
const inputPropsNativePlatform = computed(() => {
  const shouldFocusComputed = !isWxAppOhosEnv
  const result: Record<string, any> = {
    ...props,
    ...(attrs || {}), // 未声明
    shouldFocus: shouldFocusComputed,
  }
  result.focus = focusState.value
  // 未开启focus受控-移除focus属性
  if (!shouldFocusComputed) {
    delete result.focus
  }
  return result
})

/* 配置always-system: */
const alwaysSystemValue = computed(() => {
  // 鸿蒙number 需要默认开启always-system
  if (props.type === 'number' && systemInfo?.platform?.includes('Harmony')) {
    return true
  }
  return props.alwaysSystem
})

/* 配置enableNative: */
const enableNative = computed(() => {
  // 支付宝-安卓手机-清空按钮默认需要开启false
  if (isAliApp && props.clearable && systemInfo?.platform?.includes('Android')) {
    return false
  }
  return props.enableNative
})

/* 系统placeholder值 */
const placeholderValue = computed(() => {
  // 安卓端-placeholder不使用，开启customPlaceholder 使用自定义placeholder
  if (props.customPlaceholder) {
    return ''
  } else {
    return props.placeholder
  }
})

// placeholder-style样式
const placeholderStylesString = computed(() => {
  return `${props.placeholderStyle || ''}${props.isError ? 'color:#FF706D' : 'color:#ADB0B8'}`
})

let isMounted = false

/* 受控focus状态 */
watch(
  () => props.focus,
  (val) => {
    if (props.focus && isMounted) {
      updateFocusState(true)
    }
  },
)

let timer: any = null

onMounted(() => {
  isMounted = true
  if (props.focus) {
    // 确保输入框已经渲染
    const deleay = isAliApp ? 1000 : 0
    timer = setTimeout(() => {
      updateFocusState(true)
    }, deleay)
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})

const exposeFocus = () => {
  if (props.disabled) {
    return
  }
  updateFocusState(true)
}

const exposeBlur = () => {
  updateFocusState(false)
}

defineExpose({
  focus: exposeFocus,
  blur: exposeBlur,
  clear: handleClear,
})
</script>
