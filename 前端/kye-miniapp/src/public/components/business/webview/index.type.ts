export interface AliApiIn {
  method: 'chooseImage' | 'getLocation' | 'scanCode' | 'saveImageToPhotosAlbum'
  data?: any
}

export type WebviewMessage = {
  plateform: 'alipay' | 'wx' | 'app'
  taskKey?: string
} & AliApiIn
