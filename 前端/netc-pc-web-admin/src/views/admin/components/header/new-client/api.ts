/**
 * new-client(新版客户端顶栏) API
 * 来源: netc-pc-web/src/services/api/{admin,common,vts/index,preloadOrderData}.js
 * 接口的 service 方法名(headerUrl)与旧基座完全一致
 */
import { http } from '@/utils/request/request'
import type { HttpOptions } from '@/utils/types'

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

// ==================== 客户端日志任务 (旧 services/api/admin.js) ====================

/** 日志任务查询 web.user.getTask */
export const getLogMission = (params: Record<string, any>) => {
  return req('web.user.getTask', params, true)
}

/** 日志任务上报 web.user.reportTask */
export const updateLogMission = (params: Record<string, any>) => {
  return req('web.user.reportTask', params, true)
}

/** 腾讯云临时凭证 web.user.nativeTask.getTencentSession */
export const getTencentSessionApi = () => {
  return req('web.user.nativeTask.getTencentSession', {}, true)
}

// ==================== 壳版本管理 (旧 services/api/admin.js) ====================

/** 壳的版本管理接口 web.version.versionManager.checkVersion */
export const clientCheckVersion = (params: Record<string, any>) => {
  return req('web.version.versionManager.checkVersion', params, true)
}

/** 原生壳的版本上报 web.version.versionManager.reportData */
export const clientVersionReportData = (params: Record<string, any>) => {
  return req('web.version.versionManager.reportData', params, true)
}

// ==================== 升级缓存配置 (旧 services/api/vts/index.js) ====================

/** 获取缓存配置 web.cacheConfig.getCache */
export const getCache = (params: Record<string, any>) => {
  return req('web.cacheConfig.getCache', params)
}

/** 保存缓存配置 web.cacheConfig.saveOrUpdate */
export const saveOrUpdate = (params: Record<string, any>) => {
  return req('web.cacheConfig.saveOrUpdate', params)
}

// ==================== 代理信息 (旧 services/api/common.js) ====================

/** 保存代理信息 web.client.clientLoginDomainLog.updateLog */
export function saveProxyInfo(params: Record<string, any>) {
  const paramsData = {
    address: params.ProxyUrl,
    port: params.ProxyPort,
    userName: params.ProxyUsername,
    password: params.ProxyPassword,
    domain: params.ProxyDomain,
    agentStatus: params.ProxyType,
  }
  return req('web.client.clientLoginDomainLog.updateLog', paramsData)
}

// ==================== 预跑数据 (旧 services/api/preloadOrderData.js) ====================

/** 通知后端刷新单页数据 web.order.init.quickOrder.flushSinglePage */
export const pullFlushSinglePageData = (params: Record<string, any> = {}) => {
  return req('web.order.init.quickOrder.flushSinglePage', { source: 'pc', ...params })
}
