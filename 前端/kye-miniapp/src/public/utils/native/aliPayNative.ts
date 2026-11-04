import { scanCode, saveImageToPhotosAlbum, previewImage, chooseImage } from '@tarojs/taro'

/**
 * 转换成base64
 * @param filePath
 * @returns {string}
 */
const readFileToBase64 = (filePath: string) => {
  const fs = my.getFileSystemManager()
  return new Promise((resolve, reject) => {
    fs.readFile({
      filePath: filePath,
      success: ({ data }) => {
        const base64 = my.arrayBufferToBase64(data)
        resolve(base64)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
 * 获取图片大小
 * @param base64
 * @returns {number}
 */
const getImgByteSize = (base64) => {
  let size = 0
  if (base64) {
    const equalIndex = base64.indexOf('=') // 获取=号下标
    if (equalIndex > 0) {
      const str = base64.substring(0, equalIndex) // 去除=号
      const strLength = str.length
      const fileLength = strLength - (strLength / 8) * 2 // 真实的图片byte大小
      size = Math.floor(fileLength) // 向下取整
    } else {
      const strLength = base64.length
      const fileLength = strLength - (strLength / 8) * 2
      size = Math.floor(fileLength) // 向下取整
    }
  }
  return size
}

const aliPayNative = (data: any, webviewId: string) => {
  const webViewContext = my.createWebViewContext(webviewId || 'webview')
  const method = data?.method || ''
  switch (method) {
    case 'scanQRCode':
      scanCode({
        success: (res) => {
          let result = res.result
          if (result.includes(',')) {
            result = result.split(',')[1]
          }
          webViewContext.postMessage({ scanResult: result, method: 'scanQRCode', isSuccess: true })
        },
        fail: (err) => {
          webViewContext.postMessage({ ...err, method: 'scanQRCode', isSuccess: false })
        },
      })
      break
    case 'downloadImage':
      saveImageToPhotosAlbum({
        filePath: data.filePath,
        success: () => {
          webViewContext.postMessage({ method: 'downloadImage', isSuccess: true })
        },
        fail: () => {
          webViewContext.postMessage({ method: 'downloadImage', isSuccess: false })
        },
      })
      break
    case 'previewImage':
      previewImage({
        urls: data.urls,
        current: data.current,
        enablesavephoto: true,
        enableShowPhotoDownload: true,
        success: () => {
          webViewContext.postMessage({ method: 'previewImage', isSuccess: true })
        },
        fail: () => {
          webViewContext.postMessage({ method: 'previewImage', isSuccess: false })
        },
      })
      break
    case 'chooseImage':
      chooseImage({
        count: data.count || 9, // 默认9
        sizeType: data.sizeType || ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: data.sourceType || ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: async (res: any) => {
          if (res?.success) {
            let result: any[] = []
            for (const item of res.tempFilePaths) {
              let base64 = (await readFileToBase64(item)) as any
              if (base64.indexOf('data:image') != 0) {
                //判断是否有这样的头部
                base64 = 'data:image/jpeg;base64,' + base64
              }
              base64 = base64.replace(/\r|\n/g, '').replace('data:image/jpg', 'data:image/jpeg')
              let suffix = '.png'
              if (base64.includes('data:image/jpeg')) {
                suffix = '.jpeg'
              } else if (base64.includes('data:image/jpg')) {
                suffix = '.jpg'
              }
              base64 = base64.replace(/^data:image\/\w+;base64,/, '')
              result.push({
                fileName: `img-${new Date().getTime()}${suffix}`,
                fileSize: (getImgByteSize(base64) / 1024).toFixed(2),
                base64: base64,
              })
            }
            webViewContext.postMessage({ method: 'chooseImage', isSuccess: true, imgList: result })
          }
        },
        fail: () => {
          webViewContext.postMessage({ method: 'chooseImage', isSuccess: false })
        },
      })
  }
}

export default aliPayNative
