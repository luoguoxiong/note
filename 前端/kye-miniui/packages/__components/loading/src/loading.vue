<template>
  <view :class="classes" v-if="$slots.default">
    <slot name="icon"><image class="ky-loading-img" :src="loadingImg"></image></slot>
    <ky-text v-if="$slots.default" :size="textSize" class="ky-loading-text" :style="textStyle">
      <slot></slot>
    </ky-text>
  </view>
  <view :class="classes" v-else>
    <slot name="icon"><image class="ky-loading-img" :src="loadingImg"></image></slot>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed, ref } from 'vue'
import KyText from '@packages/__components/text/src/text.vue'
import { KyLoadingProps } from '@packages/__components/loading/src/types'
import { loadingIconList } from '@packages/__components/loading/src/constant'

const props = withDefaults(defineProps<KyLoadingProps>(), {
  size: 'normal',
  textSize: '3',
  vertical: false,
  textColor: '#8C8F99',
  type: 'default',
})

/* 加载图标 */
const loadingImg = ref(loadingIconList[props.type])

const classes = computed(() => {
  const prefixCls = 'ky-loading'
  return {
    [prefixCls]: true,
    [`${prefixCls}--${props.vertical}`]: props.vertical,
    [`${prefixCls}--${props.size}`]: props.size,
    [`${prefixCls}--${props.textSize}`]: props.textSize,
    [`${prefixCls}--vertical`]: !!props.vertical,
  }
})

/* 文案样式 */
const textStyle = computed(() => {
  return {
    color: props.textColor,
  }
})
</script>
