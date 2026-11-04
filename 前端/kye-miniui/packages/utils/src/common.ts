/* 检测是否为px */
export const pxCheck = (value?: string | number): string | undefined => {
  if (value !== undefined) {
    return isNaN(Number(value)) ? String(value) : `${value}px`
  }
}

export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

export const getPropByPath = (obj: any, keyPath: string) => {
  try {
    return keyPath.split('.').reduce((prev, curr) => prev[curr], obj)
  } catch (error) {
    return ''
  }
}
export const highlightText = (text: string, identifier: string) => {
  let result = ''
  if (!identifier) {
    result = text
  } else {
    result = text.split(identifier).join(`<span style="color: #8365f6; font-weight: 600;">${identifier}</span>`)
  }
  return result
}

/**
 * 防抖函数
 * @param fn 执行函数
 * @param ms 延迟时间 (默认 250)
 * @param options 配置
 *   - scope: 作用域 (默认 this)
 *   - useTimeout: 是否使用 setTimeout (默认 true)
 *   - immediate: 是否立即执行 (默认 false)
 */
export const debounce = (
  fn: (...args: any[]) => any,
  ms = 250,
  options: { scope?: any; useTimeout?: boolean; immediate?: boolean } = {},
) => {
  const { scope = null, useTimeout = true, immediate = false } = options
  let timer: any = null

  function debounced(this: any, ...args: any[]) {
    const context = scope || this

    if (!useTimeout || ms === 0) {
      // 直接同步执行
      return fn.apply(context, args)
    }

    if (timer) clearTimeout(timer)

    if (immediate && !timer) {
      fn.apply(context, args)
    }

    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(context, args)
      }
      timer = null
    }, ms)
  }

  // 新增取消功能
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}

/**
 * throttle 函数
 * @param {Function} fn - 需要节流执行的函数
 * @param {number} wait - 间隔时间，单位 ms
 * @param {Object} options - 可选配置
 *   options.scope: 指定 this
 *   options.leading: 是否立即执行一次
 *   options.trailing: 是否在最后一次触发后再执行一次
 */
export const throttle = (fn, wait = 200, options = {}) => {
  const { scope = null, leading = true, trailing = true } = options
  let timer = null
  let lastArgs = null
  let lastThis = null
  let lastTime = 0

  return function (...args) {
    const now = Date.now()
    if (!lastTime && !leading) lastTime = now

    const remaining = wait - (now - lastTime)
    lastArgs = args
    lastThis = scope || this

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(lastThis, lastArgs)
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0
        timer = null
        fn.apply(lastThis, lastArgs)
      }, remaining)
    }
  }
}
