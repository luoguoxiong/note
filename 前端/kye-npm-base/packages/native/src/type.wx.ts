export interface WechatJSSDK {
  config(config: {
    debug?: boolean
    appId: string
    timestamp: number
    nonceStr: string
    signature: string
    jsApiList: string[]
    beta?: boolean
    openTagList?: string[]
  }): void

  ready(callback: () => void): void
  error(callback: (res: any) => void): void

  scanQRCode(params: {
    needResult: number
    scanType?: ('qrCode' | 'barCode')[]
    success?: (res: { resultStr: string }) => void
    fail?: (err: any) => void
  }): void

  chooseImage(params: {
    count?: number
    sizeType?: ('original' | 'compressed')[]
    sourceType?: ('album' | 'camera')[]
    success?: (res: { localIds: string[] }) => void
    fail?: (err: any) => void
  }): void

  getLocalImgData(params: {
    localId: string
    success?: (res: { localData: string }) => void
    fail?: (err: any) => void
  }): void

  previewImage(params: {
    current: string
    urls: string[]
    success?: () => void
    fail?: (err: any) => void
  }): void

  openLocation(params: {
    latitude: number
    longitude: number
    name?: string
    address?: string
    scale?: number
    infoUrl?: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  getLocation(params: {
    type?: 'wgs84' | 'gcj02'
    success?: (res: {
      latitude: number
      longitude: number
      speed: number
      accuracy: number
    }) => void
    fail?: (err: any) => void
  }): void

  makePhoneCall(params: {
    phoneNumber: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  postMessage(params: {
    message: any
    success?: () => void
    fail?: (err: any) => void
  }): void

  navigateTo(params: {
    url: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  startRecord(params: { success?: () => void; fail?: (err: any) => void }): void

  navigateBack(): void

  switchTab(params: {
    url: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  redirectTo(params: {
    url: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  reLaunch(params: {
    url: string
    success?: () => void
    fail?: (err: any) => void
  }): void

  miniProgram?: any

  stopRecord?: any

  translateVoice?: any

  onVoiceRecordEnd?: any
}
