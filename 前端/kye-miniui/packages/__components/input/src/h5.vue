<template>
  <view :class="wrapperClass">
    <slot name="left"></slot>

    <!-- 自定义 placeholder -->
    <view v-if="customPlaceholder && !currentValue" class="ky-input-placeholder">
      <text class="ky-input-placeholder-text">
        {{ placeholder }}
      </text>
    </view>

    <!-- 输入框 -->
    <view :class="[className('input-container'), 'ky-input-box--container']" @click="handleClick">
      <view v-if="disabled || readonly" :class="className('disabled-masker')" />

      <input
        :id="nativeId"
        ref="inputRef"
        v-bind="attrs"
        :type="type"
        :value="currentValue"
        :maxlength="maxlength"
        :placeholder="placeholderValue"
        :disabled="disabled"
        :cursorSpacing="cursorSpacing"
        :adjust-position="adjustPosition"
        :style="inputStyle"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @confirm="handleConfirm"
        @paste="handlePaste"
      />
    </view>

    <!-- 清除按钮 -->
    <view
      v-if="clearable && !disabled"
      :class="[className('clear'), { 'input-clear-icon-hidden': !showClear }]"
      @touchstart="handleClear"
    >
      <view :class="className('clear-icon')" />
    </view>

    <!-- clear mask -->
    <view v-show="showClearMask" class="ky-input--clear-mask" />

    <!-- 右侧插槽 -->
    <view v-if="$slots.right" :class="className('right-slot')">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script setup lang="ts" name="ky-input">
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch, onMounted } from 'vue'
import './index.scss'
import { KyInputProps } from '@packages/__components/input/src/types'
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
  customPlaceholder: false,
  inputDebounce: 0,
  cursorSpacing: 0,
  cursor: -1,
  clearDisplaySpace: false,
  clearDisplay: false,
  adjustPosition: true,
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
  showClear,
  showClearMask,
  currentValue,
  wrapperClass,
  updateFocusState,
  handleBlur,
  handleClear,
  handleConfirm,
  handleClick,
  handleFocus,
  handleInput,
  className,
} = useCommon(props, emit)

const attrs = useAttrs()

const inputRef = ref<any>(null)

const placeholderValue = computed(() => {
  return props.customPlaceholder ? '' : props.placeholder
})

const inputStyle = computed(() => {
  return {
    fontWeight: currentValue.value ? 'bold' : 'normal',
  }
})

const handlePaste = (e: ClipboardEvent) => {
  emit('change', e)
}

const focusBySelf = async () => {
  await nextTick()
  inputRef.value?.$el?.children[0]?.focus()
}

const exposeBlur = () => {
  updateFocusState(false)
  inputRef.value?.$el?.children[0]?.blur?.()
}

let styleEl: HTMLStyleElement | null = null

const setPlaceholderStyle = (styleText: string) => {
  if (!styleText || typeof document === 'undefined') {
    return
  }

  if (!styleEl) {
    styleEl = document.createElement('style')

    document.head.appendChild(styleEl)
  }

  styleEl.innerHTML = `
    #${nativeId} input::placeholder {
      ${styleText}
    }
  `
}

watch(
  () => props.placeholderStyle,
  (val) => {
    setPlaceholderStyle(val || '')
  },
  {
    immediate: true,
  },
)

const setFocus = async () => {
  if (attrs?.shouldFocus) {
    updateFocusState(props.focus)
  }

  if (props.focus) {
    await focusBySelf()
  }
}

watch(
  () => props.focus,
  async () => {
    setFocus()
  },
)
let timer: any = null

onMounted(() => {
  // input 标签渲染比较晚，添加200ms 延迟，确保已经渲染
  timer = setTimeout(() => {
    setFocus()
  }, 200)
})

onBeforeUnmount(() => {
  styleEl?.remove()
  styleEl = null
  clearTimeout(timer)
})

defineExpose({
  focus: focusBySelf,
  blur: exposeBlur,
  clear: handleClear,
})
</script>
