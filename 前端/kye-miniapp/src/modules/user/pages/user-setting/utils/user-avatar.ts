import { isWeixinAppSync } from '@/public/config'
import Taro from '@tarojs/taro'

export const getUserAvatar = () => {
  return new Promise<string | null>((resolve, reject) => {
    // app 多判断一下权限
    let isWWxApp = isWeixinAppSync()
    console.log('🚀 ~ getUserAvatar ~ isWWxApp:', isWWxApp)
    // 多端app小程序
    if (isWWxApp) {
      // 会自动唤起权限询问
      Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'], // 压缩图
        sourceType: ['camera', 'album'], // 从相册选择或拍照
        success: (res) => {
          console.log('🚀 ~ getUserAvatar ~ res:', res)
          const tempFiles = res.tempFiles
          if (tempFiles && tempFiles.length > 0) {
            resolve(tempFiles[0]?.tempFilePath)
          } else {
            resolve(null)
          }
        },
        fail: reject,
      })
      return
      // eslint-disable-next-line no-unreachable
      // const appAuthorizeSetting = Taro.getAppAuthorizeSetting()
      // const cameraDenied = ['denied', 'not determined'].includes(appAuthorizeSetting['cameraAuthorized'])
      // const albumDenied = ['denied', 'not determined'].includes(appAuthorizeSetting['albumAuthorized'])

      // if (!cameraDenied) {
      //   sourceType.push('camera')
      // }
      // if (!albumDenied) {
      //   sourceType.push('album')
      // }

      // if (sourceType.length < 2) {
      //   Taro.showModal({ title: '温馨提示', content: '请在设置中打开相机和相册权限', showCancel: false })
      //   reject('authorization denied')
      //   return
      // }
    }
    // 支付宝小程序推荐使用 my.chooseImage 来选择头像
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 压缩图
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          resolve(res.tempFilePaths[0])
        } else {
          resolve(null)
        }
      },
      fail: reject,
    })
  })
}

export const downloadFileToBase64 = (url: string) => {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    const fs = Taro.getFileSystemManager()
    fs.readFile({
      filePath: `${url}`,
      success: ({ data }) => {
        const base64 = Taro.arrayBufferToBase64(data as ArrayBuffer)
        resolve('data:image/png;base64,' + base64)
      },
      fail: reject,
    })
  })
}
