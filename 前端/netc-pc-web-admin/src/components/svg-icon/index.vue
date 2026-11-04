<template>
  <img lazyload :class="['svg-icon', name]" :src="`./svg/${name}.svg`" :style="style" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ name: string; width?: string; top?: string }>()

const style = computed(() => {
  let str = ''
  if (props.width) {
    str += `width:${props.width};`
  }
  if (props.top) {
    str += `top: ${props.top};`
  }
  return str
})
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
