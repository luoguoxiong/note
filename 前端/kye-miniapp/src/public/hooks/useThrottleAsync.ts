import { ref } from 'vue'

export function useThrottleAsync<T extends any[], R>(fn: (...args: T) => Promise<R>, interval = 10 * 60 * 1000) {
  const lastCall = ref(0)
  const lastResult = ref<R>()
  const pendingPromise = ref<Promise<R> | null>(null)

  const run = async (...args: T): Promise<R> => {
    const now = Date.now()

    // 若已在节流窗口内
    if (now - lastCall.value < interval) {
      console.log(`[throttle] ${interval / 1000}s 内已调用过，返回上次结果`)
      if (typeof lastResult.value === 'object') {
        lastResult.value.isLastValue = true
      }
      const result = pendingPromise.value
        ? await pendingPromise.value // 正在执行
        : lastResult.value! // 执行过
      return result
    }

    // 进入执行：立刻更新 lastCall，避免并发触发第二次
    lastCall.value = now

    // 生成唯一 pendingPromise
    const p = fn(...args).then((res) => {
      lastResult.value = res
      pendingPromise.value = null
      return res
    })

    pendingPromise.value = p
    return p
  }

  const forceRun = async (...args: T): Promise<R> => {
    const p = fn(...args).then((res) => {
      lastCall.value = Date.now()
      lastResult.value = res
      pendingPromise.value = null
      return res
    })
    pendingPromise.value = p
    return p
  }

  return {
    run,
    forceRun,
  }
}
