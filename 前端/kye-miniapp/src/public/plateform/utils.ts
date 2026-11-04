export const promisify = <T, P>(apiFunc: (params: P) => void) => {
  return (params: P): Promise<T> => {
    return new Promise((resolve, reject) => {
      apiFunc({
        ...params,
        success: (res: T) => resolve(res),
        fail: (err: any) => reject(err),
      })
    })
  }
}
