<template>
  <div class="scroll-list" ref="scrollRef">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * scroll-list 滚动加载列表容器
 * 来源: netc-pc-web/src/views/message-center-entry/components/scroll-list/index.vue
 * Vue3 适配: $el -> defineExpose 暴露 scrollRef(根滚动容器) 供父组件操作
 */
import { ref, watch } from 'vue'
import useScrollList from './useScrollList'

defineOptions({ name: 'scroll-list' })

defineProps<{
  onLoad?: () => void
  loading?: boolean
}>()

const emit = defineEmits(['onLoad'])

const scrollRef = ref<HTMLElement | null>(null)

const { isScrollBottom, resetIsBottom, addScrollEvent, removeScrollEvent } = useScrollList({ scrollRef })
/* 监听是否触底 */
watch(
  () => isScrollBottom.value,
  (val) => {
    console.log(val)
    if (val) {
      // 加载事件
      emit('onLoad')
    }
  }
)
// 重置滚动事件 <置顶,重新初始化滚动事件>
const resetScrollEvent = () => {
  removeScrollEvent()
  if (scrollRef.value) {
    scrollRef.value.scrollTop = 0
  }
  setTimeout(() => {
    addScrollEvent()
  }, 100)
}

defineExpose({ scrollRef, resetIsBottom, resetScrollEvent })
</script>

<style lang="scss" scoped>
.scroll-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dde1e7;
    border-radius: 3px;
    border: 1px solid transparent;
    background-clip: padding-box;
  }
}
</style>
