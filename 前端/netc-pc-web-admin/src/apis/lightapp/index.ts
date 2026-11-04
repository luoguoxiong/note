import type { MenuItem } from '@/stores/mock'
import { http, type HttpRequestOptions } from '@/utils/request/request'

export interface GetApplicationInfoListReq {
  channelCode: string
  areaCodes: string[]
  shellVersion: string
}

export interface LightAppInfo {
  menuName: string
  menuCode: string
  applicationCode: string
  menuIcon: string
  smallIcon: string
  menuBackground: string
  menuFolderScreenIcon: null
  menuContent: string
  routePath: string
  accessMode: number
  versionNumber: string
  loadAddress: string
  downloadUrl: string
  menuCustomParam: string
  customParam: string
  releaseInfo: string
  releaseType: number
  customizedType: number
  loginType: number
  internalStaffType: number
  customerCodeType: number
  md5: string
  dependentVersion: string
  sort: number
  versionConfigId: number
  accessOfflinePackage: number
  maxMenuCount: number
  tips: null | string
  buildType: null | string
  menuIconType: number
  menuIconContent: null
  smallIconType: number
  smallIconContent: null
  versionCustomParam: null
  needGray: number
  grayHeader: string[]
  description: null | string
  children?: LightAppInfo[]
}

export function getApplicationInfoList() {
  return http<LightAppInfo[]>('web.lightApplication.getApplicationInfoList', {
    channelCode: 'pc',
    areaCodes: ['A3001'],
    shellVersion: '1.21.0318.01',
  })
}

export interface QueryAreaMenuVo {
  areaCode: string
  menus: MenuItem[]
}

export interface QueryAreaMenuListRes {
  forceOnlineH5: boolean
  vos: QueryAreaMenuVo[]
}

export interface QueryAreaMenuListReq {
  /** 区域编码 */
  areaCodes: string[]
  /** 渠道编码 */
  channelCode: string
  /** 菜单编码（空数组 = 不过滤，返回区域内全部菜单） */
  menuCodes: string[]
}

/** 区域菜单查询（按区域返回菜单分组） */
export function queryAreaMenuList(params: QueryAreaMenuListReq, options?: HttpRequestOptions) {
  return http<QueryAreaMenuListRes>('web.lightApplication.getApplicationInfoListByArea', params, options)
}
