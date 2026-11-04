/* eslint-disable no-unused-vars */
// useTimedRequest.ts
import Taro from '@tarojs/taro'

export const GLOBAL_CACHE_KEY = 'KYE-CACHE'

interface Options<T> {
  /** 每个业务的唯一前缀，如 'kye-theme' */
  prefix: string
  /** 缓存时长（毫秒） */
  expire: number
  /** 请求函数 */
  requestFn: () => Promise<T>
  /** 可选：结果加工 */
  transformResponse?: (data: T) => any
}

export function useTimedRequest<T = any>(options: Options<T>) {
  const { prefix, expire, requestFn, transformResponse } = options

  let requestPromise: Promise<any> | null = null

  /** 读取全局缓存对象 */
  const getGlobalCache = (): Record<string, any> => Taro.getStorageSync(GLOBAL_CACHE_KEY) || {}

  /** 写入全局缓存对象 */
  const setGlobalCache = (data: Record<string, any>) => Taro.setStorageSync(GLOBAL_CACHE_KEY, data)

  /** 公共方法：执行请求并更新缓存 */
  const executeRequest = async () => {
    const cache = getGlobalCache()
    const now = Date.now()

    const res = await requestFn()
    const finalData = transformResponse ? transformResponse(res) : res

    const newCache = {
      ...cache,
      [prefix]: finalData,
      [`${prefix}-LAST-TIME`]: now,
    }

    setGlobalCache(newCache)
    return finalData
  }

  /** 正常模式：会检查缓存 */
  const run = async () => {
    const now = Date.now()
    const cache = getGlobalCache()

    const dataKey = prefix
    const timeKey = `${prefix}-LAST-TIME`

    const cacheData = cache[dataKey]
    const lastTime = cache[timeKey]

    // 缓存存在且未过期 → 使用缓存
    if (cacheData && lastTime && now - lastTime < expire) {
      return cacheData
    }

    // 若正在请求 → 复用 Promise
    if (requestPromise) return requestPromise

    requestPromise = (async () => {
      try {
        return await executeRequest()
      } finally {
        requestPromise = null
      }
    })()

    return requestPromise
  }

  /** 强制请求：不检查缓存、不用缓存 Promise、立即发请求 */
  const forceRun = async () => {
    if (requestPromise) {
      // 若正在请求，可选择等待或忽略，推荐等待以避免并发问题
      return requestPromise
    }

    requestPromise = (async () => {
      try {
        return await executeRequest()
      } finally {
        requestPromise = null
      }
    })()

    return requestPromise
  }

  return { run, forceRun }
}
