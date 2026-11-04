function noop() {}

export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

export const isDef = <T>(val: T): val is NonNullable<T> => val !== undefined && val !== null

export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isPromise = <T = any>(val: unknown): val is Promise<T> =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch)

export type Interceptor = (...args: any[]) => Promise<boolean> | boolean | undefined | void

export function callInterceptor(
  interceptor: Interceptor | undefined,
  {
    args = [],
    done,
    canceled,
    error,
  }: {
    args?: unknown[]
    done: () => void
    canceled?: () => void
    error?: () => void
  },
) {
  if (interceptor) {
    // eslint-disable-next-line prefer-spread
    const returnVal = interceptor.apply(null, args)

    if (isPromise(returnVal)) {
      returnVal
        .then((value) => {
          if (value) {
            done()
          } else if (canceled) {
            canceled()
          }
        })
        .catch(error || noop)
    } else if (returnVal) {
      done()
    } else if (canceled) {
      canceled()
    }
  } else {
    done()
  }
}
