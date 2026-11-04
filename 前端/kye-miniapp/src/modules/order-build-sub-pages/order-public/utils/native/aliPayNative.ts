import { scanCode, saveImageToPhotosAlbum } from '@tarojs/taro'

const aliPayNative = (data: any, webviewId: string) => {
  const webViewContext = my.createWebViewContext(webviewId || 'webview')
  const { method = '' } = data || {}
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
  }
}

export default aliPayNative
