/**
 * 通用格式化工具
 * 来源: netc-pc-web/src/utils/commonUtil.js (formatBytes / toDecimal2 / parseJson)
 */

/** 字节数格式化 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/** 保留两位小数 */
export const toDecimal2 = (x: number | string): string => {
  const f = Math.round(Number(x) * 100) / 100
  let s = f.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 2) {
    s += '0'
  }
  return s
}

/** 安全 JSON 解析(非法字符串返回 undefined) */
export function parseJson<T = Record<string, any>>(jsonString: unknown): T | undefined {
  if (typeof jsonString !== 'string') {
    return
  }
  try {
    const obj = JSON.parse(jsonString)
    if (typeof obj === 'object' && obj) {
      return obj as T
    }
  } catch (e) {
    // 非法 json 静默处理(与老项目一致)
  }
}
