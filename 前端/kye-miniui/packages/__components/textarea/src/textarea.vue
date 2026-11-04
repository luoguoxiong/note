<template>
  <view class="ky-textarea" :class="classes">
    <view class="content">
      <!-- 自定义placeholder   -->
      <view class="ky-textarea-placeholder" v-show="showCustomPlaceholder" :style="placeholderStylesString">
        <text class="ky-textarea-placeholder-text">{{ placeholder }}</text>
      </view>
      <template v-if="isEnvWeApp">
        <view class="ky-custom-textarea">
          <custom-textarea
            v-bind="nativeAttrs"
            :class="nativeId"
            class="ky-textarea-native"
            :value="modelValueComputed"
            :placeholder="placeholderValue"
            :disabled="disabled"
            :showCount="false"
            :maxlength="maxlength"
            :autoHeight="autoHeight"
            :placeholder-style="placeholderStylesString"
            :adjustPosition="adjustPosition"
            :disable-default-padding="true"
            :focus="focusState"
            :cursor-spacing="attrs['cursor-spacing']"
            :hold-keyboard="attrs['hold-keyboard']"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleInput"
            @confirm="handleConfirm"
            @keyboardHeightChange="handleKeyboardHeightChange"
          >
          </custom-textarea>
        </view>
      </template>
      <template v-else>
        <view class="ky-custom-textarea">
          <textarea
            ref="textareaRef"
            :id="PLACEHOLDER_STYLE_ID_PREFIX"
            :value="modelValueComputed"
            :placeholder="placeholderValue"
            :disabled="disabled"
            :showCount="false"
            :maxlength="maxlength"
            :autoHeight="autoHeight"
            :placeholder-style="placeholderStylesString"
            :disable-default-padding="true"
            :focus="focusState"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleInput"
            @confirm="handleConfirm"
            @keyboardHeightChange="handleKeyboardHeightChange"
          ></textarea>
        </view>
      </template>
      <view>
        <view class="bottom">
          <slot name="bottom">
            <view class="clear" @click.stop="clear">
              <text v-show="showClear">清空</text>
            </view>
            <view class="limit">
              <view v-show="showWordLimit && maxlength">
                <text class="textLimit" v-show="wordLimit.textLimit">{{ wordLimit.textLimit }}</text>
                <text v-show="!wordLimit.textLimit">{{ wordLimit.curlength }}</text
                >/<text>{{ wordLimit.maxlength }}</text>
              </view>
            </view>
          </slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts" name="ky-textarea">
import Taro from '@tarojs/taro'
import { computed, ref, useAttrs, watch, onBeforeUnmount, onMounted, nextTick } from 'vue'

import './index.scss'

import { TextareaProps } from '@packages/__components/textarea/src/types'
import { getSystemInfo } from '@packages/utils/src/getSystemInfo'
import { debounce } from '@packages/utils/src/common'
import { isWxAppOhosEnv } from '@packages/utils'

import { getuuid } from './utils'

interface EventDetail {
  detail: {
    value: string
  }
}

interface TextareaAttrs {
  shouldFocus?: boolean
  'cursor-spacing'?: number
  'hold-keyboard'?: boolean
}

const props = withDefaults(defineProps<TextareaProps>(), {
  disabled: false,
  modelValue: '',
  clearable: true,
  isError: false,
  showWordLimit: true,
  isTextLimit: true,
  adjustPosition: true,
  customPlaceholder: false,
  enableWxNative: false,
  inputDebounce: 0,
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
])

const prefix = 'ky-textarea'

const attrs = useAttrs() as TextareaAttrs

/**
 * 透传给原生 textarea 的 attrs，排除 class，
 * 避免外部 class 干扰原生节点样式
 */
const nativeAttrs = computed(() => {
  const { class: _cls, ...rest } = attrs as any
  return rest
})

const focusState = ref(false)

const systemInfo = getSystemInfo()

const isEnvWeApp = Taro.getEnv() === 'WEAPP'

const isWebApp = Taro.getEnv() === 'WEB'

const isAliApp = Taro.getEnv() === 'ALIPAY'

const isWxAppAndroid = ['android', 'devtools'].includes(systemInfo?.platform)

const textareaRef = ref()

/**
 * class
 */
const classes = computed(() => [
  {
    [`${prefix}`]: true,
    [`${prefix}--disabled`]: props.disabled,
    [`${prefix}--error`]: props.isError,
  },
  (attrs as any).class,
])

/**
 * 清空按钮
 */
const showClear = computed(() => {
  return Boolean(props.modelValue) && props.clearable
})

/**
 * 字数限制
 */
const wordLimit = computed(() => {
  const maxlength = Number(props.maxlength || 0)

  const curlength = props.modelValue?.length ?? 0

  return {
    maxlength,
    curlength,
    textLimit: props.isTextLimit && maxlength > 0 && curlength >= maxlength ? '字数已达到上限' : '',
  }
})

/**
 * placeholder
 */
const placeholderValue = computed(() => {
  if (isWxAppAndroid && props.customPlaceholder) {
    return ''
  }

  return props.placeholder
})

/**
 * 自定义 placeholder 是否显示
 */
const showCustomPlaceholder = computed(() => {
  return props.customPlaceholder && isWxAppAndroid && !props.modelValue
})

/**
 * placeholder style
 */
const placeholderStylesString = computed(() => {
  return [props.isError ? 'color:#FF706D;' : 'color:#ADB0B8;', props.placeholderStyle].filter(Boolean).join('')
})

/**
 * value
 */
const modelValueComputed = computed(() => {
  return props.modelValue
})

/**
 * 鸿蒙不启用受控 focus
 */
const shouldFocusComputed = computed(() => {
  if (isWxAppOhosEnv) {
    return false
  }

  return true
})

const nativeId = `ky-textarea-native-${getuuid()}`

const getFormattedValue = (str: string) => {
  let value = str
  if (props.formatter && typeof props.formatter === 'function') {
    value = props.formatter(str)
  }
  return value
}

const updateNativeTextareaValue = (val: string) => {
  if (!isEnvWeApp) return
  const { page } = Taro.getCurrentInstance() as any
  const nativeTextarea = page?.selectComponent(`.${nativeId}`)
  nativeTextarea?.updateCurrentValue(val)
}

const handleInput = debounce((event: EventDetail) => {
  const value = event.detail?.value ?? ''

  let nextValue = getFormattedValue(value)

  const max = Number(props.maxlength || 0)

  if (max > 0 && nextValue.length > max) {
    nextValue = nextValue.slice(0, max)
  }

  if (props.formatter && nextValue !== value) {
    updateNativeTextareaValue(nextValue)
  }

  emit('input', nextValue)

  emit('update:modelValue', nextValue)
}, props.inputDebounce)

/**
 * focus
 */
const handleFocus = (e: any) => {
  focusState.value = true
  emit('focus', e)
}

/**
 * blur
 */
const handleBlur = () => {
  focusState.value = false
  emit('blur')
}

/**
 * clear
 */
const clear = () => {
  emit('clear')
  emit('input', '')
  emit('update:modelValue', '')
}
/**
 * confirm
 */
const handleConfirm = () => {
  emit('confirm', props.modelValue)
}

/**
 * keyboard height change
 */
const handleKeyboardHeightChange = (event: EventDetail) => {
  emit('keyboardHeightChange', event)
}

/**
 * 主动 blur
 */
const blur = () => {
  focusState.value = false
  webBlur()
}

/**
 * placeholder style
 */
const PLACEHOLDER_STYLE_ID_PREFIX = `ky-textarea-placeholder-${getuuid()}`

let styleEl: HTMLStyleElement | null = null

const setPlaceholderStyle = () => {
  if (typeof document === 'undefined' || !placeholderStylesString.value) {
    return
  }

  if (!styleEl) {
    styleEl = document.createElement('style')
    document.head.appendChild(styleEl)
  }

  styleEl.innerHTML = `
    #${PLACEHOLDER_STYLE_ID_PREFIX} textarea::placeholder {
      ${placeholderStylesString.value}
    }
  `
}

watch(
  placeholderStylesString,
  () => {
    setPlaceholderStyle()
  },
  {
    immediate: true,
  },
)

const webFocus = async () => {
  if (isWebApp) {
    await nextTick()
    textareaRef.value?.$el?.children[0]?.focus()
  }
}

const webBlur = () => {
  if (isWebApp) {
    textareaRef.value?.$el?.children[0]?.blur()
  }
}

const setFocus = async (focus: boolean) => {
  if (props.disabled || !focus) {
    return
  }
  focusState.value = true
  webFocus()
}

watch(
  () => props.focus,
  async () => {
    setFocus(props.focus)
  },
)

let timer: any = null

onMounted(() => {
  const deleay = isAliApp ? 1000 : 0
  timer = setTimeout(() => {
    setFocus(props.focus)
  }, deleay)
})

/**
 * remove style
 */
onBeforeUnmount(() => {
  if (styleEl) {
    styleEl.remove()
    styleEl = null
  }
  clearTimeout(timer)
})

/**
 * expose
 */
defineExpose({
  focus: () => setFocus(true),
  blur,
  clear,
})
</script>
