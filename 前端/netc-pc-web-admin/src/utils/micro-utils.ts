export interface MicroAppInfo {
  menuCode?: string
  routePath?: string
  loadAddress?: string
  grayHeader?: string[]
}

/**
 * URL 拼接参数
 * @param url 基础 URL
 * @param paramData 参数对象
 * @returns 拼接后的 URL
 */
export function urlContact(url: string, paramData: Record<string, string>): string {
  const separator = url.includes('?') ? '&' : '?'
  const params = Object.entries(paramData)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  return `${url}${separator}${params}`
}
