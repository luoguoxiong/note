import { ref } from 'vue'

/**
 * @Desc: usePreviewPreload
 * @Date: 2025/7/25
 */
const loadedIndexSet = ref<Set<number>>(new Set<number>([0, 1]))

export const useImagePreviewPreload = () => {
  /* 预渲染相邻的item */
  const preloadIndexes = (index: number, images) => {
    loadedIndexSet.value.add(index)
    if (index > 0) loadedIndexSet.value.add(index - 1)
    if (index < images?.length - 1) loadedIndexSet.value.add(index + 1)
  }
  /* 是否展示item */
  const shouldRender = (index: number) => {
    return loadedIndexSet.value.has(index)
    // return Math.abs(index - activeIndex.value) <= 1
  }

  /* 移除已架子的item */
  const resetPreview = (activeIndex:number, images) => {
    loadedIndexSet.value.clear()
    preloadIndexes(activeIndex, images)
  }

  return {
    preloadIndexes,
    shouldRender,
    resetPreview
  }
}
