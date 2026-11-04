import { http } from '@public/utils/request'
import { CheckVersionResponse } from '@public/apis/version/types'

// VERSION-版本检查及更新 (V1.0)
export const ApiVersionManagerCheckVersion = (params = {}) => {
  return http<CheckVersionResponse>('web.version.versionManager.checkVersion', params, { hideToast: true })
}

// VERSION-版本数据上报 (V1.0)
export const ApiVersionManagerReportData = (params = {}) => {
  return http<CheckVersionResponse>('web.version.versionManager.reportData', params, { hideToast: true })
}
