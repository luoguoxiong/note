import { ref, computed, onUnmounted } from 'vue'
export function useCountdown(futureTimestamp: number) {
  const currentTime = ref(Date.now())
  const isRunning = ref(false)
  let timer: any = null

  // 计算剩余时间（毫秒）
  const remainingTime = computed(() => {
    return Math.max(futureTimestamp - currentTime.value, 0)
  })

  // 计算天、时、分、秒
  const days = computed(() => Math.floor(remainingTime.value / (1000 * 60 * 60 * 24)))
  const hours = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
  const minutes = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60)) / (1000 * 60)))
  const seconds = computed(() => Math.floor((remainingTime.value % (1000 * 60)) / 1000))

  // 是否已结束
  const isFinished = computed(() => remainingTime.value <= 0)

  // 格式化输出（可选：HH:MM:SS 格式）
  const formattedTime = computed(() => {
    if (days.value > 0) {
      return `${days.value}天 ${hours.value.toString().padStart(2, '0')}:${minutes.value.toString().padStart(2, '0')}:${seconds.value.toString().padStart(2, '0')}`
    }
    return `${hours.value.toString().padStart(2, '0')}:${minutes.value.toString().padStart(2, '0')}:${seconds.value.toString().padStart(2, '0')}`
  })

  // 更新当前时间
  const updateTime = () => {
    currentTime.value = Date.now()
    if (isFinished.value) {
      stop()
    }
  }

  // 启动倒计时
  const start = () => {
    if (isRunning.value || isFinished.value) return

    isRunning.value = true
    updateTime() // 立即更新一次

    timer = setInterval(() => {
      updateTime()
    }, 1000)
  }

  // 停止倒计时
  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isRunning.value = false
  }

  // 重置倒计时
  const reset = (newTimestamp?: number) => {
    stop()
    if (newTimestamp) {
      futureTimestamp = newTimestamp
    }
    currentTime.value = Date.now()
    if (remainingTime.value > 0) {
      isRunning.value = false
    }
  }

  // 自动清理
  onUnmounted(() => {
    stop()
  })

  // 如果未来时间戳有效且未结束，自动开始
  if (futureTimestamp > Date.now()) {
    start()
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isFinished,
    formattedTime,
    start,
    stop,
    reset,
  }
}
