import { Any } from '@/types'
import { AxiosHeaderValue, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// requeset.js用到的类型
export type HttpOptions = {
  appkey?: number
  toast?: boolean
  cancelDuplicated?: boolean
  retryCount?: number
  timeout?: number
  /** 忽略本次请求的 token 失效退登检查（不触发 logoutTip 与退登弹窗），见 request.ts 黑名单 */
  ignoreLogOutCheck?: boolean
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
  data: Any
  config: {
    ignore?: boolean
    uuid?: string
    toast?: boolean
    /** 忽略本次请求的 token 失效退登检查 */
    ignoreLogOutCheck?: boolean
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
  scanType?: Any[]
  needResult?: number
}

export type NativePreviewImageParams = {
  urls: Any[]
  current?: string
  showSaveBtn?: boolean
}
export type NativeChooseImageParams = {
  count?: number
  sizeType?: string[]
  sourceType?: string[]
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
  params?: Any
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

export interface HttpHeaders {
  appkey: number
  method: string
  format: 'JSON'
  timestamp: number
  token?: string
  sign?: string
  // 'x-from': isAppBrowse ? '111' : '114',
  ['x-from']?: '111' | '114' | '115'
  // ['x-batchId']?: string
  ['X-framework-ICGray']?: number
  [key: string]: AxiosHeaderValue | undefined
}

export interface TokenResponse {
  data?: {
    token?: string
  }
}
