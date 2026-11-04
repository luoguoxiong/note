/**
 * 给 URL 添加参数（兼容小程序）
 * @param url 原始 URL
 * @param params 要添加的参数对象
 * @returns 添加参数后的 URL
 */
export function addUrlParams(
  url?: string,
  params?: Record<string, string | number | boolean | any>,
): string {
  url = url || ''
  if (!params || typeof params !== 'object') return url

  // 分割 URL 和已有参数
  const [baseUrl, queryString] = url.split('?')
  const queryParams = queryString ? queryString.split('&') : []

  // 转换已有参数为对象
  const paramObj: Record<string, string> = {}
  queryParams.forEach((item) => {
    const [key, value] = item.split('=')
    paramObj[key] = decodeURIComponent(value)
  })

  // 合并新参数
  Object.keys(params).forEach((key) => {
    paramObj[key] = encodeURIComponent(String(params[key]))
  })

  // 重新拼接 URL
  const newQueryString = Object.keys(paramObj)
    .map((key) => `${key}=${paramObj[key]}`)
    .join('&')

  return `${baseUrl}?${newQueryString}`
}

/**
 * 解析 URL 查询参数
 * @param url 可选，默认为当前页面 URL
 * @returns 解析后的参数对象，支持多个相同 key 的参数
 */
export function getQueryObject(
  url: string = typeof window !== 'undefined' ? window.location.href : '',
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}
  const search = url.split('?')[1] || ''
  if (!search) return params

  search.replace(/([^?&=]+)=([^&]*)/g, (_, key, value) => {
    key = decodeURIComponent(key)
    value = decodeURIComponent(value)
    if (params[key]) {
      params[key] = Array.isArray(params[key])
        ? [...(params[key] as string[]), value]
        : [params[key] as string, value]
    } else {
      params[key] = value
    }
    return ''
  })

  return params
}
