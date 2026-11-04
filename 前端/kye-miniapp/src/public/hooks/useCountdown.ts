import { ref, computed, onBeforeUnmount } from 'vue'

export function useCountdown(initialSeconds = 60) {
  const seconds = ref(0)

  const timer = ref<ReturnType<typeof setInterval> | null>(null)

  const isCounting = computed(() => seconds.value > 0)

  const text = computed(() => (isCounting.value ? `${seconds.value}s 后重新获取` : '获取验证码'))

  const start = () => {
    if (isCounting.value) return // 防止重复点击
    seconds.value = initialSeconds

    timer.value = setInterval(() => {
      seconds.value--
      if (seconds.value <= 0) {
        stop()
      }
    }, 1000)
  }

  const stop = () => {
    if (timer.value !== null) {
      clearInterval(timer.value)
      timer.value = null
    }
    seconds.value = 0
  }

  onBeforeUnmount(() => {
    timer.value && clearInterval(timer.value)
    seconds.value = 0
  })

  return {
    text,
    isCounting,
    seconds,
    start,
    stop,
  }
}
