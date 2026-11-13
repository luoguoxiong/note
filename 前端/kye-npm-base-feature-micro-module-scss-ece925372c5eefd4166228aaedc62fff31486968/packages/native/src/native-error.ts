import * as Type from './type'

/**
 * 自定义错误类，用于SDK 错误
 */
export class NativeError extends Error {
  public err: unknown
  constructor(
    public code: Type.AppResCode, // 错误代码
    public data: any, // 错误数据
  ) {
    super(data.errorMessage || String(data)) // 错误信息
    this.name = 'NativeError'
    this.err = data
  }
}
