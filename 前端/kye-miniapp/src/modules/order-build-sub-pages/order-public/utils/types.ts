import { AxiosHeaderValue, AxiosResponse, InternalAxiosRequestConfig } from 'axios'


export type PlainObject = Record<string, any>

// requeset.js用到的类型
export type HttpOptions = {
  appkey?: number
  toast?: boolean
  cancelDuplicated?: boolean
  retryCount?: number
  unToken?: boolean
  batchId?: string
  delBatchId?: boolean
}

export type HttpResponse<T> = {
  msg: string
  code: number
  data: T
}

export interface ReqConfig extends InternalAxiosRequestConfig, HttpOptions {
  uuid?: string
}

export type ResponseData = AxiosResponse & {
  data: any
  config: {
    ignore?: boolean
    uuid?: string
    toast?: boolean
  }
}

export type NativeFileParams = {
  path: string | object
}

export type NativeDownLoadFileParams = {
  url: string
  external?: boolean
}

export type NativeDownloadImgParams = {
  imageData: string
}

export type NativeScanQRCodeParams = {
  scanType?: any[]
  needResult?: number
}

export type NativePreviewImageParams = {
  urls: any[]
  current?: string
  showSaveBtn?: boolean
}
export type NativeChooseImageParams = {
  count?: number
  sizeType?: string[]
  sourceType?: string[]
  necessary?: boolean
  success?: (res: any) => void
  fail?: (res: any) => void
  complete?: (res: any) => void
}
export type NativeChooseFileParams = {
  fileType?: string[]
}
export type NativeCheckApiParams = {
  api: string
}
export type NativeNavigateToParams = {
  page: string
  type?: string
  params?: any
}
export type NativeShareParams = {
  platform: string
  weixin_timeline?: string
  contentType?: string
  url?: string
  miniprogram?: string
  title?: string
  desc?: string
  imgUrl?: string
  link?: string
  programUserName?: string
  programPath?: string
  programType?: number
}

export enum XFormType {
  '跨越速运_APP' = '111',
  '跨越寄件_微信小程序' = '114',
  '跨越寄件_支付宝小程序' = '147',
}

export interface HttpHeaders {
  appkey: number
  method: string
  format: 'JSON'
  timestamp: number
  token: string
  sign: string
  // 跨越速运_APP x-from:111 跨越寄件_微信小程序 x-from:114
  // 'x-from': isAppBrowse ? '111' : '114',
  ['x-from']?: XFormType
  ['x-batchId']?: string
  [key: string]: AxiosHeaderValue | undefined
  ['X-framework-ICGray']?: number
}

export interface TokenResponse {
  data?: {
    token?: string
  }
}

// 页面名称：
// setting - 设置页(检查更新、分享app、用户协议、隐私政策等)
// appSetting - App设置页(系统设置页)
// locationSetting - GPS开关页面(Android特有)
export interface NativeJumpParams {
  target: 'setting' | 'appSetting' | 'locationSetting' | 'systemSetting'
}
