/**
 * useScrollList
 * 来源: netc-pc-web/src/views/message-center-entry/components/scroll-list/useScrollList.js
 * @vue/composition-api -> vue
 */
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { throttle } from 'lodash-es'

/**
 * @param scrollRef 滚动容器 ref
 * @param bottomSpace 滚动底部间隔
 */
export default function useScrollList({ scrollRef, bottomSpace = 30 }: { scrollRef: Ref<any>; bottomSpace?: number }) {
  const isScrollBottom = ref(false) // 是否滚动到底部

  onMounted(() => {
    addScrollEvent()
  })
  onUnmounted(() => {
    removeScrollEvent()
  })
  const addScrollEvent = () => {
    const scrollTarget = scrollRef?.value
    if (scrollTarget) {
      scrollTarget.addEventListener('scroll', scrollHandler)
    }
  }
  const removeScrollEvent = () => {
    const scrollTarget = scrollRef?.value
    if (scrollTarget) {
      scrollTarget.removeEventListener('scroll', scrollHandler)
    }
  }
  /**
   * 检查是否触底
   */
  const checkIsBottom = () => {
    const scrollTarget = scrollRef?.value
    if (!scrollTarget || scrollTarget.scrollTop === 0) {
      return
    }
    isScrollBottom.value = scrollTarget.clientHeight + scrollTarget.scrollTop + bottomSpace >= scrollTarget.scrollHeight
  }
  /* 重置底部状态 */
  const resetIsBottom = () => {
    isScrollBottom.value = false
  }
  const scrollHandler = throttle(() => {
    checkIsBottom()
  }, 500)
  return { scrollHandler, isScrollBottom, resetIsBottom, removeScrollEvent, addScrollEvent }
}
