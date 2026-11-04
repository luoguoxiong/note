/** 渠道类型 */
export type ChannelType = '微信' | '企微'

/** 模块映射类型 */
export type ModuleMapType = {
  [key: number]: string
}

/** Aplus队列项类型 */
export interface AplusQueueItem {
  action: string
  arguments: any[]
}

/** Aplus实例类型 */
export interface AplusInstance {
  aplus_queue: AplusQueueItem[]
}

/** 应用实例类型 */
export interface AppInstance {
  aplus?: AplusInstance
  aplus_queue?: AplusQueueItem[]
  globalData: {
    shellVersion?: string
  }
}

/** 用户信息类型 */
export interface UserInfo {
  phone?: string
}

/** 页面曝光参数类型 */
export interface ReportPagesParams {
  isSales: boolean
  isEdit: boolean
}

/** 卡片详情上报参数类型 */
export interface ReportCardDetailParams {
  [key: string]: any
}

/** 编辑模式曝光参数类型 */
export interface ReportEditModeParams {
  info: {
    baseInfo: {
      hrUserId: string
    }
  }
}

export interface DeviceInfoReport {
  host: {
    env: string
  }
  platform: string
}
