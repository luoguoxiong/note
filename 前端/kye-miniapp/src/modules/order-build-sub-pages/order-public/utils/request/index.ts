import axios from 'axios'
import Taro from '@tarojs/taro'
import { RequestAppKey, RequestBaseUrl } from '@order-public-sub-public/utils/env'
import {
  DEFAULT_APP_KEY,
  HttpCode,
  maxRetryCount,
  cancelWhiteList,
  ERRORS,
  RESPONSE_ERRORS,
  TIME_OUT,
  logoutIgnoreList,
} from '@order-public-sub-public/utils/request/constants'
import { getVersionAsHeader } from '@public/constants/version'
import {
  HttpResponse,
  HttpOptions,
  HttpHeaders,
  ResponseData,
  ReqConfig,
  PackageParams,
} from '@order-public-sub-public/utils/types'
import { createSign, defaultAppId, getGrayHeaderInfo } from '@order-public-sub-public/utils/request/utils'
import { uuid } from '@order-public-sub-public/utils'
import { getToken } from '@order-public-sub-public/storage/user'
import { useLogOutTip } from '@order-public-sub-public/utils/request/useLogOutTip'
import useRequest from '@order-public-sub-public/utils/request/useRequest'
const { isShowingLogoutModal, onLogoutTipApi } = useLogOutTip()
const { requestConfigUpdate, requestInterceptorUpdate, getRequestPackageInterceptor } = useRequest()
const version = getVersionAsHeader()
const service = axios.create({
  // 超时15s
  timeout: TIME_OUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 用于取消
let controller: AbortController
if (typeof AbortController !== 'undefined') {
  controller = new AbortController()
}
export const pendingAjax = new Map()
const removePendingAjax = (config: ReqConfig) => {
  if (!config.cancelDuplicated) return
  const key = config.headers.method

  if (key && pendingAjax.has(key)) {
    const cancel = pendingAjax.get(key)
    cancel(key)
    pendingAjax.delete(key)
  }
}

const addPendingAjax = (config: ReqConfig) => {
  if (!config.cancelDuplicated) return
  const key = config.headers.method

  if (!config.cancelToken) {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    config.cancelToken = source.token
    // 如果pendingAjax中不存在当前请求，添加进去
    if (key && !pendingAjax.has(key)) {
      pendingAjax.set(key, source.cancel)
    }
  }
}

/** 请求拦截 */
service.interceptors.request.use(
  (config: ReqConfig) => {
    /* requestPackageConfigs 模块独立配置检查 */
    config = requestConfigUpdate(config)
    const packageInterceptorConfig = requestInterceptorUpdate(config)
    /* requestPackageConfigs 模块独立配置检查结束 */
    const method = config.headers.method

    removePendingAjax(config)
    addPendingAjax(config)

    const isIgnoreCancel = cancelWhiteList.includes(method) // 是否忽略手动取消
    if (!isIgnoreCancel) {
      const uuidOfService = uuid()
      config.uuid = uuidOfService
      config.signal = controller?.signal
    }
    return packageInterceptorConfig || config
  },
  (error) => {
    console.log('request interceptor error', error)
    /* package 子包 单独catch处理 */
    const packageInterceptor = getRequestPackageInterceptor(error?.config)
    if (packageInterceptor?.requestInterceptorCatch) {
      return packageInterceptor?.requestInterceptorCatch(error)
    }
    /* 公共request catch 处理*/
    return Promise.reject(error)
  },
)

/** 响应拦截 */
service.interceptors.response.use(
  (response: ResponseData) => {
    const { config, data } = response
    removePendingAjax(config)

    /* package子包 - response单独处理 - 与主包逻辑共存 */
    const packageInterceptor = getRequestPackageInterceptor(config)
    if (packageInterceptor?.responseInterceptor) {
      packageInterceptor?.responseInterceptor(response)
    }

    /* 匹配接口数据 */
    if (data.code === HttpCode.SUCCESS) {
      return data
    }

    // 登录状态失效 - 退登弹窗逻辑
    if (data.code === HttpCode.EXPIRED) {
      // 不存在退登弹窗且非指定接口
      if (!isShowingLogoutModal.value && logoutIgnoreList.indexOf(config.headers?.method) === -1) {
        onLogoutTipApi().then((res) => {
          console.log('onLogoutTipApi then', res)
        })
      }
      return Promise.reject({ ...data, message: data.msg, msg: data.msg })
    }

    if (config?.hideToast !== true) {
      Taro.showToast({ icon: 'none', title: data.msg || '服务器异常，请稍后重试', duration: 2000 })
    }

    return Promise.reject({ ...data, message: data.msg })
  },
  (error) => {
    if (error?.config?.ignore) {
      return { data: null }
    }

    const msg = error.message
    if (msg && !axios.isCancel(error)) {
      error.message = Reflect.get(ERRORS, msg) || ERRORS[msg] || msg || ERRORS.api
    }
    if (axios.isCancel(error)) {
      // error.message = `接口-${method}-已被手动取消`
      console.warn(error.message)
    }
    const errorMsg = Reflect.get(RESPONSE_ERRORS, error.code)
    if (errorMsg) {
      // showToast(errorMsg)
    }

    /* package子包 - response单独catch处理 */
    const packageInterceptor = getRequestPackageInterceptor(error?.config)
    if (packageInterceptor?.responseInterceptorCatch) {
      return packageInterceptor?.responseInterceptorCatch(error)
    }
    /* package主包 - response catch处理 */
    return Promise.reject(error)
  },
)

/* 通用网络请求 */
export const http = async <T>(
  apiCode: string,
  data = {},
  options: HttpOptions = {
    retryCount: 0,
    timeout: TIME_OUT,
    unToken: false,
  },
  packageParams?: PackageParams,
): Promise<HttpResponse<T>> => {
  const timestamp = Date.now()
  const token = options?.unToken ? '' : getToken()
  // 原生灰度头
  const nativeGrayHeader = getGrayHeaderInfo() || {}
  const headers: HttpHeaders = {
    appkey: options.appkey || RequestAppKey() || DEFAULT_APP_KEY,
    method: apiCode,
    format: 'JSON',
    timestamp: timestamp,
    token,
    version_flag: version,
    sign: createSign(token, timestamp, data),
    ...nativeGrayHeader,
  }
  if (token) {
    // TODO 增加接口返回
    headers['x-from'] = defaultAppId
  }

  const optionsParams = {
    ...options,
    packageParams, // 自定义request配置
  }
  try {
    return await service({
      ...optionsParams,
      url: `${RequestBaseUrl}/router/rest?${apiCode}`,
      method: 'POST',
      data,
      headers: headers,
    })
  } catch (error) {
    if (typeof options?.retryCount === 'number') {
      console.log(options.retryCount, '接口重试 options.retryCount')
      if (options.retryCount === 0)
        return Promise.reject('请求失败 ' + (error as any)?.message ? (error as any)?.message : error)
      if (options.retryCount <= maxRetryCount) {
        // 请求失败，进行重试
        return http<T>(apiCode, data, { ...options, retryCount: options.retryCount - 1 })
      }
    }
    return Promise.reject(error)
  }
}
