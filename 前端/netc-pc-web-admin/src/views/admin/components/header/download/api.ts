/**
 * 下载中心 API
 * 来源: netc-pc-web/src/services/api/downloadCenter.js
 * 接口的 service 方法名(headerUrl)与旧基座完全一致
 * hideErrMsg -> 新请求层 options { toast: false }
 */
import { http } from '@/utils/request/request'
import type { HttpOptions } from '@/utils/types'
import { generateBrowserUuid } from '@/stores/pc-web/deps/misc'

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

/** 创建文件中心下载任务(旧 createTask, hideErrMsg: true) */
export const createTask = (params: Record<string, any> = {}) => {
  const deviceId = generateBrowserUuid()
  return req('web.task.fileDownload.createTask', { ...params, deviceId }, true)
}

/** 创建文件中心下载任务 V2(旧 createTaskV2, hideErrMsg: true) */
export const createTaskV2 = (params: Record<string, any> = {}) => {
  const deviceId = generateBrowserUuid()
  return req('web.task.download.createTask', { ...params, deviceId }, true)
}

/** 获取下载列表(旧 getList, hideErrMsg: true) */
export const getList = (params: Record<string, any> = {}) => {
  return req('web.task.fileDownload.paginationSearch', params, true)
}

/** 删除压缩包下载任务(旧 delCompressFile) */
export const delCompressFile = (params: Record<string, any> = {}) => {
  return req('web.task.fileDownload.deleteCompressedFile', params)
}

/** 重试任务(旧 retryTask, hideErrMsg: true) */
export const retryTask = (params: Record<string, any> = {}) => {
  return req('web.task.fileDownload.retryTask', params, true)
}

/** 获取未下载的任务(旧 getUnDownTask, hideErrMsg: true) */
export const getUnDownTask = (params: Record<string, any> = {}) => {
  const deviceId = generateBrowserUuid()
  return req('web.task.fileDownload.getUnDownTask', { ...params, deviceId }, true)
}

/** 前往下载、标记已读(旧 readUnDownTask) */
export const readUnDownTask = (params: Record<string, any> = {}) => {
  const deviceId = generateBrowserUuid()
  return req('web.task.fileDownload.readUnDownTask', { ...params, deviceId })
}

/** 获取下载链接(旧 getFileUrl) */
export const getFileUrl = (params: Record<string, any> = {}) => {
  return req('web.task.fileDownload.getUrl', params)
}

/** 更新下载状态(旧 updateCompressionStatus) */
export const updateCompressionStatus = (params: Record<string, any> = {}) => {
  return req('web.task.fileDownload.updateCompressionStatus', params)
}
