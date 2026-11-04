<template>
  <div
    class="draggable-container"
    @mousedown="down"
    @mousemove="move"
    @mouseup="end"
    @touchstart="down"
    @touchmove.prevent="move"
    @touchend="end"
  >
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import { useDrag } from './hooks/useDrag'
import { DragTypes } from '@order-public-sub-public/components/ui/drag-container/hooks/types'

const props = defineProps<DragTypes>()

console.log('useDrag props:', props)

const { down, end, move } = useDrag('.draggable-container', props)
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
</style>
