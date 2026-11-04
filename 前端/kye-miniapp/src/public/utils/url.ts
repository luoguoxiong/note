/**
 * 向 URL 字符串追加字符串参数
 * @param url 原始 URL
 * @param str 追加的查询字符串（例如：'a=1&b=2'）
 * @returns 追加后的 URL
 */
export const urlQueryStringAdd = (url: string, str?: string): string => {
  if (!str) return url
  return `${url}${url?.includes('?') ? '&' : '?'}${str}`
}

/**
 * 将对象参数转换为 URL 查询字符串
 * @param params 参数对象
 * @returns 查询字符串（例如：'a=1&b=2'）
 */
const paramsToUrlStr = (params: Record<string, any>): string => {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key] ?? '')}`)
    .join('&')
}

/**
 * 将对象参数拼接到 URL 上（paramData 可选）
 * @param url 原始 URL
 * @param paramData 参数对象（可选）
 * @returns 拼接后的 URL
 */
/**
 * 将对象参数拼接到 URL 上（paramData 可选）
 * 已存在的 URL 参数优先，不会被 paramData 覆盖
 * @param url 原始 URL
 * @param paramData 参数对象（可选）
 * @returns 拼接后的 URL
 */
export const urlContact = (url: string, paramData?: Record<string, any>): string => {
  if (!paramData || Object.keys(paramData).length === 0) {
    return url
  }

  // 先解析 URL 已有参数
  const existingParams = getQueryObject(url)

  // 过滤掉 paramData 中已存在的参数
  const filteredParamData: Record<string, any> = {}
  for (const key in paramData) {
    if (!existingParams[key]) {
      filteredParamData[key] = paramData[key]
    }
  }

  // 如果没有可拼接的参数，直接返回原 URL
  if (Object.keys(filteredParamData).length === 0) {
    return url
  }

  // 拼接新的参数
  const paramStr = paramsToUrlStr(filteredParamData)
  return urlQueryStringAdd(url, paramStr)
}

/**
 * 获取 URL 中的查询参数对象
 * @param url 可选，默认取当前窗口地址
 * @returns 参数对象（例如：{ a: '1', b: '2' }）
 */
export const getQueryObject = (url?: string): Record<string, string> => {
  const targetUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')
  const search = targetUrl.substring(targetUrl.lastIndexOf('?') + 1)
  const obj: Record<string, string> = {}

  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (_, $1, $2) => {
    const name = decodeURIComponent($1)
    const val = decodeURIComponent($2)
    obj[name] = val
    return ''
  })

  return obj
}
