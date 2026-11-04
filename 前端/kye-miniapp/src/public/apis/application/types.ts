import { ApplicationItem, AreaItem } from '@public/utils/application/applicationType'

export interface ApplicationListRequestParam {
  shellVersion?: string
  menuCodes?: string[]
  areaCodes?: string[]
  applicationVersion?: string
  updateTime?: number
  forceCheck?: ApplicationForceCheck
}

export interface CheckLoginRequestParam {
  // source?: number
  // from: string
}

// interface KeyValuePair {
//   [key: string]: any
// }

export interface ApplicationListResponseData {
  forceOnlineH5: boolean
  updateTime: number
  vos: AreaItem[]
}

export type ApplicationForceCheck = '0' | '1'

export interface WebUserNativeLightAppListOut {
  /**
   * 更新时间戳  （如 1645582778536）
   */
  updateTime?: number
  /**
   * 集合数据
   */
  vos?: Array<AreaItem>
  /**
   * 强制访问h5开关 true=访问h5；false=离线包
   */
  forceOnlineH5?: boolean
}

export interface ApplicationListRequestParamNew {
  pageCode?: string
  menuCodes?: string[]
  areaCodes?: string[]
  applicationCodeList?: string[]
}

export interface ApplicationListRequestParamNewRes {
  waybillStat?: {
    waitNoticeNum: number
  }
  menuList?: ApplicationItem[]
  lightAppInfo?: WebUserNativeLightAppListOut
}
