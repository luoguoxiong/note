import { AxiosResponse, CancelToken, InternalAxiosRequestConfig } from 'axios'
import { AxiosRequestConfig } from 'axios/index'

export type HttpResponse<T> = {
  msg?: string
  code?: number
  data: T
}

export type HttpOptions = {
  appkey?: number
  toast?: boolean
  cancelDuplicated?: boolean
  retryCount?: number
  timeout?: number
  // 是否免登录接口
  unToken?: boolean
  // 是否关闭接口toast提示
  hideToast?: boolean
  packageName?: string
}

export interface HttpHeaders {
  appkey: number | string
  method: string
  format: 'JSON'
  timestamp: number
  token: string
  sign: string
  // 跨越速运_APP x-from:111 跨越寄件_微信小程序 x-from:114
  // 'x-from': isAppBrowse ? '111' : '114',
  ['x-from']?: '111' | '114' | '147'
  // ['x-batchId']?: string
  ['X-framework-ICGray']?: number
  [key: string]: any | undefined
}

export interface ReqConfig extends InternalAxiosRequestConfig, HttpOptions {
  uuid?: string
  packageParams?: PackageParams
  interceptors?: NetcRequestInterceptors | undefined
}

export type ResponseData = AxiosResponse & {
  data: any
  config: {
    ignore?: boolean
    uuid?: string
    toast?: boolean
    hideToast?: boolean
    packageName?: string
  }
}
/* taro-axios 使用 */
// export interface RequestConfig extends AxiosRequestConfig, HttpOptions {
//   uuid?: string
//   signal?: any
// }
// export type ResponseDataTaro = AxiosResponse & {
//   data: any
//   config: AxiosRequestConfig & {
//     ignore?: boolean
//     uuid?: string
//     toast?: boolean
//     hideToast?: boolean
//   }
// }

export interface AnyParams {
  [props: string]: any
}

export interface NetcInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _cancelToken?: CancelToken
  _cancelTrigger?: () => void
}

// 自定义拦截器配置
export interface NetcRequestInterceptors {
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig
  requestInterceptorCatch?: (error: any) => any
  responseInterceptor?: (config: AxiosResponse) => AxiosResponse
  responseInterceptorCatch?: (error: any) => any
}

export interface PackageConfigHeaders {
  [key: string]: any | undefined
}

/* 分包request 自定义配置 */
export interface PackageParams extends AxiosRequestConfig {
  headers?: PackageConfigHeaders
  interceptors?: NetcRequestInterceptors | undefined
}
