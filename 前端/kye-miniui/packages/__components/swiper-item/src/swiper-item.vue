<template>
  <div class="ky-swiper-item" v-bind="$attrs" :style="style">
    <slot> </slot>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, inject, getCurrentInstance, onUnmounted } from 'vue'
import { SWIPER_KEY } from '@ky-miniui-lib/swiper'

const parent = inject(SWIPER_KEY) as any
parent.relation(getCurrentInstance())

const state = reactive({
  offset: 0,
})

const style = computed(() => {
  const style: any = {}
  const direction = parent?.props.direction
  if (parent?.size.value) {
    style[direction === 'horizontal' ? 'width' : 'height'] = `${parent?.size.value}px`
  }

  if (state.offset) {
    style.transform = `translate${direction === 'horizontal' ? 'X' : 'Y'}(${state.offset}px)`
  }

  return style
})

const setOffset = (offset: number) => {
  state.offset = offset
}

onUnmounted(() => {
  // parent.relation(getCurrentInstance(), 'unmount')
})

defineExpose({
  setOffset,
})
</script>

<style lang="scss">
.ky-swiper-item {
  flex-shrink: 0;
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
