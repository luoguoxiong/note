/* eslint-disable max-lines-per-function */
/*
 * @Description: 轮询组件
 * @Date: 2023-11-13 09:58:11
 */
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { ref } from 'vue'
interface Params<T, K> {
  polling: (args: K) => Promise<T>
  delay?: number
  count?: number
  // 注意 如果使用 自定义timerName 清除轮询时也需要传入timerName
  timerName?: string // 为避免同一api出现多次轮询，使用时尽量传入timerName
  finishStatus?: (arg0: T) => boolean
  resolveStatus?: (args: T) => boolean
  failedCallback?: (arg0: T) => void
  args: K
  overtimeMsg?: boolean //超过次数要不要提示
}

interface hashTimer {
  [key: string]: number | null
}
interface hashResolved {
  [key: string]: boolean
}
// 使用动态名称
const timerHash = {} as hashTimer

// 是否已经resolve
const resolvedHash = {} as hashResolved

/**
 * @description 停止轮询
 */
export const commonStopPolling = (timerName = '') => {
  const timer = timerHash[timerName]
  if (timer) {
    clearTimeout(timer)
  } else {
    for (const key in timerHash) {
      clearTimeout(timerHash[key] as number)
    }
  }
}
// 单条清除轮询
const stopPolling = (timerName = '') => {
  const timer = timerHash[timerName]
  if (timer) {
    clearTimeout(timer)
  }
}
/**
 * @description 轮询公共Hook TODO 逻辑优化，if else判断
 * @param params
 */
export const commonSetPolling = <T, K>(params: Params<T, K>) => {
  const {
    polling,
    delay = 1000, // 默认执行间隔，毫秒
    count = 60, // 默认执行次数，超过60次调用 则停止轮询
    timerName = 'timer', // 轮询名称
    finishStatus, // 自定义结束标识回调
    resolveStatus, // 自定义promise resolve标识
    failedCallback,
    args,
    overtimeMsg = true,
  } = params

  return new Promise<T>((resolve, reject) => {
    const retryCount = ref(0)

    /**
     * @description 开始轮询
     */
    const startPolling = () => {
      if (timerHash[timerName] !== null) {
        reset()
      }
      fetchData()
    }

    /**
     * @description 取消轮询
     */
    const cancel = (reason = '轮询失败') => {
      reset()
      reject(reason)
    }

    /**
     * @description 判断重试次数，继续轮询
     */
    const process = () => {
      retryCount.value = +retryCount.value + 1
      if (retryCount.value >= count) {
        if (overtimeMsg) {
          showToast('接口超时，请稍后重试')
        }
        cancel(`轮询次数超过${count}次，停止轮询`)
        return
      }
      timerHash[timerName] = setTimeout(() => fetchData(), delay)
    }

    /**
     * @description 重置并停止
     */
    const reset = () => {
      retryCount.value = 0
      resolvedHash[timerName] = false
      stopPolling(timerName)
    }

    /**
     * @description 检查是否满足resolve
     * @param data
     */
    const checkResolved = (data: T) => {
      // 如果入参有resolveStatus满足resolve的条件，提前resolve
      if (resolveStatus && !resolvedHash[timerName] && resolveStatus(data)) {
        // 需提前resolve状态
        resolvedHash[timerName] = true
        resolve(data)
        // 同时判断是否满足结束条件，满足就停止轮询
        const result = checkFinished(data)
        return result
      }
      return false
    }

    /**
     * @description 检查是否满足结束
     * @param data
     */
    const checkFinished = (data: T) => {
      // 如果满足结束条件，停止轮询
      if (finishStatus && finishStatus(data)) {
        reset()
        resolve(data)
        return true
      }
      return false
    }

    /**
     * @description 轮询主函数
     */
    const fetchData = async () => {
      try {
        const data = await polling(args)

        const resolveFinished = checkResolved(data)

        const finished = checkFinished(data)

        // 只要finished不为true的状态，就继续执行
        if (!resolveFinished && !finished) {
          process()
        }
      } catch (error) {
        if (failedCallback && typeof failedCallback === 'function') {
          failedCallback(error as T)
        }
        cancel()
      }
    }
    startPolling()
  })
}
