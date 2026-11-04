<template>
  <view class="ky-field" :class="[className(), $attrs.class, inputFocus && className('focus')]">
    <view :class="labelClassName()" :style="labelStyle" @click="labelTap">
      <slot name="label">
        {{ label }}
      </slot>
      <slot name="required" v-if="required">
        <view v-if="required" :class="className('require-icon', true)"></view>
      </slot>
    </view>
    <view :class="className('content')" @click="handleClick">
      <view
        v-if="readonly"
        class="ky-field--readonly"
        :class="{
          'ky-field--placeholder': !!modelValue,
        }"
        >{{ modelValue || placeholder }}</view
      >
      <Popover
        v-else
        :listenClickId="listenClickId"
        :location="popoverConfig.placement"
        :offset="popoverConfig.offset"
        :show="showPopover"
        theme="dark"
      >
        <template #reference>
          <slot
            name="input"
            v-if="$slots.input"
            :value="modelValue"
            :isError="Boolean(parent[prop]) || isError"
            :errorMessage="parent[prop]"
            :update="handleUpdate"
          />
          <template v-else>
            <ky-input
              ref="inputRef"
              v-bind="inputPropsPlatform"
              :value="model"
              :readonly="readonly"
              :type="type"
              :size="size"
              :border="border"
              :disabled="disabled"
              :maxlength="maxlength"
              :placeholder="placeholder"
              :formatter="formatter"
              :isError="Boolean(parent[prop]) || isError"
              :enableNative="enableNative"
              :textAlign="textAlign"
              :customPlaceholder="customPlaceholder"
              :inputDebounce="inputDebounce"
              :clearDisplaySpace="clearDisplaySpace"
              :cursorSpacing="cursorSpacing"
              :clearable="clearable"
              @blur="handleBlur"
              @focus="handleFocus"
              @confirm="handleConfirm"
              @keyboardHeightChange="handleKeyboardHeightChange"
              @input="handleInput"
              @clear="handleClear"
            >
              <template #right>
                <slot v-if="$slots.right" name="right"></slot>
              </template>
            </ky-input>
          </template>
        </template>
        <template #content v-if="parent[prop] || popoverConfig.content">
          <view>{{ parent[prop] || popoverConfig.content }}</view>
        </template>
      </Popover>
    </view>
  </view>
  <view class="ky-field--error-text">
    <view class="ky-field--left--error-padding" v-if="labelPosition === 'left'" :style="labelLeftErrorStyle"></view>
    <view v-if="parent[prop] && hiddenPopover">{{ parent[prop] }}</view>
  </view>
</template>

<script setup lang="ts" name="ky-field">
import './index.scss'
import { ref, inject, watch, computed, useAttrs } from 'vue'
import { FieldProps } from './types'
import { useParent } from '../../../utils/hooks/useParent'
import { FORM_FIRST_TIP, FORM_KEY, FORM_TIP_KEY } from './../../form/commons'
import { Popover } from '@ky-miniui-lib/ky-miniui-lib'

const props = withDefaults(defineProps<FieldProps>(), {
  disabled: false,
  modelValue: '',
  isError: false,
  labelAlign: 'left',
  labelPosition: 'top',
  border: 'all',
  hiddenPopover: false,
  listenClickId: 'order-page',
  type: 'text',
  textAlign: 'left',
  readonly: false,
  enableNative: true,
  customPlaceholder: false,
  clearDisplaySpace: false,
  cursorSpacing: 0,
  popoverConfig: {
    placement: 'top-start',
    offset: [0, 4],
  },
  adjustPosition: true,
  clearable: true,
})

const model = computed({
  get: () => props.modelValue,
  set: (val: string) => {
    emit('update:modelValue', val)
  },
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
const inputRef = ref(null)
const inputFocus = ref(false)
const parent = inject(FORM_TIP_KEY) || ({} as any)
const firstErrorTip = inject(FORM_FIRST_TIP) || ({} as any)

const attrs = useAttrs()

/* 动态props传参-适配不同端 */
const inputPropsPlatform = computed(() => {
  const result: Record<string, any> = {
    ...props,
    ...(attrs || {}), // 未声明
  }
  return result
})

const { parent: parentObj } = useParent(FORM_KEY)
/* 是否展示popover错误气泡 */
const showPopover = computed(() => {
  if (props.readonly) return
  const { prop, hiddenPopover, popoverConfig } = props

  return (
    firstErrorTip.value?.prop === prop &&
    ((parent.value && Boolean(parent.value[prop]) && !hiddenPopover) || Boolean(popoverConfig.content))
  )
})

const className = (className?: string, ignoreLabel?: boolean) => {
  const baseClass = ignoreLabel ? 'ky-field' : `ky-field--${props.labelPosition}`
  return className ? `${baseClass}--${className}` : baseClass
}

const labelClassName = () => {
  const className = { [`ky-field--${props.labelPosition}--label`]: true }
  if (props.labelPosition === 'left') {
    Object.assign(className, {
      [`ky-field--left--label--${props.labelAlign}`]: true,
    })
    return className
  }
  return className
}

const labelTap = () => {
  inputRef.value?.focus()
}

const handleClick = (e) => {
  emit('click', e)
}

const handleFocus = (e) => {
  emit('focus', e)
  parentObj?.instance?.exposed.reset(props.prop)
  inputFocus.value = true
}

const handleBlur = (e) => {
  emit('blur', e)
  inputFocus.value = false
}

const handleInput = (value: string, event: Event) => {
  emit('input', value, event)
  emit('update:modelValue', value)
}

const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}

const handleClear = () => {
  clear()
}

const clear = () => {
  emit('change', '')
  emit('update:modelValue', '')
  emit('clear')
  inputFocus.value = false
}

const handleConfirm = (vale: string) => {
  emit('confirm', vale)
}
const handleKeyboardHeightChange = (event: Event) => {
  emit('keyboardHeightChange', event)
}

const labelStyle = computed(() => {
  const style: Record<string, any> = {}

  if (props.labelPosition === 'left') {
    const width = typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth

    if (width) {
      style.width = width
      style.flexShrink = 0
    }
  }

  return style
})

const labelLeftErrorStyle = computed(() => {
  const style: Record<string, any> = {}

  if (props.labelPosition === 'left') {
    const width = typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth

    if (width) {
      style.width = width
    }
  }

  return style
})

defineExpose({
  inputRef,
})
</script>

<style lang="scss"></style>
