/**
 * 包装一个异步函数，以确保它仅执行一次。后续调用将返回第一次调用时的相同 Promise。
 * @param asyncFunction 要执行一次的异步函数。
 * @returns 一个函数，该函数将执行异步函数一次，并对后续调用返回相同的 Promise。
 */
export const promiseOnce = <T extends unknown[], R>(asyncFunction: (...args: T) => Promise<R>) => {
  let executingPromise: Promise<R> | null = null

  return async (...args: T) => {
    if (!executingPromise) {
      executingPromise = asyncFunction(...args)
    }
    return executingPromise
  }
}
