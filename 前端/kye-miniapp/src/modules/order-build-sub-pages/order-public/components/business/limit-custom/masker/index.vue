<template>
  <div class="masker" :style="{ height: height + 'px', top: top + 'px' }" @click="clickFun"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getClientRect } from '@order-public-sub-public/validate/utils'

export interface maskerProps {
  top: number
  querySelector?: string
  immediate?: boolean
  getContainer?: boolean
}
const props = withDefaults(defineProps<maskerProps>(), {
  top: 0,
  getContainer: true,
})
const emit = defineEmits(['click'])
const height = ref(60)

onMounted(() => {
  if (props.getContainer) {
    initHeight()
  }
  if (props.immediate) {
    clickFun()
  }
})
const initHeight = () => {
  const dom = getClientRect('orderContent')
  height.value = dom.bottom - props.top
  console.log('容器的高度', dom)
}
// const height = computed(() => {
//   return 1500
//   // const orderContent = document.querySelector(props.querySelector || '.order-content')
//   //
//   // if (orderContent) {
//   //   const scrollHeight = orderContent.scrollHeight
//   //   return scrollHeight - props.top
//   // } else {
//   //   return 0
//   // }
// })

const clickFun = () => {
  emit('click')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import 'index';
</style>
