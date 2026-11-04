<template>
  <view class="ky-cell-group">
    <slot v-if="$slots.title" name="title"></slot>
    <view v-else-if="title" class="ky-cell-group__title">{{ title }}</view>
    <slot v-if="$slots.desc" name="desc"></slot>
    <view v-else-if="desc" class="ky-cell-group__desc">{{ desc }}</view>
    <view :class="wrapClasses">
      <slot></slot>
    </view>
  </view>
</template>

<script lang="ts" setup name="ky-cell-group">
import './index.scss'
import { cellGroupProps } from './types'
import { computed } from 'vue'

const { title = '', desc = '', inset = false } = defineProps(cellGroupProps)
console.log('inset>>', inset)
const prefixCls = 'ky-cell-group'
const wrapClasses = computed(() => {
  return {
    [`${prefixCls}__wrap`]: true,
    [`${prefixCls}__wrap--inset`]: inset,
  }
})
</script>
