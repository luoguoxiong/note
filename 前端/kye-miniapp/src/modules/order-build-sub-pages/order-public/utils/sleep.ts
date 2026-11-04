/**
 * @description sleep
 * @param timeout
 */
export const sleep = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('done')
    }, timeout)
  })
}
