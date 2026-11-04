<template>
  <view class="bind-tag" :class="[`bind-tag--${type}`]">
    <text class="bind-tag-text">{{ tagText }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 客户编码模块 - 当前绑定标签组件
 *
 * 用于显示"当前绑定"/"当前绑定"标记
 * 支持不同样式类型
 */
import { computed } from 'vue'
import './bindtag.scss'

interface Props {
  /** 标签类型：default=默认, primary=主色, warning=警告 */
  type?: 'default' | 'primary' | 'warning'
  /** 自定义文本（不传则使用默认值） */
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  text: '',
})

/** 标签文案 */
const tagText = computed(() => {
  if (props.text) return props.text
  return '当前绑定'
})
</script>
