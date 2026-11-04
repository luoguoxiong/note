export interface ApplicationItem {
  menuName?: string
  areaCode?: string
  menuCode: string
  customParam: string
  loadAddress: string
  /** 接入方式 0-H5、1-内部路由 2-小程序 */
  applicationCode: string
  accessMode: 0 | 1 | 2
  smallIcon: string
  [key: string]: any
}

// 区域轻应用数据
export interface AreaItem {
  areaCode: string
  areaName: string
  lightApplicationInfos?: ApplicationItem[] | null
}

export type ApplicationMarkData = {
  menuCode: string
  smallIcon: string | null
  smallIconContent: string | null
  smallIconType: 0 | 10 | 20 | 30 | 40
}

export interface AreaMarkItem {
  areaCode: string
  areaName: string
  lightApplicationInfos?: ApplicationMarkData[]
}
