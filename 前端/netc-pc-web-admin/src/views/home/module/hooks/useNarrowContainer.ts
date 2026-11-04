import ResizeObserver from 'resize-observer-polyfill'
import { Ref, onBeforeUnmount, ref, watch } from 'vue'

export const useNarrowContainer = (target: Ref<HTMLElement | undefined>) => {
  const isNarrow = ref(false)
  let observer: ResizeObserver | undefined
  let observedElement: HTMLElement | undefined

  watch(
    target,
    (element) => {
      if (observedElement) observer?.unobserve(observedElement)
      // 卡片内部网格有额外内边距，统一观察右栏内容区，宽度才等于整张卡片。
      observedElement = (element?.closest('.right-side') as HTMLElement | null) || element
      if (!observedElement) return
      if (!observer) {
        observer = new ResizeObserver((entries) => {
          const width = entries[0]?.contentRect.width
          if (width !== undefined) isNarrow.value = width < 364
        })
      }
      observer.observe(observedElement)
    },
    { flush: 'post' }
  )

  onBeforeUnmount(() => observer?.disconnect())

  return isNarrow
}
