/* demo 子包request扩展 */

import { http as httpNew } from '@public/utils/request/index'
import { HttpOptions, HttpResponse, NetcRequestInterceptors, ReqConfig, ResponseData } from '@public/utils/types'
import { TIME_OUT } from '@public/utils/request/constants'
import { getGrayHeaderWithApplication } from '@public/utils'
// import axios from 'axios'

/* 获取灰度头 */
const packageGrayHeader = getGrayHeaderWithApplication('A2009', 'M2089') || {}
/* 自定义分包初始化request 配置 */
const requestPackageOrderConfig = {
  packageName: 'packageOrder',
  // @ts-ignore
  headers: {
    'X-Module-A': 'ModuleAHeaderValue',
    'X-Gray': '10',
    ...packageGrayHeader,
  },
  params: {
    lang: 'en',
  },
  interceptors: {
    // 请求拦截器-非必填
    requestInterceptor: (config: ReqConfig) => {
      // 添加header测试
      if (config.headers) {
        config.headers['X-order-addKey'] = 'addKeyValue'
      }

      /* 测试 - 添加自定义手动cancel 关闭指定接口 */
      // if (!config.cancelToken) {
      //   const CancelToken = axios.CancelToken
      //   const source = CancelToken.source()
      //   config.cancelToken = source.token
      //   source.cancel('web.test-testOrder')
      // }
      return config
    },
    /* 请求拦截器 response - 与主包逻辑共存不影响公共数据 TODO 带对齐*/
    responseInterceptor: (response: ResponseData) => {
      console.log('package responseInterceptor>>>', response)
    },
    // 请求拦截器 request catch-非必填 (优先级高)
    requestInterceptorCatch: (error) => {
      return Promise.reject(error)
    },
    // 请求拦截器response catch-非必填 (优先级高)
    responseInterceptorCatch: (error) => {
      console.log('package responseInterceptor catch>>>', error)
      return Promise.reject(error)
    },
  } as NetcRequestInterceptors,
}

/* 自定义分包初始化request 配置2 */
// addRequestPackageConfig('packageSearch')

const requestPackageConfigSearch = {
  packageName: 'packageSearch',
  baseURL: 'https://api.moduleSearch.com',
  // @ts-ignore
  headers: {
    'X-Module-B': 'ModuleBHeaderValue',
    'X-Gray': '20',
    'X-framework-ICGray': '20',
  },
  params: {
    lang: 'en',
  },
}

/* 自定义http方法，指定分包packageName */
const http = <T>(
  apiCode: string,
  data = {},
  options: HttpOptions = {
    retryCount: 0,
    timeout: TIME_OUT,
    unToken: false,
  },
): Promise<HttpResponse<T>> => {
  return httpNew(apiCode, data, { ...options }, requestPackageOrderConfig)
}

const http1 = (apiCode, data, options) => {
  return httpNew(apiCode, data, { ...options }, requestPackageConfigSearch)
}

/* 接口请求测试-分包1  */
export const fetchScanQrcodeGetConfigOrder = () => {
  console.log('重复请求-web.login.checkLogin-testOrder')
  return http('web.test-testOrder', { source: 20 }, { hideToast: true, cancelDuplicated: false })
}

/* 接口请求测试-分包2  */
export const fetchScanQrcodeGetConfigSearch = () => {
  return http1('web.test-testSearch', { source: 20 }, { hideToast: true, cancelDuplicated: false })
}
