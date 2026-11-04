import { HttpOptions, HttpResponse, PackageParams, ReqConfig } from '@public/utils/types'
import { http } from '@public/utils/request'
import { TIME_OUT } from '@public/utils/request/constants'

// eslint-disable-next-line no-undef
const isPROD = process.env.TARO_APP_ENV === 'prod'

/**
 * @Desc: requestUser 分包用户接口-请求统一处理
 * @Date: 2025/6/27
 */
export const packageUserRequestConfig = {
  packageName: 'user',
  headers: {
    // ['x-envid']: 2497,
    // ...(isPROD ? { 'X-framework-UserCenterGray': 10 } : {}),
  },
  interceptors: {
    requestInterceptor: (config: ReqConfig) => {
      // const { method } = config?.headers || {}
      // const API_TEST_KUAKEJI = [
      //   'web.ssoWeChatMini.login',
      //   'web.login.passwordLogin',
      //   'web.login.smsLogin',
      //   'web.ssoWeChatMini.autoLogin',
      // ]
      // // TODO 调试跨科技小程序 148
      // if (API_TEST_KUAKEJI.includes(method) && config?.headers) {
      //   config.headers['x-from'] = 148
      // }
      return config
    },
  },
}

export const httpUser = async <T>(
  apiCode: string,
  data = {},
  options: HttpOptions = {
    retryCount: 0,
    timeout: TIME_OUT,
    unToken: false,
  },
  packageParams?: PackageParams,
): Promise<HttpResponse<T>> => {
  return http(apiCode, data, options, packageParams || packageUserRequestConfig)
}
