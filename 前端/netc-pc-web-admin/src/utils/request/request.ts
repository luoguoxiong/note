import { ERRORS, RESPONSE_ERRORS, TIME_OUT } from '@/configs'
import { DEFAULT_APP_KEY, HttpCode, maxRetryCount } from '@/constants'
import { parentMessageSend } from '@/utils/appBridge'
import { checkPsdChangedAndLogout } from '@/utils/iframeBridge/logout'
import { Any, PlainObject } from '@/types'
import { createSign, uuid } from '@/utils'
import { getToken } from '@/utils/auth'
import { RequestBaseUrl } from '@/utils/env'
import axios from 'axios'
import { HttpHeaders, HttpOptions, HttpResponse, ReqConfig, ResponseData } from '../types'
import { cancelWhiteList } from './cancel'
import { setGayHeader } from './setGayHeader'
// import { apiPerformance } from '@/utils/reportConfig'

// 用于取消
const controller = new AbortController()
export const ECAS_APP_ID = 115
export const pendingAjax = new Map()

/**
 * 免退登检查接口：用户主动改变登录态的请求，返回 token 失效码时不再触发
 * 「退登原因检查(logoutTip) + 温馨提示弹窗」，避免与业务自身的退登/切号流程打架
 * （对齐老基座 netc-pc-web 的 ignoreUserInvalidInterface 约定）
 *
 * 注意：只放登录态变更类接口，业务接口误加会导致 token 失效时静默无提示
 */
export const IGNORE_LOG_OUT_CHECK_METHODS = [
  // 主动退出登录
  'web.login.logout',
  // 退登原因检查接口自身（防接口异常时递归）
  'web.login.logoutTip',
  // 切换登录手机号 / 短信验证码 / 切换状态校验
  'web.login.switchLogin',
  'web.login.verification.sendSmsCode',
  'web.login.verification.checkSmsCode',
  'web.login.switch.checkSwitchFlag',
  'web.user.sso.check.bindList',
  // 切换客户手机号(白名单) / 一键切回
  'web.ssoChangeAccount.login',
  'web.ssoChangeAccount.changeBack',
]

const removePendingAjax = (config: ReqConfig) => {
  if (!config.cancelDuplicated) return
  const key = config.headers.method
  if (key && pendingAjax.has(key)) {
    const cancel = pendingAjax.get(key)
    cancel(key)
    pendingAjax.delete(key)
  }
}

/**
 * @description 关闭弹窗取消当前过程中校验
 */
export const removeBatchSinglePendingAjax = (key: string) => {
  const cancel = pendingAjax.get(key)
  console.log('pendingAjax', pendingAjax, cancel)
  cancel && cancel(key)
  pendingAjax.delete(key)
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

const service = axios.create()

/** 请求拦截 */
service.interceptors.request.use(
  (config: ReqConfig) => {
    // 把当请求实例的取消句柄存放到store
    const method = config.headers.method
    setGayHeader(config.headers)
    /*    // processInit是不可以被嘎掉的
    const isSingleInit = isSingleInitProcess(method, config.data)

    if (!isSingleInit) {
      removePendingAjax(config, 'start')
      addPendingAjax(config)
    }*/
    removePendingAjax(config)
    addPendingAjax(config)

    const isIgnoreCancel = cancelWhiteList.includes(method) // 是否忽略手动取消

    // 泳道id从老壳本地存储 NETC_FMK_ENV 读取
    let xEnvid = ''
    try {
      const fmkEnvRaw = localStorage.getItem('NETC_FMK_ENV')
      if (fmkEnvRaw) {
        const fmkEnv = JSON.parse(fmkEnvRaw)
        if (fmkEnv && fmkEnv.envId) {
          xEnvid = fmkEnv.envId
        }
      }
    } catch (e) {
      // 解析失败时忽略
    }
    if (xEnvid) {
      config.headers['x-envid'] = xEnvid
    }
    if (!isIgnoreCancel) {
      const uuidOfService = uuid()
      config.uuid = uuidOfService

      config.signal = controller.signal
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/** 响应拦截 */
service.interceptors.response.use(
  (response: ResponseData) => {
    const { config, data } = response
    // 埋点性能上报
    // setTimeout(() => apiPerformance(config, data))
    // console.log(config?.ignore, config, '============ config ===========')

    // 和request拦截器起来保存起来的请求实例对冲掉
    removePendingAjax(config)
    if (data.code === HttpCode.SUCCESS) {
      return data
    }

    if ([HttpCode.EMPTY, HttpCode.EXPIRED, HttpCode.INVALID].includes(data.code)) {
      // 登陆身份信息已过期，请重新登录
      if (data?.msg?.indexOf('token为空') !== -1) {
        data.msg = '登录身份信息已过期，请重新登录'
      } else {
        data.msg = data.msg || '请先登录您的手机号'
      }

      // token已失效：退登原因检查（是否修改密码）+ 触发退登弹窗，且不弹多余toast。
      // 主动登出/登录态变更类接口（接口黑名单 + 单请求 ignoreLogOutCheck）豁免，
      // 避免与业务自身的退登流程打架；logoutTip 自身也在黑名单内，防接口异常时递归
      // 清缓存时机对齐老基座：100201 点「去登录」后才清；6001/60010 先清再弹
      config.toast = false
      const failedMethod = String(config.headers.method || '')
      const ignoreLogOutCheck = config.ignoreLogOutCheck || IGNORE_LOG_OUT_CHECK_METHODS.includes(failedMethod)
      if (!ignoreLogOutCheck) {
        checkPsdChangedAndLogout({ clearBeforeShow: data.code !== HttpCode.EXPIRED })
      }
    }

    /**
     * ios 系统不区分大小写 这里采用全小写形式
     */
    if (config?.ignore) {
      return { data: null, code: HttpCode.SUCCESS, success: true }
    }

    // 查件页登录信息失效处理
    // if (toastConfig(data.code)) {
    //   return Promise.reject({ ...data, message: data.msg })
    // }

    if (config?.toast !== false) {
      let errMsg = data.msg || '服务器异常，请稍后重试'
      if (errMsg === '文件类型不匹配') {
        errMsg = '无法识别当前导入文件，请确认文件格式是否正确！'
      }
      parentMessageSend.error(errMsg)
    }

    return Promise.reject({ ...data, message: data.msg })
  },
  (error) => {
    if (error?.config?.ignore) {
      return { data: null }
    }

    const msg = error.message
    if (msg && !axios.isCancel(error)) {
      error.message = Reflect.get(ERRORS, msg) || msg || ERRORS.api
    }

    if (axios.isCancel(error)) {
      console.warn(error.message)
    }

    // 取出对应的错误信息并提示
    const errorMsg = Reflect.get(RESPONSE_ERRORS, error.code)

    if (errorMsg) {
      parentMessageSend.error(errorMsg)
    }

    return Promise.reject(error)
  }
)

/**
 * 开放平台接口请求
 * @param apiCode
 * @param data
 * @param options
 * @returns {Promise}
 */
/** http 请求选项(扩展自定义请求头, 与 ReqConfig 的 headers[AxiosHeaders] 类型解耦) */
export type HttpRequestOptions = HttpOptions & { headers?: Record<string, string>; unToken?: boolean }

export const http = async <T>(
  apiCode: string,
  data = {},
  options: HttpRequestOptions = { retryCount: 0, timeout: TIME_OUT, unToken: false }
): Promise<HttpResponse<T>> => {
  const timestamp = Date.now()
  // unToken: 对齐老请求层 token:false(不带 token 头且不加 sign, 老/request.js L95,L114)
  const token = options.unToken ? '' : ((await getToken()) as string)

  const headers: HttpHeaders = {
    appkey: options.appkey || DEFAULT_APP_KEY,
    method: apiCode,
    format: 'JSON',
    timestamp,
    ...(token ? { token, sign: createSign(token, timestamp, data) } : {}),
  }

  try {
    return await service({
      ...options,
      url: `${RequestBaseUrl}/router/rest?${apiCode}`,
      method: 'POST',
      data,
      headers: { ...headers, ...(options.headers || {}) },
    })
  } catch (error) {
    if (typeof options.retryCount === 'number') {
      console.log(options.retryCount, '接口重试 options.retryCount')
      if (options.retryCount === 0) return Promise.reject('请求失败 ' + (error as Any)?.message || error)
      if (options.retryCount <= maxRetryCount) {
        // 请求失败，进行重试
        return http<T>(apiCode, data, { ...options, retryCount: options.retryCount - 1 })
      }
    }
    return Promise.reject(error)
  }
}

/**
 * 重试请求函数
 * @returns
 */
export const httpRetry = async <T>(
  apiCode: string,
  data = {},
  options: HttpOptions = { retryCount: 0 }
): Promise<HttpResponse<T>> => {
  const retryOptions = {
    ...options,
    retryCount: maxRetryCount,
  }
  return http(apiCode, data, retryOptions)
}

/**
 * 开放平台接口请求
 * @param apiCode
 * @param data
 * @param options
 * @returns {Promise}
 */
export const request = async (apiCode: string, data = {}, options = {}) => {
  const res = await http(apiCode, data, options)
  return res.data
}

/**
 * 文件中心上传
 * @param data
 * @returns {Promise}
 */
export const httpFile = (data: PlainObject) => {
  delete data.base64
  delete data.fileType
  delete data.fileName
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  const headers: Partial<HttpHeaders> = {
    // 跨越速运_APP x-from:111 跨越寄件_微信小程序 x-from:114
    'Content-Type': 'multipart/form-data',
  }

  // if (!isLocalUseIp) {
  //   headers['x-from'] = isAppBrowse ? '111' : '114'
  // }

  return service({
    url: `${RequestBaseUrl}/router/upload`,
    method: 'POST',
    data: formData,
    headers,
  })
}
