<template>
  <text :class="classes" :style="styles" v-if="show" @click="onClick">
    <slot></slot>
  </text>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { TagProps } from './types'
import './index.scss'

// 定义组件属性
const props = withDefaults(defineProps<TagProps>(), {
  show: true,
  plain: false,
  bgColor: '#8365F6',
  textColor: '#fff',
  borderColor: '#8365F6',
})

const emits = defineEmits(['click'])

// 响应式属性解构
const { size, borderColor, bgColor, textColor, plain, show } = toRefs(props)

// 动态生成类名
const classes = computed(() => ({
  'ky-tag': true,
  [`ky-tag-size--${size.value}`]: true,
}))

// 动态生成样式
const styles = computed(() => {
  // 朴素模式样式
  if (plain.value) {
    return {
      color: textColor?.value,
      backgroundColor: '#fff',
      borderColor: borderColor?.value || textColor?.value,
    }
  }

  // 默认样式
  return {
    color: textColor.value,
    backgroundColor: bgColor?.value,
    borderColor: borderColor?.value || bgColor?.value,
  }
})

const onClick = (event: Event) => {
  emits('click', event)
}
</script>
