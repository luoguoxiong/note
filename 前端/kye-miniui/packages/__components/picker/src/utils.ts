import { Any } from '@packages/types/common'

export function preventDefault(event: Event, isStopPropagation?: boolean) {
  if (typeof event.cancelable !== 'boolean' || event.cancelable) {
    // event.preventDefault()
  }

  if (isStopPropagation) {
    event.stopPropagation()
  }
}

export const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max)
/* 检测是否为px */
export const pxCheck = (value?: string | number): string | undefined => {
  if (value !== undefined) {
    return isNaN(Number(value)) ? String(value) : `${value}px`
  }
}

export const isSameValue = (valA: any, valB: any) => JSON.stringify(valA) === JSON.stringify(valB)

export const debounce = (fn, ms = 250, scope) => {
  let timer
  return function (...args) {
    const context = scope || this
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, ms)
  }
}

/* 调用次数限制 */
// @ts-ignore
export const limitFunctionCalls = (fn, limit, interval, cancel?: any) => {
  let callCount = 0 // 调用计数
  let timer = null as Any // 定时器

  return function (...args) {
    if (callCount < limit) {
      fn(...args) // 调用函数
      callCount++ // 增加计数

      // 设置或重置定时器
      if (!timer) {
        timer = setTimeout(() => {
          callCount = 0 // 清空次数
          timer = null
        }, interval)
      }
    } else {
      console.log('频繁触发多次,短时间内暂停重复')
      if (cancel) {
        cancel()
      }
    }
  }
}
