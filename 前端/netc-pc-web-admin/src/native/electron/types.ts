/**
 * Electron 壳能力相关类型定义
 */
import type { PlainObject } from '@/types'

// 壳类型枚举
export enum ClientFrameType {
  OLD = 1,
  MINI_BLINK = 2,
  CEF_SHARP = 3,
  WEBVIEW2 = 4,
  ELECTRON = 5,
  KUASHENG = 6,
}

// 窗体状态
export interface WindowState {
  state: 'normal' | 'minimized' | 'maximized'
}

// 打印机信息
export interface PrinterInfo {
  name: string
  isDefault: boolean
}

// 系统信息
export interface SystemInfo {
  platform: string
  version: string
  arch: string
}

// 代理信息
export interface ProxyInfo {
  enable: boolean
  host?: string
  port?: number
}

// 通用响应格式
export interface NativeResponse<T = any> {
  code: number
  msg?: string
  data?: T
}

// 导出表格数据格式
export interface ExportTableData {
  name: string
  data: any[][]
}

// 打印数据
export interface PrintData {
  templateText?: string
  data?: PlainObject
  noType?: any
  printName?: string
}

// 批量打印新数据
export interface BatchPrintNewData {
  printDataList: any[]
  printName?: string
  noType?: any
}
