import { ref, onUnmounted } from 'vue'

// 组件延时渲染
// 入参：第n帧
export function useDefer(maxCount = 100) {
  const frameCount = ref(0)
  let rafId

  function updateFrameCount() {
    rafId = requestAnimationFrame(() => {
      frameCount.value++
      if (frameCount.value > maxCount) return
      updateFrameCount()
    })
  }

  updateFrameCount()

  onUnmounted(() => {
    cancelAnimationFrame(rafId)
  })

  return function (n) {
    return frameCount.value > n
  }
}
