export const isDate = (val: unknown): val is Date => val instanceof Date
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

export type Interceptor = (...args: any[]) => Promise<boolean> | boolean | undefined | void

export const funInterceptor = (
  interceptor: Interceptor | undefined,
  {
    args = [],
    done,
    canceled,
  }: {
    args?: unknown[]
    done: (val?: any) => void
    canceled?: () => void
  },
) => {
  if (interceptor) {
    const returnVal = interceptor(...args)

    if (isPromise(returnVal)) {
      returnVal
        .then((value) => {
          if (value) {
            done(value)
          } else if (canceled) {
            canceled()
          }
        })
        .catch(() => {})
    } else if (returnVal) {
      done()
    } else if (canceled) {
      canceled()
    }
  } else {
    done()
  }
}
