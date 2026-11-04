import { getEnvConfig } from '@/public/config'
import { getToken } from '@public/storage/user'
import { uuid } from '@public/utils'
import { isPROD, RequestAppKey, RequestBaseUrl } from '@public/utils/env'
import {
  cancelWhiteList,
  DEFAULT_APP_KEY,
  ERRORS,
  HttpCode,
  logoutIgnoreList,
  maxRetryCount,
  RESPONSE_ERRORS,
  TIME_OUT,
} from '@public/utils/request/constants'
import { useLogOutTip } from '@public/utils/request/useLogOutTip'
import useRequest from '@public/utils/request/useRequest'
import { createSign, getGrayHeaderInfo } from '@public/utils/request/utils'
import {
  Any,
  HttpHeaders,
  HttpOptions,
  HttpResponse,
  PackageParams,
  ReqConfig,
  ResponseData,
} from '@public/utils/types'
import Taro from '@tarojs/taro'
import axios from 'axios'
import { httpExpiredProcess } from '@public/utils/request/httpProcess'
import { getVersionAsHeader } from '@public/constants/version'

const version = getVersionAsHeader()
const { requestConfigUpdate, requestInterceptorUpdate, getRequestPackageInterceptor } = useRequest()
import { getXenvId } from '@public/appxenv'
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

    if (data.code === HttpCode.CAPTCHA || data.code === HttpCode.FREIGHTTIMECAPTCHA) {
      return data
    }

    // checkLogin 接口直接返回data
    if (config?.fullData === true) {
      return data
    }

    // 登录状态失效 - 退登弹窗逻辑
    if (data.code === HttpCode.EXPIRED) {
      // TOKEN失效逻辑处理
      httpExpiredProcess(config)
      return Promise.reject({ ...data, message: data.msg, msg: data.msg })
    }

    /* 匹配无token报错 */
    if (data.code === HttpCode.EMPTY) {
      return Promise.reject({ ...data, message: data.msg })
    }

    if (config?.hideToast !== true) {
      /**
       * showToast 需要保证 在 hideLoading 之后执行
       * showLoading -> request -> hideLoading -> showToast
       * 需要在请求结束后再显示
       */
      setTimeout(() => {
        Taro.showToast({ icon: 'none', title: data.msg || '服务器异常，请稍后重试', duration: 2000 })
      })
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
    isAllErrBack: false,
    needVersionFlag: false,
    extraHeader: {},
  },
  packageParams?: PackageParams,
): Promise<HttpResponse<T>> => {
  const timestamp = Date.now()
  const token = options?.unToken ? '' : getToken()
  // 原生灰度头
  const nativeGrayHeader = getGrayHeaderInfo() || {}
  const { xForm, plateForm } = getEnvConfig()
  const withoutLoginXForm = xForm
  const headers: HttpHeaders = {
    appkey: options.appkey || RequestAppKey() || DEFAULT_APP_KEY,
    method: apiCode,
    format: 'JSON',
    timestamp: timestamp,
    token,
    ['x-from']: withoutLoginXForm,
    sign: createSign(token, timestamp, data),
    ...nativeGrayHeader,
    ...(options.extraHeader || {}),
  }
  if (getXenvId()) {
    headers['x-envid'] = getXenvId()
  }
  if (options.needVersionFlag) {
    headers['version_flag'] = version
  }
  if (token) {
    // TODO 增加接口返回
    headers['x-from'] = xForm
  }
  if (plateForm) {
    headers['plate-form'] = plateForm
  }

  // // 腾讯图形码添加请求头
  const API_VERCODE_LIST = [
    'web.login.passwordLogin',
    'web.login.smsLogin',
    'web.ssoApp.login',
    'web.login.verification.sendSmsCode',
    'web.login.verification.checkSmsCode',
    'web.login.switchLogin',
    'web.login.weChat.authorizedLoginByRisk',
    'web.login.verification.sendSmsCode',

    'web.uam.client.phonePrivacy.send.switchWithRisk',
    'web.uam.client.sms.send',
    'web.uam.client.phonePrivacy.sms.check',
  ]
  if (API_VERCODE_LIST.includes(apiCode)) {
    headers['x-risk-version'] = 'captcha'
  }

  const optionsParams = {
    ...options,
    packageParams, // 自定义request配置
  }

  try {
    return await service({
      ...optionsParams,
      url: `${options?.baseUrl || RequestBaseUrl}/router/rest?${apiCode}`,
      method: 'POST',
      data,
      headers: headers,
    })
  } catch (error) {
    if (typeof options?.retryCount === 'number') {
      console.log(options.retryCount, '接口重试 options.retryCount')
      if (options.retryCount === 0) {
        if (options?.isAllErrBack) {
          return Promise.reject(error)
        }
        return Promise.reject('请求失败 ' + (error as Any)?.message ? (error as Any)?.message : error)
      }
      if (options.retryCount <= maxRetryCount) {
        // 请求失败，进行重试
        return http<T>(apiCode, data, { ...options, retryCount: options.retryCount - 1 })
      }
    }
    return Promise.reject(error)
  }
}
