<template>
  <button
    :class="classes"
    hover-class="ky-button-hover"
    :style="styleValue"
    :disabled="disabled"
    :plain="plain"
    :form-type="formType"
    @click="handleClick"
    v-bind="$attrs"
  >
    <view class="ky-button__wrap">
      <img v-if="loading" class="ky-button-loading" :src="loadingImg" :style="loadingStyle" />
      <slot v-if="$slots.icon && !loading" name="icon"></slot>
      <view v-if="$slots.default || text" class="ky-button__text">
        <text v-if="loading && loadingText">{{ loadingText }}</text>
        <slot v-else>{{ text }}</slot>
      </view>
    </view>
  </button>
</template>

<script lang="ts" setup name="ky-button">
import './index.scss'

import { ButtonProps } from './types'
import { computed, type CSSProperties } from 'vue'
import { pxCheck } from '@packages/utils/src/common'

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'default',
  formType: 'button',
  size: 'normal',
  shape: 'round',
  plain: false,
  block: false,
  loading: false,
  text: '',
})

const emit = defineEmits(['click'])

const prefixCls = 'ky-button'

const classes = computed(() => {
  return {
    [prefixCls]: true,
    [`${prefixCls}--${props.type}`]: props.type,
    [`${prefixCls}--${props.size}`]: props.size,
    // [`${prefixCls}--${props.shape}`]: props.shape,
    [`${prefixCls}--plain`]: props.plain,
    [`${prefixCls}--block`]: props.block,
    [`${prefixCls}--disabled`]: props.disabled,
    [`${prefixCls}--loading`]: props.loading,
  }
})
/* 按钮style配置样式 */
const styleValue = computed(() => {
  let style: CSSProperties = {}
  if (props.color) {
    style = {
      color: props.plain ? props.color : '#fff',
      background: props.plain ? '#fff' : `border-box ${props.color}`,
    }
    if (props.color.includes('gradient')) {
      style.borderColor = 'transparent'
    } else {
      style.borderColor = props.color
    }
  }
  return style
})
/* loading默认图 */
const loadingImg = computed(() => {
  return props.plain
    ? 'https://ic-img.ky-express.com/netc/20241220_43421882353_!!1734690952900_64_64.png'
    : 'https://ic-img.ky-express.com/netc/20241224_37221882313_!!1735011647194_64_64.png'
})

const loadingStyle = computed(() => {
  const size = pxCheck(props.loadingSize)
  if (!size) return {}
  return {
    width: size,
    height: size,
  }
})

const handleClick = (event: MouseEvent) => {
  console.log('handleClick', event)
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<style lang="scss"></style>
