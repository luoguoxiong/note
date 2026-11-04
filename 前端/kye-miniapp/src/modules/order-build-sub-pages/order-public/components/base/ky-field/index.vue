<template>
  <div
    class="ky-field-order"
    :id="dataValidate?.replaceAll('.', '_')"
    :class="{ 'is-focus': isFocus, 'ky-field-disabled': disabled, 'required-field': requiredTag && !disabled }"
    :data-position="position"
  >
    <SvgIcon v-if="requiredTag && !disabled" class="required" name="required" />
    <!-- 只读 -->
    <div
      v-if="readonly"
      @click="onClick"
      :class="['readonly', disabled && 'disabled', popoverConfig?.content && 'ky-field--error']"
    >
      <span v-show="modelValue || $attrs.value">{{ modelValue || $attrs.value }}</span>
      <span v-show="!(modelValue || $attrs.value)" class="placeholder">{{ placeholder }}</span>
    </div>
    <ky-field
      v-else
      v-bind="$attrs"
      :modelValue="modelValue || $attrs.value"
      :type="type"
      :formatter="formatter"
      :placeholder="placeholder"
      :data-validate="dataValidate"
      :disabled="disabled"
      autocomplete="off"
      @focus="onFocus"
      @blur="onBlur"
      @click="onClick"
      @clear="onClear"
      @confirm="onConfirm"
      :clearable="realClearable"
      border="bottom"
      :isError="popoverConfig?.content"
      @input="onInput"
      @update:model-value="onUpdateModelValue"
      ref="fieldRef"
    >
      <!-- 自行实现清除icon，解决PC小程序清空点击不兼容的问题 -->
      <template v-if="showRightIcon" #right>
        <!-- <van-icon name="clear" @mousedown="onRightClear" /> -->
      </template>
    </ky-field>
    <!-- 遮罩 -->
    <div v-if="disabled" class="ky-field-disabled-mask" :data-position="position"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
// 使用 import 会导致新的props属性传不进来
// import { PropsType } from '@order-public-sub-public/components/base/ky-field/types'
import { isDesktopMiniprogram } from '@order-public-sub-public/utils/native'
import { useValidate } from '@order-public-sub-public/hooks/useValidate'
const { validateObj, removeValidateKey } = useValidate()

interface PropsType {
  modelValue?: string | number
  formatter?: (value: string) => string
  placeholder?: string
  dataValidate?: string
  disabled?: boolean
  clearable?: boolean
  position?: 'left' | 'right'
  requiredTag?: boolean
  type?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<PropsType>(), {
  modelValue: '',
  formatter: (value: string): string => String(value),
  placeholder: '请填写',
  dataValidate: '',
})

const fieldRef = ref()

defineExpose({
  fieldRef,
})

let blurTimeout: number | null = null

const isFocus = ref(false)

const isDesktopMiniprogramFlag = isDesktopMiniprogram()

// const realClearable = computed(() => (isDesktopMiniprogramFlag ? false : props.clearable))

const realClearable = computed(() => props.clearable)

const showRightIcon = computed(() => isDesktopMiniprogramFlag && props.modelValue && isFocus.value)

const emit = defineEmits(['onInput', 'onFocus', 'onBlur', 'onClick', 'onClear', 'update:modelValue', 'onConfirm'])

const onInput = (value: string, event: Event) => {
  emit('onInput', value, event)
  closeBubble()
}

const onUpdateModelValue = (value: string) => {
  emit('update:modelValue', value)
}

const onFocus = () => {
  if (blurTimeout) {
    clearTimeout(blurTimeout)
    blurTimeout = null
  }
  isFocus.value = true
  emit('onFocus')
  closeBubble()
}

const popoverConfig = computed(() => {
  return validateObj[props.dataValidate] || {}
})

const closeBubble = () => {
  setTimeout(() => {
    removeValidateKey(props.dataValidate)
  }, 300)
}

const handleBlur = (value: string) => {
  isFocus.value = false
  emit('onBlur', value)
}

const onBlur = (event: any) => {
  const value = event.detail?.value || ''
  // 只有电脑小程序才需要延迟处理blur，正常不需要
  if (!isDesktopMiniprogramFlag) {
    handleBlur(value)
  } else {
    blurTimeout = setTimeout(() => {
      handleBlur(value)
    }, 100)
  }
}
const onClick = () => {
  emit('onClick')
}

const onClear = () => {
  emit('onClear')
  closeBubble()
}

const onConfirm = (value: string) => {
  emit('onConfirm', value)
}

const onRightClear = () => {
  emit('onInput', '')
  emit('onClear')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
<style lang="scss">
.ky-input--bottom,
.ky-input--bottom .h5-input {
  background: #fff !important;
}

.ky-input--disabled.ky-input--bottom,
.ky-input--disabled.ky-input--bottom .h5-input {
  background: #f2f3f7 !important;
}
</style>
