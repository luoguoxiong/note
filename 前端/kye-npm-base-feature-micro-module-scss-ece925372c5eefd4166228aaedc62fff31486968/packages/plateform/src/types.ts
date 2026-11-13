interface Window {
  h5sdk: {
    /**
     * 注册错误回调
     * @param callback 错误回调函数
     */
    error: (callback: (err: any) => void) => void

    /**
     * SDK 准备完成回调
     * @param callback 准备完成后执行的函数
     */
    ready: (callback: () => void) => void

    /**
     * 其他 H5 SDK 方法（按需扩展）
     */
    [key: string]: any
  }
  tt: {
    requestAccess: (options: {
      appID: string
      scopeList: Record<string, any>[]
      scope: string
      success?: (res: any) => void
      fail?: (res: any) => void
    }) => void
    [key: string]: any
  }
}
