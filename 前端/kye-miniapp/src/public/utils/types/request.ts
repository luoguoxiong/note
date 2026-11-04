import { Any } from '@public/utils/types'
import { AxiosResponse, CancelToken, InternalAxiosRequestConfig } from 'axios'
import { AxiosRequestConfig } from 'axios/index'

export type HttpResponse<T> = {
  msg?: string
  code?: number
  data: T
  traceId?: string
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
  // 是否返回完整的错误提示
  isAllErrBack?: boolean
  fullData?: boolean // 是否返回完成错误数据
  needVersionFlag?: boolean //是否需要携带version_flag的请求头
  extraHeader?: Record<string, string>
  baseUrl?: string // 自定义请求域名，默认 RequestBaseUrl
}

export interface HttpHeaders {
  appkey: number | string
  method: string
  format: 'JSON'
  timestamp: number
  token: string
  sign: string
  // 跨越速运_APP x-from:111 跨越寄件_微信小程序 x-from:114,跨科技(149)
  // 'x-from': isAppBrowse ? '111' : '114',
  ['x-from']?: '111' | '114' | '147' | '149' | number
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
  data: Any
  config: {
    ignore?: boolean
    uuid?: string
    toast?: boolean
    hideToast?: boolean
    fullData?: boolean
    packageName?: string
    headers?: any
  }
}
/* taro-axios 使用 */
// export interface RequestConfig extends AxiosRequestConfig, HttpOptions {
//   uuid?: string
//   signal?: Any
// }
// export type ResponseDataTaro = AxiosResponse & {
//   data: Any
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
