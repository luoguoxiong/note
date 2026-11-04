// src/router/hooks/use-route.ts

import Taro from '@tarojs/taro'
import { RouteLocationNormalized } from '../type'
import { getQueryObject } from '@order-public-sub-public/utils'

export function useRoute(): RouteLocationNormalized {
  const pages = Taro.getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const path = currentPage?.route ? `/${currentPage?.route || ''}` : ''
  const query = getQueryObject()

  return {
    path,
    name: currentPage?.route || '',
    query,
    params: query,
    fullPath: path + buildQueryString(query),
    meta: {},
  }
}

/**
 * 将对象转换为查询字符串
 * @param query - 查询参数对象
 * @returns 查询字符串（例如：?id=123&name=abc）
 */
export function buildQueryString(query: Record<string, any>): string {
  const parts: string[] = []

  for (const key in query) {
    if (Object.prototype.hasOwnProperty?.call(query, key)) {
      const value = query[key]

      // 忽略 undefined 和 null 值
      if (value === undefined || value === null) {
        continue
      }

      // 如果是 boolean 类型，true 变成 key，false 不传参
      let encodedValue: string
      if (typeof value === 'boolean') {
        if (value) {
          encodedValue = key // 例如：flag => ?flag
        } else {
          continue // false 直接忽略
        }
      } else {
        encodedValue = encodeURIComponent(value)
      }

      parts.push(`${encodeURIComponent(key)}=${encodedValue}`)
    }
  }

  return parts.length > 0 ? `?${parts.join('&')}` : ''
}
