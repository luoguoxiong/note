import { http } from '@public/utils/request'
import { getFSJsSdkSignResponse } from '@public/apis/fs-api/types'

export const ApiGetFSJSSDK = (params = {}) => {
  return http<getFSJsSdkSignResponse>('web.user.login.feishu.getJsSdkSign', params, { hideToast: true })
}

export const ApiGetPrivateFSJSSDK = (params = {}) => {
  return http<getFSJsSdkSignResponse>('web.user.login.feishu.private.getJsSdkSign', params, { hideToast: true })
}
