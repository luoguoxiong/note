import { isAliMiniApp, isAmapMiniApp } from '@public/utils/device'
import { Any } from '@public/utils/types'
export * from '@public/utils/device'
export * from '@public/utils/formatter'
export * from '@public/utils/url'
export * from '@public/utils/applicationUtil'
export * from '@public/utils/user/index'
export * from '@public/utils/platformApi'
export * from '@public/utils/reportUtil'
export * from '@public/utils/router'
export * from '@public/utils/user'
export * from '@public/utils/tools'
export * from '@public/utils/common'

export const uuid = (): string => {
  function b(a?: number) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : (([1e7] as Any) + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
  }
  return b()
}

type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => Promise<ReturnType<T>>

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): DebouncedFunction<T> {
  let timeout
  // @ts-ignore
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const context = this

    clearTimeout(timeout)

    timeout = setTimeout(() => func.apply(context, args), wait)
  }
}

/**
 * 深度解码URI组件，处理任意多次的编码，并返回解析后的数组
 * @param {string} encodedStr - 编码后的字符串
 * @returns {Array} 解码后得到的URL数组
 * @throws {Error} 如果解码或解析失败
 */
export function deepDecodeURIComponent(encodedStr: string) {
  if (typeof encodedStr !== 'string') {
    throw new Error('输入必须是一个字符串')
  }

  let current = encodedStr
  let previous

  // 循环解码，直到字符串不再变化
  do {
    previous = current
    try {
      current = decodeURIComponent(current)
    } catch (error) {
      throw Error(error)
    }
  } while (current !== previous) // 当字符串不再变化时停止

  return current
}

export function decodeURLSafe(url: string, retryCount: number = 5): string {
  const needed = !url.startsWith('http://') && !url.startsWith('https://') && retryCount > 0

  if (needed) {
    return decodeURLSafe(decodeURIComponent(url), retryCount - 1)
  }
  return url
}

export function encodeURLSafe(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return encodeURIComponent(url)
  }
  return url
}

export function nanoid() {
  return Math.random().toString(36).slice(2)
}

/**
 * 将字符串中的 vw 单位转换为 rem
 * @param {string} str - 包含 CSS 数值的字符串，例如 "width: 50vw; font-size: 2vw;"
 * @param {number} viewportWidth - 设计稿宽度，默认 375
 * @param {number} baseFontSize - 1rem 的像素值，默认 16
 * @returns {string} 转换后的字符串，vw 全部替换为 rem
 */
export function vwToRem(str: string, viewportWidth = 375, baseFontSize = 16) {
  // 支付宝、高德不支持rem
  if (isAliMiniApp || isAmapMiniApp) {
    return str
  }
  return str.replace(/([-+]?\d*\.?\d+)vw/g, (match, p1) => {
    const remValue = (parseFloat(p1) * viewportWidth) / 100 / baseFontSize
    return remValue.toFixed(4).replace(/\.?0+$/, '') + 'rem'
  })
}

export function replaceVersion(url: string, version: string) {
  return url.replace(/\/\d+\.\d+\.\d+\//, `/${version}/`)
}
