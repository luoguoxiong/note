import Taro from '@tarojs/taro'
import { filterOldUrlMap, scanOldUrlMap, simpleRouteMap, specialJumpList, tabRouterMap } from './route-mapping'
import { urlContact } from '@/public/utils'
import kyeNavigate from '@public/utils/native/navigate'

function splitQuery(url: string, splitStr = '?') {
  const questionMarkIndex = url.indexOf(splitStr)

  if (questionMarkIndex === -1) {
    return [url, '']
  }

  const before = url.substring(0, questionMarkIndex)
  const after = url.substring(questionMarkIndex + 1)

  return [before, after]
}

/**
 * 解析 path 和 query 参数
 */
function parseUrl(url: string): { path: string; query: Record<string, string> } {
  const [rawPath, search = ''] = splitQuery(url, '?')
  const path = rawPath.startsWith('/') ? rawPath : '/' + rawPath
  const query: Record<string, string> = {}
  search.split('&').forEach((pair) => {
    const [key, val] = splitQuery(pair, '=')
    if (key) query[key] = decodeURIComponent(val || '')
  })

  return { path, query }
}

/**
 * 根据旧路由跳转到新路由
 * @param oldPath 原路径（可能包含 query）
 * @param options 额外参数和跳转类型
 */
export const navigateByOldPath = (
  oldPath: string,
  options?: {
    params?: Record<string, any>
    type?: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch'
  },
) => {
  const { path, query } = parseUrl(oldPath)

  const newPath = options?.type === 'switchTab' ? tabRouterMap[path] : simpleRouteMap[path]

  if (!newPath) {
    Taro[options?.type || 'navigateTo']({ url: oldPath })
    // Taro.showToast({
    //   icon: 'none',
    //   title: `${oldPath}没有找到新路由`,
    // })
    return
  }

  const finalParams = { ...query, ...(options?.params || {}) }

  const url = urlContact(newPath, finalParams)

  return Taro[options?.type || 'navigateTo']({ url })
}

/* 是否存在可转换为原生链接的H5URL */
export const oldUrlHasNative = (url: string) => {
  return Object.keys(scanOldUrlMap).some((u) => url.includes(u))
}

export const oldUrlFilterLink = (url: string) => {
  return filterOldUrlMap.some((u) => url.includes(u))
}

/* url转换为原生路径 */
export const oldUrlToNativePath = (url: string, urlParamStr?: string): string => {
  try {
    const parsedUrl = new URL(url) // 解析完整 URL
    const pathname = parsedUrl.pathname
    const hash = parsedUrl.hash

    const searchStr = urlParamStr ? `?${urlParamStr}` : parsedUrl.search
    for (const oldPath in specialJumpList) {
      // 兼容二级界面跳转
      if (url.includes(oldPath) || hash.includes(oldPath)) {
        const newPath = specialJumpList[oldPath]
        return `${newPath}${searchStr}` // 保留 query 参数
      }
    }
    for (const oldPath in scanOldUrlMap) {
      if (pathname.startsWith(oldPath) || hash.includes(oldPath)) {
        const newPath = scanOldUrlMap[oldPath]
        return `${newPath}${searchStr}` // 保留 query 参数
        // return `${newPath}${parsedUrl.search}` // 保留 query 参数
      }
    }
    // 不匹配则返回原始 URL
    return url
  } catch (err) {
    // 如果是相对路径（不是完整 URL），fallback 处理
    for (const oldPath in scanOldUrlMap) {
      if (url.startsWith(oldPath)) {
        return `${scanOldUrlMap[oldPath]}${url.slice(oldPath.length)}`
      }
    }

    return url
  }
}

/**
 * 是否H5 特殊页面(空白页)
 * @param url
 * @returns {boolean}
 */
export const isH5UrlSpecialJump = (url: string) => {
  if (!url) {
    return false
  }
  let result = false
  const parsedUrl = new URL(url) // 解析完整 URL
  const hash = parsedUrl.hash
  for (const oldPath in specialJumpList) {
    // 兼容二级界面跳转
    if (url.includes(oldPath) || hash.includes(oldPath)) {
      result = true
    }
  }
  return result
}

/**
 * 旧H5url跳转到原生页
 * @param url H5url
 * @param options
 */
export const navigateByOldUrl = (
  url: string,
  options?: {
    urlParamStr?: string
  },
) => {
  const path = oldUrlToNativePath(url, options?.urlParamStr)
  console.log('navigateByOldUrl', path)
  kyeNavigate.navigateTo({ url: path })
}

/**
 * 旧H5url跳转到原生页
 * @param url H5url
 * @param options
 */
export const redirectToByOldUrl = (
  url: string,
  options?: {
    urlParamStr?: string
  },
) => {
  const path = oldUrlToNativePath(url, options?.urlParamStr)
  console.log('redirectToByOldUrl', path)
  kyeNavigate.redirectTo({ url: path })
}
