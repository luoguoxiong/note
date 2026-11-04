<template>
  <view ref="swipeGroupRef" class="ky-swipe-group">
    <slot></slot>
  </view>
</template>
<script setup lang="ts">
import { provide, ref } from 'vue'
import { SWIPE_KEY, swipeGroupProps } from './types'
import useOutClick from '@packages/utils/hooks/useOutClick'

const props = defineProps(swipeGroupProps)

const swipeGroupRef = ref(null)
// 当前激活的swipe-name
const name = ref('')
// 更新swipe-name
const update = (n: string) => {
  name.value = n
}
// 点击外部逻辑
useOutClick({
  name,
  onOutsideClick: () => {
    update('')
  },
})

provide(SWIPE_KEY, {
  update,
  lock: props.lock,
  moveEndClose: props.moveEndClose,
  name,
})
</script>
