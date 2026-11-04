export const debounce = (fn, ms = 250, scope = null) => {
  let timer
  return function (...args) {
    const context = scope || this
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, ms)
  }
}
