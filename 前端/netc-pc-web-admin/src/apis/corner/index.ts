import { http } from '@/utils/request/request'
import type { CornerItem } from './types'

/** 获取菜单角标列表（失败静默 toast:false，不阻塞主流程） */
export function getCornerResult() {
  return http<CornerItem[]>('web.user.userCornerInfo.getCornerResult', {}, { toast: false })
}

/** 上报角标点击（服务端消除） */
export function reportUserClickEvent(params: { cornerId: number }) {
  return http<void>('web.user.userCornerInfo.userClickEvent', params, { toast: false })
}
