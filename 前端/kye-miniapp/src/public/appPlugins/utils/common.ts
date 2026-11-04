/**
 * @Desc: common
 * @Date: 2025/9/3
 */

/**
 * JSON.parse 安全解析
 * @param stringObject
 * @returns {Object|{}|*}
 */
interface SafeJsonParseOptions {
  decode?: boolean // 是否启用 decodeURIComponent
  defaultValue?: unknown // 解析失败时的默认值
}

export const safeJsonParse = <T = unknown>(input: unknown, options: SafeJsonParseOptions = {}): T => {
  const { decode = true, defaultValue = {} } = options

  // 如果本来就是对象，直接返回
  if (typeof input === 'object' && input !== null) {
    return input as T
  }

  if (typeof input === 'string') {
    try {
      const str = decode ? decodeURIComponent(input) : input
      return JSON.parse(str) as T
    } catch (err) {
      console.error('[safeJsonParse error]', err)
      return defaultValue as T
    }
  }

  return defaultValue as T
}
