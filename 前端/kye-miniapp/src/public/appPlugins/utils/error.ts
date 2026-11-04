/**
 * @Desc: appPluginError appPlugin error信息
 *  appPluginError('当前环境非微信app环境', { env: process.env.NODE_ENV })
 * @Date: 2025/8/14
 */
/**
 * 通用错误处理
 * @param message 错误信息或 Error 对象
 * @param extra   额外上下文信息（可选）
 * @returns 永远返回一个 rejected Promise（方便在 async 场景中直接 return）
 */
export const appPluginError = (message: string | Error, extra?: Record<string, any>): never => {
  const isError = message instanceof Error
  const errObj = isError ? message : new Error(String(message))

  // 格式化输出
  const logPrefix = '[AppPlugin]'
  const logMsg = `${logPrefix} ${errObj.message}`
  if (extra) {
    console.error(logMsg, extra)
  } else {
    console.error(logMsg)
  }

  // TODO: 信息上报
  // return Promise.reject(errObj)
  // throw errObj
}
