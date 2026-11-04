/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import Taro from '@tarojs/taro'

// 创建一个通用的封装函数, TaroApi 转 Promise
export const promisify = <T, P>(apiFunc: (params: P) => void) => {
  return (params: P): Promise<T> => {
    return new Promise((resolve, reject) => {
      apiFunc({
        ...params,
        success: (res: T) => resolve(res),
        fail: (error: TaroGeneral.CallbackResult) => reject(error),
      })
    })
  }
}

// Taro API 定义参数类型
type TaroApiParams = {
  saveImageToPhotosAlbum: Taro.saveImageToPhotosAlbum.Option
  downloadFile: Taro.downloadFile.Option
  scanCode: Taro.scanCode.Option
}

// Taro API 列表
export const TaroApi = {
  saveImageToPhotosAlbum: promisify<TaroGeneral.CallbackResult, TaroApiParams['saveImageToPhotosAlbum']>(
    Taro.saveImageToPhotosAlbum,
  ),
  downloadFile: promisify<Taro.downloadFile.FileSuccessCallbackResult, TaroApiParams['downloadFile']>(
    Taro.downloadFile,
  ),
  scanCode: promisify<Taro.scanCode.SuccessCallbackResult, TaroApiParams['scanCode']>(Taro.scanCode),
}
