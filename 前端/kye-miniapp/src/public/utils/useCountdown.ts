import { ref, computed, watch, Ref, onUnmounted } from 'vue'
interface Options {
  isAuto: boolean
}

const formatTime = (time) => time.toString().padStart(2, '0')

export function useCountdown(futureTimestamp: number | Ref<number>, options?: Options) {
  const currentTime = ref(Date.now())
  const isRunning = ref(false)
  let timer: any = null

  const _futureTimestamp = ref(futureTimestamp)

  // 监听发生改变后自动重启倒计时
  watch(
    () => _futureTimestamp.value,
    (newValue) => {
      if (newValue && options?.isAuto) {
        reset(newValue)
      }
    },
  )

  // 计算剩余时间（毫秒）
  const remainingTime = computed(() => {
    return Math.max(_futureTimestamp.value - currentTime.value, 0)
  })

  // 计算天、时、分、秒
  const days = computed(() => {
    const days = Math.floor(remainingTime.value / (1000 * 60 * 60 * 24))
    return formatTime(days)
  })
  const hours = computed(() => {
    const hours = Math.floor((remainingTime.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return formatTime(hours)
  })
  const minutes = computed(() => {
    const minutes = Math.floor((remainingTime.value % (1000 * 60 * 60)) / (1000 * 60))
    return formatTime(minutes)
  })
  const seconds = computed(() => {
    const seconds = Math.floor((remainingTime.value % (1000 * 60)) / 1000)
    return formatTime(seconds)
  })

  // 是否已结束
  const isFinished = computed(() => remainingTime.value <= 0)

  // 格式化输出（可选：HH:MM:SS 格式）
  const formattedTime = computed(() => {
    if (days.value > 0) {
      return `${days.value}天 ${formatTime(hours.value)}:${formatTime(minutes.value)}:${formatTime(seconds.value)}`
    }
    return `${formatTime(hours.value)}:${formatTime(minutes.value)}:${formatTime(seconds.value)}`
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
      _futureTimestamp.value = newTimestamp
    }
    currentTime.value = Date.now()
    if (remainingTime.value > 0) {
      isRunning.value = false
    }
    start()
  }

  // 如果未来时间戳有效且未结束，自动开始
  if (_futureTimestamp.value > Date.now()) {
    start()
  }

  onUnmounted(() => {
    stop()
  })

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
