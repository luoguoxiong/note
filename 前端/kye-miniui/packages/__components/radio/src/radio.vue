<template>
  <view :class="radioClasses" @click="onClick">
    <slot v-if="type !== 'buttonSelect'" name="icon" :checked="checked">
      <image v-if="radioIcon" class="ky-radio-icon" :src="radioIcon" :style="imageIconStyle" />
    </slot>
    <view class="ky-radio-text"><slot></slot></view>
    <!-- 兼容h5情况下type === 'buttonSelect'切换radio表现异常，需要将此dom放置最后 -->
    <image v-if="type === 'buttonSelect' && showButtonSelect" class="ky-radio-select-icon" :src="radioIcon" />
  </view>
</template>
<script setup lang="ts" name="ky-radio">
import './index.scss'

import { computed, inject, reactive } from 'vue'
import Taro from '@tarojs/taro'
import { RadioProps, RadioType } from './types'
import useRadioType from '@packages/__components/radio/src/useRadioType'
import { RADIO_KEY } from '@packages/__components/radiogroup/src/types'

defineOptions({
  name: 'ky-radio',
})

const props = withDefaults(defineProps<RadioProps>(), {
  type: 'round',
  checked: false,
  disabled: false,
  direction: 'vertical',
  isError: false,
  labelPosition: 'right',
  checkedHighlight: false,
})

const emit = defineEmits(['click'])

const parent: any = inject(RADIO_KEY, null)

const state = reactive({
  ENV: Taro.getEnv(),
})

const prefixCls = 'ky-radio'

const radioClasses = computed(() => {
  return {
    [`${prefixCls}`]: true,
    [`${prefixCls}--active`]: checked.value,
    [`${prefixCls}--unchecked`]: !checked.value,
    [`${prefixCls}--disabled`]: disabled.value,
    [`${prefixCls}-type--${type.value}`]: type.value,
    [`${prefixCls}-direction--${direction.value}`]: direction.value,
    [`${prefixCls}--${size.value}`]: size.value,
    [`${prefixCls}--error`]: props.isError,
    [`${prefixCls}--reverse`]: reverseState.value,
    [`${prefixCls}--${state.ENV}`]: state.ENV,
    [`${prefixCls}--highlight`]: checked.value && checkedHighlight.value,
  }
})
/* 图标自定义样式 */
const imageIconStyle = computed(() => {
  if (!iconSize.value) {
    return null
  }
  return {
    width: `${iconSize.value}px`,
    height: `${iconSize.value}px`,
  }
})

/* 是否选中 */
const checked = computed(() => {
  return parent?.name.value === props.name
})
/* 是否禁用 */
const disabled = computed(() => {
  return props.disabled || parent?.disabled.value || false
})
/* 当前是否为error状态 */
const isError = computed(() => {
  return props.isError || parent?.isError.value
})

const checkedHighlight = computed(() => {
  return parent.checkedHighlight.value || props.checkedHighlight
})

/* 文字位置 */
const reverseState = computed(() => {
  return props.labelPosition === 'left'
})
/* 方向位置 */
const direction = computed(() => {
  return parent?.direction.value || props.direction || false
})

const size = computed(() => props.size || parent?.size.value)

/* 图标尺寸 */
const iconSize = computed(() => {
  return props.iconSize || parent?.iconSize.value
})
/* type类型, group存在 */
const type = computed(() => {
  return parent?.type.value || props.type
})
/* type:buttonSelect 选中是否展示 */
const showButtonSelect = computed(() => {
  return type.value === ('buttonSelect' as RadioType) && radioIcon && checked.value
})

const { radioIcon } = useRadioType(props, { checked, disabled, isError, type })

/* 点击事件-支付宝不支持 */
const onClick = () => {
  console.log('onClick')
  if (checked.value || disabled.value) return
  parent?.updateValue(props.name)
  emit('click')
}
</script>
