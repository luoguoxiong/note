/**
 * 切换部门组件 API
 * 来源: netc-pc-web/src/services/api/admin.js + store/modules/permission.js update_department_list
 */
import { http } from '@/utils/request/request'
import { uamDepartmentGetMoreDepartment } from '@/stores/pc-web/deps/api'
import type { HttpResponse } from '@/utils/types'

export type LegacyResponse<T = any> = HttpResponse<T> & Record<string, any>

/** 部门列表项(侧边栏部门) */
export interface DepartmentItem {
  departmentName: string
  departmentCode: string
  /** 是否当前部门 */
  current?: boolean
  [key: string]: any
}

/** 侧边栏部门列表(复用 pc-web deps 已有封装, 老权限 store.update_department_list 数据源) */
export { uamDepartmentGetMoreDepartment }

/** 切换当前部门 web.uam.userCenter.department.changeCurrentDepartment */
export const uamDepartmentChangeCurrentDepartmentApi = (params: {
  toDepartmentCode: string
  customerCode: string
  source: number
}) => {
  return http<null>('web.uam.userCenter.department.changeCurrentDepartment', params, {
    retryCount: 0,
  }) as Promise<LegacyResponse<null>>
}
