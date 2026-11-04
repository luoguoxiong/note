/**
 * @Desc: utils
 * @Date: 2025/9/4
 */
const debounce = (fn, ms = 250, options = {}) => {
  const { scope = null, useTimeout = true, immediate = false } = options
  let timer = null
  return function (...args) {
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
const throttle = (fn, wait = 200, options = {}) => {
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
module.exports = {
  debounce,
  throttle,
}
