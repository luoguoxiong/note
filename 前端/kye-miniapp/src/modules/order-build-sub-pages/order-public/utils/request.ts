import axios from 'axios'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { getToken } from '@order-public-sub-public/utils/auth'
import { $native, createSign, uuid } from '@order-public-sub-public/utils/index'
import { isAppBrowse, isOfflinePackage } from './device'
import { toastConfig } from '@order-public-sub-public/utils/page-source'
import { isLocalUseIp, RequestBaseUrl } from '@order-public-sub-public/utils/env'
import { getVersionAsHeader } from '@public/constants/version'
import { getOrderGrayHeader } from '@/public/utils/grayHeader/order'

import { cancelWhiteList } from './cancel'

import { HttpHeaders, HttpOptions, HttpResponse, ReqConfig, ResponseData, XFormType } from './types'
import { PlainObject } from '@order-public-sub-public/types'
import { DEFAULT_APP_KEY, HttpCode, maxRetryCount } from '@order-public-sub-public/constants'
import { excludeProdPreview, isOrderPreviewRoute, isPreviewPath, isProdPreviewRoute } from './route'
import { ERRORS, grayheader, RESPONSE_ERRORS, getBatchId } from '@order-public-sub-public/configs'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { apiPerformance } from '@order-public-sub-public/utils/reportConfig'
import { onlyNumber } from '@order-public-sub-public/utils/pattern'
import { getEnvConfig } from '@/public/config'
import { isPROD } from '@order-public-sub-public/utils/env'
import { cloneDeep } from 'lodash-es'
import { useStore } from '@order-public-sub-public/store'
import { getXenvId } from '@public/appxenv'

const version = getVersionAsHeader()
const piniaStore = useStore()

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

// baseURL: 'https://some-domain.com/api/',

const service = axios.create({ timeout: 10000 })

/** 请求拦截 */
service.interceptors.request.use(
  (config: ReqConfig) => {
    // 把当请求实例的取消句柄存放到store
    const method = config.headers.method

    // 如果是预览页面, 不发起请求
    // 如果是生产预览页面并且除了initConfig和initCheck接口，其他接口都屏蔽掉
    if (isOrderPreviewRoute() || isPreviewPath()) {
      if (isProdPreviewRoute() && excludeProdPreview.includes(method)) {
        console.log(`生产环境预览页面 ${method} 接口放行`)
      } else {
        return Promise.reject('识别到预览标识，请求被拦截')
      }
    }

    removePendingAjax(config)
    addPendingAjax(config)

    const isIgnoreCancel = cancelWhiteList.includes(method) // 是否忽略手动取消
    // 统一追加headers
    if (!isIgnoreCancel) {
      const uuidOfService = uuid()
      config.uuid = uuidOfService

      config.signal = controller?.signal
      piniaStore.root.addAxiosItem({ uuid: uuidOfService, cancel: controller?.abort, method })
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/** 响应拦截 */
service.interceptors.response.use(
  (response: ResponseData) => {
    const { config, data } = response
    // console.log(config?.ignore, config, '============ config ===========')
    // setTimeout(() => apiPerformance(config, data))
    // 和request拦截器起来保存起来的请求实例对冲掉
    const { uuid } = config || {}
    if (uuid) {
      piniaStore.root.removeAxiosItem(uuid)
    }

    removePendingAjax(config)
    piniaStore.root.setTokenIsAlive(true)

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

      // 更新token可用状态：已失效
      piniaStore.root.setTokenIsAlive(false)
    }

    /**
     * ios 系统不区分大小写 这里采用全小写形式
     */
    if (config?.ignore) {
      return { data: null, code: HttpCode.SUCCESS, success: true }
    }

    // 查件页登录信息失效处理
    if (toastConfig(data.code)) {
      return Promise.reject({ ...data, message: data.msg })
    }

    if (config?.toast !== false) {
      showToast(data.msg || '服务器异常，请稍后重试')
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
      // error.message = `接口-${method}-已被手动取消`
      console.warn(error.message)
    }
    const errorMsg = Reflect.get(RESPONSE_ERRORS, error.code)
    if (errorMsg) {
      showToast(errorMsg)
    }
    // setTimeout(() => error?.config && performanceSourceCollect(error.config.url))
    return Promise.reject(error)
  },
)

/**
 * 开放平台接口请求
 * @param apiCode
 * @param data
 * @param options
 * @returns {Promise}
 */
// eslint-disable-next-line max-lines-per-function
export const http = async <T>(
  apiCode: string,
  data = {},
  options: HttpOptions = { retryCount: 0 },
): Promise<HttpResponse<T>> => {
  try {
    const timestamp = Date.now()
    const token = (await getToken()) as string

    let batchId = getBatchId()?.replace(/\s+/g, '')

    data = cloneDeep(data)
    const headers: HttpHeaders = {
      appkey: options.appkey || DEFAULT_APP_KEY,
      method: apiCode,
      format: 'JSON',
      timestamp,
      token,
      version_flag: version,
      sign: createSign(token, timestamp, data),
      ...getOrderGrayHeader(),
    }

    if (batchId && batchId.length > 6 && onlyNumber.test(batchId)) {
      // 异常场景batchId会出现 有一个占位符，且length为1，
      headers['x-batchId'] = batchId
    }

    if (options?.batchId) {
      // 兼容分包获取数据
      headers['x-batchId'] = options?.batchId
    }

    if (options?.delBatchId) {
      // 显式要求删除 x-batchId（如展会首页实名tips接口不期望带batchId）
      delete headers['x-batchId']
    }

    if (tmpCacheKey.value) {
      headers['X-Tmp-Cache-Key'] = tmpCacheKey.value
    }
    const { xForm, plateForm } = getEnvConfig()
    if (!isLocalUseIp) {
      headers['x-from'] = xForm
    }
    if (plateForm) {
      headers['plate-form'] = plateForm
    }

    if (getXenvId()) {
      headers['x-envid'] = getXenvId()
    }

    if (isAppBrowse && isOfflinePackage) {
      return new Promise((resolve, reject) => {
        $native
          .request<HttpResponse<T>>({
            headers: {
              appkey: options.appkey || DEFAULT_APP_KEY,
              method: apiCode,
            },
            data,
          })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            err.msg = err.code === HttpCode.EMPTY ? '请先登录您的手机号' : err.msg
            if (options.toast !== false) {
              showToast(err.msg || '服务器异常，请稍后重试')
            }
            reject(err)
          })
      })
    } else {
      try {
        return await service({
          ...options,
          url: `${RequestBaseUrl}/router/rest?${apiCode}`,
          method: 'POST',
          data,
          headers: headers,
        })
      } catch (error) {
        console.error('service', headers, error)
        if (typeof options.retryCount === 'number') {
          // console.log(options.retryCount, 'options.retryCount')
          if (options.retryCount === 0) return Promise.reject(error)
          if (options.retryCount <= maxRetryCount) {
            // 请求失败，进行重试
            return http<T>(apiCode, data, { ...options, retryCount: options.retryCount - 1 })
          }
        }
        return Promise.reject(error)
      }
    }
  } catch (error) {
    console.error(11111112222222, error)
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
  options: HttpOptions = { retryCount: 0 },
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
export const httpFile = async <T>(data: PlainObject) => {
  if (isAppBrowse && isOfflinePackage) {
    delete data.file
    console.log(data, 'httpFile')
    return new Promise((resolve, reject) => {
      $native
        .upload<HttpResponse<T>>({
          data: data,
        })
        .then((res) => {
          console.log(res, 'upload')
          if (res.code === 0) {
            resolve(res)
          } else {
            res.msg = res.code === HttpCode.EMPTY ? '请先登录您的手机号' : data.msg
            reject(res)
          }
        })
        .catch((err) => {
          console.log(err, 'upload-catch')
          reject(err)
        })
    })
  } else {
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

    if (!isLocalUseIp) {
      headers['x-from'] = getEnvConfig().xForm
    }

    return service({
      url: `${RequestBaseUrl}/router/upload`,
      method: 'POST',
      data: formData,
      headers,
    })
  }
}
