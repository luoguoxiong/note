import Taro from '@tarojs/taro'

const promisify = <T, P>(apiFunc: (params: P) => void) => {
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

export const getLocation = async (option: Taro.getLocation.Option) => {
  return await promisify<
    Taro.getLocation.SuccessCallbackResult,
    Taro.getLocation.Option
  >(window.tt?.getLocation)(option)
}

export const chooseMedia = async (params: Taro.chooseMedia.Option) => {
  return await promisify<
    Taro.chooseMedia.SuccessCallbackResult,
    Taro.chooseMedia.Option
  >(window.tt?.chooseMedia)(params)
}

export const scanCode = async (option: Taro.scanCode.Option) => {
  return await promisify<
    Taro.scanCode.SuccessCallbackResult,
    Taro.scanCode.Option
  >(window.tt?.scanCode)(option)
}

export const openLocation = async (params: Taro.openLocation.Option) => {
  return await promisify<any, Taro.openLocation.Option>(
    window.tt?.openLocation,
  )(params)
}

export const getClipboardData = async (
  option: Taro.getClipboardData.Option,
) => {
  return await promisify<
    Taro.getClipboardData.SuccessCallbackOption,
    Taro.getClipboardData.Option
  >(window.tt?.getClipboardData)(option)
}

export const getImageInfo = async (
  params: Taro.getImageInfo.Option,
): Promise<Taro.getImageInfo.SuccessCallbackResult> => {
  return promisify<
    Taro.getImageInfo.SuccessCallbackResult,
    Taro.getImageInfo.Option
  >(window.tt?.getImageInfo)(params)
}

export const saveImageToPhotosAlbum = async (
  params: Taro.saveImageToPhotosAlbum.Option,
) => {
  return await promisify<any, Taro.saveVideoToPhotosAlbum.Option>(
    window.tt?.saveImageToPhotosAlbum,
  )(params)
}

export const getFileSystemManager = () => window.tt.getFileSystemManager()
