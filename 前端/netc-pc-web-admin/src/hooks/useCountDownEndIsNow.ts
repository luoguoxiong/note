import { ComputedRef, Ref, computed, onUnmounted, ref } from 'vue'

interface CountDownEndIsNowRet {
  /** 格式化展示倒计时 hh:mm:ss */
  formateTime: ComputedRef<string>
  /** 剩余毫秒 */
  seconds: Ref<number>
  /** 是否满足开始时间大于当前时间而且距离当前时间在一天内 */
  isCanShow: ComputedRef<boolean>
  /** 开始计时 */
  startCountDown: (startSeconds: number) => void
}

/**
 * 根据货好时间，倒计时显示自动拒接时间
 * @returns {CountDownEndIsNowRet}
 */
export const useCountDownEndIsNow = (): CountDownEndIsNowRet => {
  const seconds = ref(0)
  const timer = ref(0)
  const startDate = ref(0)
  const isOverOneDay = ref(true)
  const isMinThenToday = ref(true)

  // 更新定时器方法
  const updateTimer = () => {
    const nowTime = new Date().getTime()
    const realTime = startDate.value - nowTime
    seconds.value = realTime > 0 ? realTime : 0
    timer.value = requestAnimationFrame(updateTimer)
  }

  // 启动倒计时方法
  const startCountDown = (startSeconds: number) => {
    // 如果开始时间小于当前时间或者距离当前时间超过一天，则不启动倒计时
    if (startSeconds < new Date().getTime() || startSeconds - new Date().getTime() > 1000 * 60 * 60 * 24) {
      return
    }
    isMinThenToday.value = false
    isOverOneDay.value = false
    startDate.value = startSeconds
    // 如果定时器不存在，则启动定时器
    if (timer.value) {
      cancelAnimationFrame(timer.value)
    }
    updateTimer()
  }

  // 格式化时间方法
  const formateDate = (timeDifference: number): string => {
    const totalSeconds = Math.floor(timeDifference / 1000)
    const hours = `${Math.floor(totalSeconds / 3600)}`
    const minutes = `${Math.floor((totalSeconds % 3600) / 60)}`
    const seconds = `${totalSeconds % 60}`
    // 返回格式化后的时间字符串
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
  }

  const formateTime = computed(() => {
    return formateDate(seconds.value)
  })

  const isCanShow = computed(() => {
    return !isOverOneDay.value && !isMinThenToday.value
  })

  onUnmounted(() => {
    cancelAnimationFrame(timer.value)
  })

  return {
    formateTime,
    seconds,
    isCanShow,
    startCountDown,
  }
}
