/**
 * header 相关 API
 * 来源: netc-pc-web/src/services/api/{common,admin,versoinUpdata,backVersion}.js
 * 接口的 service 方法名(headerUrl)与旧基座完全一致
 */
import { http } from '@/utils/request/request'
import type { HttpOptions } from '@/utils/types'
import { isClientMode } from '@/native/electron'

/** 旧基座统一响应结构 */
export interface LegacyResponse<T = any> {
  code: number
  data: T
  msg?: string
  [key: string]: any
}

/** 旧请求选项(hideErrMsg -> toast:false) */
const req = <T = any>(apiCode: string, data: Record<string, any> = {}, hideErrMsg = false) => {
  return http<T>(apiCode, data, {
    retryCount: 0,
    ...(hideErrMsg ? ({ toast: false } as HttpOptions) : {}),
  }) as Promise<LegacyResponse<T>>
}

// ==================== 广告 (旧 services/api/common.js) ====================

/** 广告详情查询 web.advertisement.getDetails */
export function getAdvertisementDetails(params: Record<string, any>) {
  return req('web.advertisement.getDetails', params, true)
}

/** 用户操作事件触发接口 web.advertisement.confirmByUser */
export function advertisementConfirmByUser(params: Record<string, any>, hideErrMsg?: boolean) {
  return req('web.advertisement.confirmByUser', params, !!hideErrMsg)
}

/**
 * 用户操作事件触发接口 web.advertisement.event.report
 * @param params { adCodes: string[], eventType: number, buttonName?: string, operatePort?: string, operatorSystem?: string }
 */
export function eventReport(params: Record<string, any>, hideErrMsg?: boolean) {
  // 不需要曝光了
  if (params.eventType === 3) return

  if (!params.adCodes?.filter(Boolean).length) return

  return req(
    'web.advertisement.event.report',
    { operatePort: 'PC', operatorSystem: isClientMode() ? 'pcClient' : 'pc', ...params },
    hideErrMsg
  )
}

// ==================== 下载 (旧 services/api/admin.js) ====================

/** 获取壳最新下载地址 web.version.versionManager.getVersionLink */
export const getLastClientLink = (params: Record<string, any>) => {
  return req('web.version.versionManager.getVersionLink', params, true)
}

/** 下载帮助 web.help.downloadHelp */
export const downloadHelp = (params: Record<string, any>) => {
  return req('web.help.downloadHelp', params, true)
}

// ==================== 版本更新 (旧 services/api/versoinUpdata.js) ====================

/** 版本更新历史记录 web.version.clientWebVersionManager.getHistoryVersionList */
export function getHistoryVersionList(params: Record<string, any>) {
  return req('web.version.clientWebVersionManager.getHistoryVersionList', params, true)
}

// ==================== 回到旧版 (旧 services/api/backVersion.js) ====================

/** 返回旧版 - 文案 web.user.lightApplication.backToVersion.versionContent */
export const apiBackToVersionVersionContent = (params: Record<string, any>) => {
  return req('web.user.lightApplication.backToVersion.versionContent', params, true)
}

/** 返回旧版 - 提交 web.user.lightApplication.backToVersion.submit */
export const apiBackToVersionSubmit = (params: Record<string, any>) => {
  return req('web.user.lightApplication.backToVersion.submit', params)
}
