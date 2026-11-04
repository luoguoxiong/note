/**
 * 添加/切换客户编码按钮组件 API
 * 来源: netc-pc-web/src/services/api/login.js unbindByCustomerCode
 * (绑码/权限接口复用 @/views/home/module/module-customer-code/api.ts)
 */
import { http } from '@/utils/request/request'
import type { HttpResponse } from '@/utils/types'

/** 旧基座统一响应结构(含扩展字段) */
export type LegacyResponse<T = any> = HttpResponse<T> & Record<string, any>

/** 解除绑定的客户编码 web.uam.uamAppUser.unbindByCustomerCode */
export const unbindByCustomerCodeApi = (params: { customerCode: string; operatorSource: string }) => {
  return http<null>('web.uam.uamAppUser.unbindByCustomerCode', params, {
    retryCount: 0,
  }) as Promise<LegacyResponse<null>>
}
