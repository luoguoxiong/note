import { computed, ref } from 'vue'
import { KyInputProps } from '@packages/__components/input/src/types'
import Taro from '@tarojs/taro'
import { debounce } from '@ky-miniui-lib/utils'
export interface InputEventDetail {
  detail: {
    value: string
  }
  target: {
    value: string
  }
  currentTarget: {
    value: string
  }
}

export const genUid = (() => {
  let counter = 0

  return (prefix = 'input'): string => {
    counter += 1

    return `${prefix}-${Date.now()}-${counter}`
  }
})()

export const useCommon = (
  props: KyInputProps,
  emit: (
    event:
      | 'focus'
      | 'change'
      | 'update:modelValue'
      | 'blur'
      | 'clear'
      | 'input'
      | 'confirm'
      | 'keyboardHeightChange'
      | 'click',
    ...args: any[]
  ) => void,
) => {
  const nativeId = genUid()

  const env = Taro.getEnv()

  const isEnvWeApp = env === 'WEAPP'

  const isAliApp = env === 'ALIPAY'

  const focusState = ref(false)

  const updateFocusState = (value: boolean) => {
    focusState.value = value
  }

  const currentValue = computed({
    get: () => props.modelValue ?? '',
    set: (val: string) => {
      emit('update:modelValue', val)
    },
  })

  const wrapperClass = computed(() => [
    'ky-input--wrapper',
    {
      'ky-input--disabled': props.disabled,
      'ky-input--error': props.isError,
      'ky-input--focus': focusState.value,
      'ky-input--focus-value': focusState.value && currentValue.value,
      'ky-input--value': currentValue.value,
      'ky-input--clear-reserve': props.clearable && props.clearDisplay,
    },
    className(props.border),
    `ky-input--${props.textAlign}`,
    env,
  ])

  const showClear = computed(() => {
    return props.clearable && !!currentValue.value && (props.clearTrigger === 'always' || focusState.value)
  })

  const showClearMask = computed(() => {
    return props.textAlign === 'right' && !props.disabled && showClear.value
  })

  const getFormattedValue = (str: string) => {
    let value = str
    if (props.formatter && typeof props.formatter === 'function') {
      value = props.formatter(str)
    }
    return value
  }

  const updateNativeInputValue = (val: string) => {
    const { page } = Taro.getCurrentInstance() as any
    const nativeInput = page?.selectComponent(`.${nativeId}`)
    nativeInput?.updateCurrentValue(val)
  }

  const handleInput = debounce((event: InputEventDetail) => {
    let formattedValue = getFormattedValue(event.detail?.value)
    const max = Number(props.maxlength || 0)
    if (max > 0 && formattedValue.length > max) {
      formattedValue = formattedValue.slice(0, max)
    }
    emit('input', formattedValue, event)
    currentValue.value = formattedValue
  }, props.inputDebounce)

  const handleNaitveInput = function (event: InputEventDetail) {
    let formattedValue = getFormattedValue(event.detail?.value)
    const max = Number(props.maxlength || 0)
    if (max > 0 && formattedValue.length > max) {
      formattedValue = formattedValue.slice(0, max)
    }
    updateNativeInputValue(formattedValue)
    emit('input', formattedValue, event)
    currentValue.value = formattedValue
  }

  const handleFocus = (e: InputEventDetail) => {
    focusState.value = true
    emit('focus', e)
  }

  const handleBlur = (e: InputEventDetail) => {
    focusState.value = false

    const inputDebounceTime = props.inputDebounce ? props.inputDebounce + 20 : 20

    setTimeout(() => {
      const value = currentValue.value

      const event = Object.create(e)

      Object.defineProperties(event, {
        detail: {
          value: {
            ...e.detail,
            value,
          },
        },
        target: {
          value: {
            ...(e.target || {}),
            value,
          },
        },
        currentTarget: {
          value: {
            ...(e.currentTarget || {}),
            value,
          },
        },
      })

      emit('blur', event)
    }, inputDebounceTime)
  }

  const handleConfirm = (event: InputEventDetail) => {
    const value = event.detail?.value
    emit('input', value, event)
    emit('update:modelValue', value)
    emit('confirm', value, event)
  }

  const handleClear = () => {
    emit('input', '')
    emit('update:modelValue', '')
    emit('clear')
    updateNativeInputValue('')
  }

  const handleKeyboardHeightChange = (event: Event) => {
    emit('keyboardHeightChange', event)
  }

  const handleClick = () => {
    emit('click')
  }

  const className = (name?: string) => {
    if (name === 'all') {
      name = ''
    }

    let baseClass = 'ky-input'

    if (props.border === 'bottom' && name !== 'bottom') {
      baseClass = 'ky-input--bottom'
    }

    return name ? `${baseClass}--${name}` : baseClass
  }

  return {
    nativeId,
    isEnvWeApp,
    isAliApp,
    handleClick,
    handleClear,
    handleFocus,
    handleBlur,
    handleConfirm,
    handleInput,
    handleNaitveInput,
    handleKeyboardHeightChange,
    className,
    updateFocusState,
    wrapperClass,
    currentValue,
    focusState,
    showClear,
    showClearMask,
  }
}
