<template>
  <text
    class="ky-text"
    :class="classes"
    :selectable="selectable"
    :overflow="overflow"
    :max-lines="maxLines"
    :numberOfLines="maxLines"
    :style="textStyle"
    v-bind="$attrs"
  >
    <slot></slot>
  </text>
</template>

<script lang="ts" setup name="ky-text">
import './scss/index.scss'
import { TextProps } from './types'
import { computed, reactive, onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'

const props = withDefaults(defineProps<TextProps>(), {
  size: '3',
  type: 'main',
  maxLines: 1,
})

const prefixCls = 'ky-text'

const state = reactive({
  ENV: Taro.getEnv(),
  ENV_TYPE: Taro.ENV_TYPE,
})

const textStyle = ref({})

const classes = computed(() => {
  return {
    [`${prefixCls}--${props.type}`]: props.type,
    [`${prefixCls}-size--${props.size}`]: props.size,
    [`${prefixCls}--overflow`]: !!props.overflow,
    [`${prefixCls}--${state.ENV}`]: state.ENV,
  }
})
/* 是否可选 */
const selectable = computed(() => {
  return props.selectable || props.userSelect
})

/* 动态样式写入 */
const setTextStyle = () => {
  const result = {}
  if (state.ENV === state.ENV_TYPE.WEB) {
    result['-webkit-line-clamp'] = props.maxLines
    result['line-clamp'] = props.maxLines
  }
  textStyle.value = result
}

onMounted(() => {
  setTextStyle()
})
</script>
